import type { Request, Response } from "../../type";
import inertia from "../services/inertia";
import Validator from "../services/Validator";
import WeeklyCheckinService from "../services/WeeklyCheckinService";
import { weeklyCheckinSchema } from "../validators/uang-kita.validator";

export const WeeklyCheckinHandler = {
	async page(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });

		const summary = await WeeklyCheckinService.getSummary(request.user.id);
		if (!summary) {
			inertia.flash(
				response,
				"error",
				"Susun kondisi bulan ini dulu sebelum memulai obrolan mingguan.",
			);
			return inertia.redirect(response, "/onboarding");
		}

		return inertia.render(request, response, "weekly-checkin", { summary });
	},

	async save(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });

		const body = await request.json();
		const validationResult = Validator.validate(weeklyCheckinSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Jawaban belum lengkap";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/mingguan");
		}

		try {
			await WeeklyCheckinService.save(request.user.id, validationResult.data!);
			inertia.flash(
				response,
				"success",
				validationResult.data!.status === "aman"
					? "Obrolan minggu ini tersimpan. Kalian sepakat untuk lanjut."
					: "Obrolan minggu ini tersimpan. Ada hal yang perlu kalian bahas bersama.",
			);
		} catch (error) {
			let message = "Obrolan mingguan belum bisa disimpan. Coba lagi.";
			if (error instanceof Error && error.message === "Weekly check-in not due") {
				message = "Obrolan minggu ini sudah dilakukan. Kalian bisa kembali lagi pekan depan.";
			} else if (error instanceof Error && error.message === "Plan not found") {
				message = "Rencana bulan ini belum tersedia.";
			}
			inertia.flash(response, "error", message);
		}

		return inertia.redirect(response, "/mingguan");
	},
};

export default WeeklyCheckinHandler;
