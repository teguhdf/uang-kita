/**
 * Auth Handler
 * Handles authentication-related HTTP requests.
 */

import { UserRepository } from "../repositories/user.repository";
import { PasswordResetRepository } from "../repositories/password-reset.repository";
import { SessionStore } from "../session/store";
import Authenticate from "../services/Authenticate";
import UangKitaService from "../services/UangKitaService";
import Validator from "../services/Validator";
import {
	loginSchema,
	registerSchema,
	forgotPasswordSchema,
	resetPasswordSchema,
	changePasswordSchema,
} from "../validators/auth.validator";
import { MailTo } from "../services/Resend";
import { redirectParamsURL } from "../services/GoogleAuth";
import inertia from "../services/inertia";
import type { Response, Request, User } from "../../type";
import { randomBytes, randomUUID } from "crypto";
import dayjs from "dayjs";
import axios from "axios";

async function postLoginPath(user: User): Promise<string> {
	try {
		const pending = await UangKitaService.getPendingPartnerInvite(user.id);
		return pending ? "/undangan-pasangan" : "/home";
	} catch (error) {
		console.error("UANG KITA invite lookup error:", error);
		return "/home";
	}
}

function googleOAuthEnabled(): boolean {
	return (
		process.env.ENABLE_GOOGLE_OAUTH === "true" &&
		Boolean(process.env.GOOGLE_CLIENT_ID) &&
		Boolean(process.env.GOOGLE_CLIENT_SECRET) &&
		Boolean(process.env.GOOGLE_REDIRECT_URI)
	);
}

function recoveryAvailable(): boolean {
	return Boolean(process.env.RESEND_API_KEY || process.env.DRIPSENDER_API_KEY);
}

