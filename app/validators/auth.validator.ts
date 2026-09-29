import { z } from "zod";
import { field } from "./common.validator";

interface EmailPhoneData {
	email?: string;
	phone?: string;
}

const newPassword = z
	.string()
	.min(8, "Kata sandi minimal 8 karakter")
	.max(128, "Kata sandi terlalu panjang");

export const loginSchema = z
	.object({
		email: z.string().optional(),
		phone: z.string().optional(),
		password: z.string().min(1, "Kata sandi wajib diisi").max(128),
	})
	.refine((data: EmailPhoneData) => data.email || data.phone, {
		message: "Email atau nomor HP wajib diisi",
		path: ["email"],
	});

export const registerSchema = z.object({
	name: field.name,
	email: field.email,
	password: newPassword,
});

export const forgotPasswordSchema = z
	.object({
		email: z.string().optional(),
		phone: z.string().optional(),
	})
	.refine((data: EmailPhoneData) => data.email || data.phone, {
		message: "Email atau nomor HP wajib diisi",
		path: ["email"],
	});

export const resetPasswordSchema = z.object({
	id: z.string().min(1, "Token tidak valid"),
	password: newPassword,
});

export const changePasswordSchema = z.object({
	current_password: z.string().min(1, "Kata sandi saat ini wajib diisi").max(128),
	new_password: newPassword,
});
