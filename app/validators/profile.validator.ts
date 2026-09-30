import { z } from "zod";
import { field } from "./common.validator";

export const updateProfileSchema = z.object({
	name: field.name,
	email: field.email,
	phone: z
		.string()
		.nullish()
		.refine(
			(val) => !val || /^(\+62|62|0)[0-9]{9,12}$/.test(val.trim()),
			"Format nomor HP tidak valid",
		),
	avatar: z
		.string()
		.nullish()
		.refine(
			(val) => !val || /^\/storage\/[A-Za-z0-9._-]+$/.test(val),
			"Lokasi foto profil tidak valid",
		),
});

export const deleteUsersSchema = z.object({
	ids: z.array(z.string().min(1)).min(1, "Pilih minimal 1 pengguna"),
});