export const AuthHandler = {
	async loginPage(request: Request, response: Response) {
		if (SessionStore.get(request).user_id) {
			response.redirect("/home");
			return;
		}
		return inertia.render(request, response, "auth/login");
	},

	async processLogin(request: Request, response: Response) {
		try {
			const body = await request.json();
			const validationResult = Validator.validate(loginSchema, body);
			if (!validationResult.success) {
				const errors = validationResult.errors || {};
				const firstError = Object.values(errors)[0]?.[0] || "Data masuk belum valid";
				inertia.flash(response, "error", firstError);
				return inertia.redirect(response, "/login");
			}

			const { email, password } = validationResult.data!;
			const user = await UserRepository.findByEmail(email.trim().toLowerCase());
			if (!user) {
				inertia.flash(response, "error", "Email atau kata sandi tidak sesuai.");
				return inertia.redirect(response, "/login");
			}

			const passwordMatch = await Authenticate.compare(password, user.password);
			if (!passwordMatch) {
				inertia.flash(response, "error", "Email atau kata sandi tidak sesuai.");
				return inertia.redirect(response, "/login");
			}

			return Authenticate.process(user, request, response, await postLoginPath(user));
		} catch (error) {
			console.error("Login error:", error);
			inertia.flash(response, "error", "Login belum berhasil. Coba lagi beberapa saat nanti.");
			return inertia.redirect(response, "/login");
		}
	},

	async registerPage(request: Request, response: Response) {
		if (SessionStore.get(request).user_id) {
			response.redirect("/home");
			return;
		}
		return inertia.render(request, response, "auth/register");
	},

	async processRegister(request: Request, response: Response) {
		try {
			const body = await request.json();
			const validationResult = Validator.validate(registerSchema, body);
			if (!validationResult.success) {
				const errors = validationResult.errors || {};
				const firstError = Object.values(errors)[0]?.[0] || "Data pendaftaran belum valid";
				inertia.flash(response, "error", firstError);
				return inertia.redirect(response, "/register");
			}

			const { password, name, phone } = validationResult.data!;
			const email = validationResult.data!.email.trim().toLowerCase();
			const existingUser = await UserRepository.findByEmail(email);
			if (existingUser) {
				inertia.flash(response, "error", "Email sudah terdaftar. Silakan masuk.");
				return inertia.redirect(response, "/register");
			}

			const user = await UserRepository.create({
				id: randomUUID(),
				email,
				password: await Authenticate.hash(password),
				name: name.trim(),
				phone: phone?.trim() || null,
			});

			return Authenticate.process(user, request, response);
		} catch (error: any) {
			console.error("Registration error:", error);
			if (String(error?.code || "").startsWith("SQLITE_CONSTRAINT")) {
				inertia.flash(response, "error", "Email sudah terdaftar. Silakan masuk.");
				return inertia.redirect(response, "/register");
			}
			inertia.flash(response, "error", "Pendaftaran belum berhasil. Coba lagi beberapa saat nanti.");
			return inertia.redirect(response, "/register");
		}
	},

	async logout(request: Request, response: Response) {
		await Authenticate.logout(request, response);
	},

	async googleRedirect(_request: Request, response: Response) {
		if (!googleOAuthEnabled()) {
			inertia.flash(response, "error", "Masuk dengan Google belum diaktifkan.");
			return inertia.redirect(response, "/login");
		}
		const params = redirectParamsURL();
		const googleLoginUrl = `https://accounts.google.com/o/oauth2/v2/auth?${params}`;
		response.status(302).setHeader("Location", googleLoginUrl).send();
	},

	async googleCallback(request: Request, response: Response) {
		if (!googleOAuthEnabled()) {
			inertia.flash(response, "error", "Masuk dengan Google belum diaktifkan.");
			return inertia.redirect(response, "/login");
		}

		try {
			const { code } = request.query;
			if (!code || typeof code !== "string") throw new Error("Missing OAuth code");

			const { data } = await axios({
				url: "https://oauth2.googleapis.com/token",
				method: "post",
				data: {
					client_id: process.env.GOOGLE_CLIENT_ID,
					client_secret: process.env.GOOGLE_CLIENT_SECRET,
					redirect_uri: process.env.GOOGLE_REDIRECT_URI,
					grant_type: "authorization_code",
					code,
				},
				timeout: 10000,
			});

			const result = await axios({
				url: "https://www.googleapis.com/oauth2/v2/userinfo",
				method: "get",
				headers: { Authorization: `Bearer ${data.access_token}` },
				timeout: 10000,
			});

			let { email, name, verified_email } = result.data;
			if (!email || !verified_email) throw new Error("Google email is not verified");
			email = String(email).trim().toLowerCase();

			let user = await UserRepository.findByEmail(email);
			if (!user) {
				user = await UserRepository.create({
					id: randomUUID(),
					email,
					password: await Authenticate.hash(randomBytes(32).toString("hex")),
					name: name || null,
					phone: null,
					avatar: null,
					is_verified: 1,
					is_admin: 0,
				});
			}

			return Authenticate.process(user, request, response, await postLoginPath(user));
		} catch (error) {
			console.error("Google OAuth error:", error);
			inertia.flash(response, "error", "Masuk dengan Google belum berhasil.");
			return inertia.redirect(response, "/login");
		}
	},

	async forgotPasswordPage(request: Request, response: Response) {
		return inertia.render(request, response, "auth/forgot-password");
	},

	async sendResetPassword(request: Request, response: Response) {
		if (!recoveryAvailable()) {
			inertia.flash(response, "error", "Pemulihan kata sandi belum aktif. Hubungi pengelola UANG KITA.");
			return inertia.redirect(response, "/forgot-password");
		}

		const body = await request.json();
		const validationResult = Validator.validate(forgotPasswordSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Email belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/forgot-password");
		}

		const { email } = validationResult.data!;
		const user = await UserRepository.findByEmail(email.trim().toLowerCase());

		if (!user) {
			inertia.flash(response, "success", "Jika akun terdaftar, instruksi pemulihan akan dikirim.");
			return inertia.redirect(response, "/forgot-password");
		}

		PasswordResetRepository.deleteByEmail(user.email);
		const token = randomUUID();
		PasswordResetRepository.create(user.email, token, dayjs().add(24, "hours").toISOString());
		const resetUrl = `${process.env.APP_URL}/reset-password/${token}`;
		let delivered = false;

		if (process.env.RESEND_API_KEY) {
			try {
				await MailTo({
					to: user.email,
					subject: "Pulihkan kata sandi UANG KITA",
					text: `Gunakan tautan berikut untuk membuat kata sandi baru:\n\n${resetUrl}\n\nTautan ini berlaku 24 jam. Jika kamu tidak meminta reset, abaikan email ini.`,
				});
				delivered = true;
			} catch (error) {
				console.error("Email send error:", error);
			}
		}

		if (process.env.DRIPSENDER_API_KEY && user.phone) {
			try {
				await axios.post(
					"https://api.dripsender.id/send",
					{
						api_key: process.env.DRIPSENDER_API_KEY,
						phone: user.phone,
						text: `Pulihkan kata sandi UANG KITA: ${resetUrl}. Tautan berlaku 24 jam.`,
					},
					{ timeout: 10000 },
				);
				delivered = true;
			} catch (error) {
				console.error("SMS send error:", error);
			}
		}

		if (!delivered) {
			PasswordResetRepository.delete(token);
			inertia.flash(response, "error", "Instruksi pemulihan belum bisa dikirim. Coba lagi nanti.");
			return inertia.redirect(response, "/forgot-password");
		}

		inertia.flash(response, "success", "Jika akun terdaftar, instruksi pemulihan akan dikirim.");
		return inertia.redirect(response, "/forgot-password");
	},

	async resetPasswordPage(request: Request, response: Response) {
		const id = request.params.id;
		const token = PasswordResetRepository.findByToken(id);
		if (!token) {
			inertia.flash(response, "error", "Tautan reset tidak valid atau sudah kedaluwarsa.");
			return inertia.redirect(response, "/forgot-password");
		}
		return inertia.render(request, response, "auth/reset-password", { id });
	},

	async resetPassword(request: Request, response: Response) {
		const body = await request.json();
		const validationResult = Validator.validate(resetPasswordSchema, body);
		const fallbackId = typeof body?.id === "string" ? body.id : "";

		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Kata sandi baru belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, fallbackId ? `/reset-password/${fallbackId}` : "/forgot-password");
		}

		const { id, password } = validationResult.data!;
		const token = PasswordResetRepository.findByToken(id);
		if (!token) {
			inertia.flash(response, "error", "Tautan reset tidak valid atau sudah kedaluwarsa.");
			return inertia.redirect(response, "/forgot-password");
		}

		const user = await UserRepository.findByEmail(token.email);
		if (!user) {
			PasswordResetRepository.delete(token.token);
			inertia.flash(response, "error", "Akun tidak ditemukan.");
			return inertia.redirect(response, "/login");
		}

		await UserRepository.updatePassword(user.id, await Authenticate.hash(password));
		PasswordResetRepository.deleteByEmail(user.email);
		SessionStore.destroyAllForUser(user.id);
		inertia.flash(response, "success", "Kata sandi berhasil diperbarui.");
		return Authenticate.process(user, request, response, await postLoginPath(user));
	},

	async changePassword(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const body = await request.json();
		const validationResult = Validator.validate(changePasswordSchema, body);
		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Kata sandi baru belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/profile");
		}

		const validated = validationResult.data!;
		const user = await UserRepository.findById(request.user.id);
		if (!user) {
			SessionStore.destroy(request, response);
			return SessionStore.redirect(response, "/login");
		}

		const passwordMatch = await Authenticate.compare(validated.current_password, user.password);
		if (!passwordMatch) {
			inertia.flash(response, "error", "Kata sandi saat ini tidak cocok.");
			return inertia.redirect(response, "/profile");
		}

		await UserRepository.updatePassword(user.id, await Authenticate.hash(validated.new_password));
		SessionStore.destroyAllForUser(user.id);
		inertia.flash(response, "success", "Kata sandi berhasil diubah. Sesi lain sudah dikeluarkan.");
		return Authenticate.process(user, request, response, "/profile");
	},
};

export default AuthHandler;
