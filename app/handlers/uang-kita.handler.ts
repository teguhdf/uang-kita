import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import { monthlyPlanSchema } from "../validators/uang-kita.validator";

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
};

export default UangKitaHandler;
