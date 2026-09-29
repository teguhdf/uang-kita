import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import {
	decisionRuleSchema,
	monthlyPlanSchema,
	partnerInviteSchema,
	purchaseDecisionSchema,
} from "../validators/uang-kita.validator";

export const UangKitaHandler = {
	async onboardingPage(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const overview = await UangKitaService.getOverview(request.user.id);
		return inertia.render(request, response, "onboarding", { overview });
	},

	async saveOnboarding(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(monthlyPlanSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Data belum lengkap";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/onboarding");
		}
		await UangKitaService.saveMonthlyPlan(request.user, validationResult.data!);
		inertia.flash(response, "success", "Kondisi bulan ini sudah tersimpan.");
		return inertia.redirect(response, "/home");
	},

	async purchaseSimulatorPage(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const overview = await UangKitaService.getOverview(request.user.id);
		if (!overview?.plan || !overview.metrics) {
			inertia.flash(response, "error", "Susun kondisi bulan ini dulu sebelum mencoba simulasi pembelian.");
			return inertia.redirect(response, "/onboarding");
		}
		return inertia.render(request, response, "purchase-simulator", { overview });
	},

	async savePurchaseDecision(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(purchaseDecisionSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Keputusan belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/aman-kalau-dibeli");
		}

		try {
			await UangKitaService.recordPurchaseDecision(request.user.id, validationResult.data!);
			const outcomeMessage = {
				bought: "Pembelian dicatat. Angka Aman bulan ini sudah diperbarui.",
				later: "Keputusan 'nanti dulu' sudah disimpan.",
				cancelled: "Keputusan batal sudah disimpan.",
			}[validationResult.data!.outcome];
			inertia.flash(response, "success", outcomeMessage);
		} catch (error) {
			let message = "Keputusan belum bisa disimpan. Coba lagi.";
			if (error instanceof Error && error.message === "Purchase exceeds available money") {
				message = "Nominal pembelian lebih besar daripada uang yang tersedia saat ini.";
			} else if (error instanceof Error && error.message === "Purchase balance changed") {
				message = "Kondisi uang baru saja berubah. Muat ulang lalu cek dampaknya sekali lagi.";
			}
			inertia.flash(response, "error", message);
		}
		return inertia.redirect(response, "/aman-kalau-dibeli");
	},

	async decisionRulesPage(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const overview = await UangKitaService.getOverview(request.user.id);
		if (!overview?.plan) {
			inertia.flash(response, "error", "Susun kondisi bulan ini dulu sebelum membuat aturan keputusan.");
			return inertia.redirect(response, "/onboarding");
		}
		return inertia.render(request, response, "decision-rules", { overview });
	},

	async saveDecisionRules(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(decisionRuleSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Aturan keputusan belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/aturan-keputusan");
		}
		await UangKitaService.saveDecisionRule(request.user.id, validationResult.data!);
		inertia.flash(response, "success", "Aturan keputusan kalian sudah tersimpan.");
		return inertia.redirect(response, "/aturan-keputusan");
	},

	async invitePartner(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(partnerInviteSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Email pasangan belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/aturan-keputusan");
		}

		const email = validationResult.data!.email;
		if (email === request.user.email.toLowerCase()) {
			inertia.flash(response, "error", "Gunakan email pasangan, bukan email akun kamu sendiri.");
			return inertia.redirect(response, "/aturan-keputusan");
		}

		try {
			await UangKitaService.invitePartner(request.user.id, email);
			inertia.flash(
				response,
				"success",
				"Undangan sudah disiapkan. Saat pasangan masuk lagi, ia akan diminta menerima atau menolak koneksi ini.",
			);
		} catch (error) {
			let message = "Akun pasangan belum bisa dihubungkan.";
			if (error instanceof Error) {
				if (error.message === "Partner already connected") {
					message = "Akun pasangan sudah terhubung.";
				} else if (error.message === "Partner account not found") {
					message = "Minta pasangan membuat akun UANG KITA terlebih dulu, lalu masukkan email akun tersebut.";
				} else if (error.message === "Partner already belongs to household") {
					message = "Akun tersebut sudah terhubung ke rumah tangga UANG KITA lain.";
				} else if (error.message === "Cannot link self") {
					message = "Gunakan akun pasangan, bukan akun kamu sendiri.";
				}
			}
			inertia.flash(response, "error", message);
		}
		return inertia.redirect(response, "/aturan-keputusan");
	},

	async partnerInvitePage(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const invite = await UangKitaService.getPendingPartnerInvite(request.user.id);
		if (!invite) return inertia.redirect(response, "/home");
		return inertia.render(request, response, "partner-invite", { invite });
	},

	async acceptPartnerInvite(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const accepted = await UangKitaService.acceptPartnerInvite(request.user.id);
		if (!accepted) {
			inertia.flash(response, "error", "Undangan sudah tidak tersedia atau kondisi akun sudah berubah.");
			return inertia.redirect(response, "/home");
		}
		inertia.flash(response, "success", "Kamu sudah terhubung ke ruang UANG KITA bersama pasangan.");
		return inertia.redirect(response, "/home");
	},

	async rejectPartnerInvite(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		await UangKitaService.rejectPartnerInvite(request.user.id);
		inertia.flash(response, "success", "Undangan pasangan sudah ditolak.");
		return inertia.redirect(response, "/home");
	},
};

export default UangKitaHandler;
