import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import MoneyPulseService from "../services/MoneyPulseService";
import Validator from "../services/Validator";
import { moneyPulseSchema } from "../validators/money-pulse.validator";

export const MoneyPulseHandler = {
	async page(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const summary = await MoneyPulseService.getSummary(request.user.id);
		if (!summary) {
			inertia.flash(response, "error", "Susun kondisi bulan ini dulu sebelum memperbarui Pulse Uang.");
			return inertia.redirect(response, "/onboarding");
		}
		return inertia.render(request, response, "money-pulse", { summary });
	},

	async save(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(moneyPulseSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Nominal belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/pulse-uang");
		}

		try {
			await MoneyPulseService.savePulse(
				request.user.id,
				validationResult.data!.available_money,
			);
			inertia.flash(
				response,
				"success",
				"Pulse Uang diperbarui. Angka Aman sekarang memakai kondisi uang terbaru.",
			);
			return inertia.redirect(response, "/home");
		} catch (error) {
			let message = "Pulse Uang belum bisa disimpan. Coba lagi.";
			if (error instanceof Error && error.message === "Money pulse changed") {
				message = "Kondisi uang baru saja berubah dari perangkat lain. Muat ulang sebelum memperbarui lagi.";
			}
			inertia.flash(response, "error", message);
			return inertia.redirect(response, "/pulse-uang");
		}
	},
};

export default MoneyPulseHandler;
