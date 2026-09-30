import type { Request, Response } from "../../type";
import MonthlyResetService from "../services/MonthlyResetService";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import inertia from "../services/inertia";
import { monthlyResetSchema } from "../validators/uang-kita.validator";

export const MonthlyResetHandler = {
	async entry(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const overview = await UangKitaService.getOverview(request.user.id);

		if (overview?.plan) return inertia.redirect(response, "/rencana-lengkap");
		if (overview?.carryoverSeed) return inertia.redirect(response, "/mulai-bulan-baru");
		return inertia.redirect(response, "/rencana-lengkap");
	},

	async page(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const overview = await UangKitaService.getOverview(request.user.id);

		if (overview?.plan) {
			inertia.flash(response, "success", "Rencana bulan ini sudah aktif.");
			return inertia.redirect(response, "/home");
		}
		if (!overview?.carryoverSeed) return inertia.redirect(response, "/rencana-lengkap");

		return inertia.render(request, response, "monthly-reset", { overview });
	},

	async save(request: Request, response: Response) {
		if (!request.user) return response.status(401).json({ error: "Unauthorized" });
		const body = await request.json();
		const validationResult = Validator.validate(monthlyResetSchema, body);

		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Data bulan baru belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/mulai-bulan-baru");
		}

		try {
			await MonthlyResetService.start(request.user.id, validationResult.data!);
			inertia.flash(
				response,
				"success",
				"Bulan baru siap. Angka Aman sudah dihitung dari kondisi terbaru kalian.",
			);
			return inertia.redirect(response, "/home");
		} catch (error: any) {
			let message = "Bulan baru belum bisa dimulai. Coba lagi.";
			if (error instanceof Error && error.message === "Current period already exists") {
				message = "Rencana bulan ini sudah dibuat oleh kamu atau pasangan.";
			} else if (error instanceof Error && error.message === "Previous plan not found") {
				message = "Belum ada rencana sebelumnya yang bisa dibawa ke bulan ini.";
			} else if (error instanceof Error && error.message === "Next income date must be future") {
				message = "Tanggal pemasukan berikutnya harus setelah hari ini.";
			} else if (String(error?.code || "").startsWith("SQLITE_CONSTRAINT")) {
				message = "Rencana bulan ini baru saja dibuat. Muat ulang untuk melihat kondisi terbaru.";
			}
			inertia.flash(response, "error", message);
			return inertia.redirect(response, "/mulai-bulan-baru");
		}
	},
};

export default MonthlyResetHandler;
