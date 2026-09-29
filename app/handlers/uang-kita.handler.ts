import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import {
	decisionRuleSchema,
	monthlyPlanSchema,
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
};

export default UangKitaHandler;
