import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import {
	decisionRuleSchema,
	monthlyPlanSchema,
	partnerInviteSchema,
} from "../validators/uang-kita.validator";

export const UangKitaHandler = {
	async onboardingPage(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const overview = await UangKitaService.getOverview(request.user.id);
		return inertia.render(request, response, "onboarding", {
			overview,
		});
	},

	async saveOnboarding(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

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
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const overview = await UangKitaService.getOverview(request.user.id);
		if (!overview?.plan || !overview.metrics) {
			inertia.flash(
				response,
				"error",
				"Susun kondisi bulan ini dulu sebelum mencoba simulasi pembelian.",
			);
			return inertia.redirect(response, "/onboarding");
		}

		return inertia.render(request, response, "purchase-simulator", {
			overview,
		});
	},

	async decisionRulesPage(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const overview = await UangKitaService.getOverview(request.user.id);
		if (!overview?.plan) {
			inertia.flash(
				response,
				"error",
				"Susun kondisi bulan ini dulu sebelum membuat aturan keputusan.",
			);
			return inertia.redirect(response, "/onboarding");
		}

		return inertia.render(request, response, "decision-rules", {
			overview,
		});
	},

	async saveDecisionRules(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const body = await request.json();
		const validationResult = Validator.validate(decisionRuleSchema, body);

		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError =
				Object.values(errors)[0]?.[0] || "Aturan keputusan belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/aturan-keputusan");
		}

		await UangKitaService.saveDecisionRule(
			request.user.id,
			validationResult.data!,
		);
		inertia.flash(response, "success", "Aturan keputusan kalian sudah tersimpan.");
		return inertia.redirect(response, "/aturan-keputusan");
	},

	async invitePartner(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

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
				`Undangan disiapkan untuk ${email}. Minta pasangan daftar atau login dengan email itu.`,
			);
		} catch (error) {
			const message = error instanceof Error && error.message === "Partner already connected"
				? "Akun pasangan sudah terhubung."
				: "Undangan pasangan belum bisa disimpan.";
			inertia.flash(response, "error", message);
		}

		return inertia.redirect(response, "/aturan-keputusan");
	},
};

export default UangKitaHandler;
