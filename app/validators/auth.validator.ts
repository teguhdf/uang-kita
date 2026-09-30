import { z } from "zod";
import { field } from "./common.validator";

const newPassword = z
	.string()
	.min(8, "Kata sandi minimal 8 karakter")
	.max(128, "Kata sandi terlalu panjang");

export const loginSchema = z.object({
	email: field.email,
	password: z.string().min(1, "Kata sandi wajib diisi").max(128),
});

export const registerSchema = z.object({
	name: field.name,
	email: field.email,
	phone: field.phone.optional(),
	password: newPassword,
});

export const forgotPasswordSchema = z.object({
	email: field.email,
});

export const resetPasswordSchema = z.object({
	id: z.string().min(1, "Token tidak valid"),
	password: newPassword,
});

export const changePasswordSchema = z.object({
	current_password: z.string().min(1, "Kata sandi saat ini wajib diisi").max(128),
	new_password: newPassword,
});
