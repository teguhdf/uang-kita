/**
 * App Handler
 * Handles application pages (dashboard, profile, user management)
 */

import { UserRepository } from "../repositories/user.repository";
import { SessionStore } from "../session/store";
import Validator from "../services/Validator";
import UangKitaService from "../services/UangKitaService";
import {
	updateProfileSchema,
	deleteUsersSchema,
} from "../validators/profile.validator";
import type { Response, Request } from "../../type";
import inertia from "../services/inertia";

function safeUser(user: Awaited<ReturnType<typeof UserRepository.findById>>) {
	if (!user) return null;
	return {
		id: user.id,
		name: user.name,
		email: user.email,
		phone: user.phone,
		avatar: user.avatar,
		is_verified: user.is_verified,
		is_admin: user.is_admin,
	};
}

export const AppHandler = {
	async homePage(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const overview = await UangKitaService.getOverview(request.user.id);
		return inertia.render(request, response, "home", { overview });
	},

	async profilePage(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const fullUser = await UserRepository.findById(request.user.id);
		if (!fullUser) {
			SessionStore.destroy(request, response);
			return SessionStore.redirect(response, "/login");
		}

		return inertia.render(request, response, "profile", {
			user: safeUser(fullUser),
		});
	},

	async changeProfile(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const body = await request.json();
		const validationResult = Validator.validate(updateProfileSchema, body);

		if (!validationResult.success) {
			const errors = validationResult.errors || {};
			const firstError = Object.values(errors)[0]?.[0] || "Data profil belum valid";
			inertia.flash(response, "error", firstError);
			return inertia.redirect(response, "/profile");
		}

		const currentUser = await UserRepository.findById(request.user.id);
		if (!currentUser) {
			SessionStore.destroy(request, response);
			return SessionStore.redirect(response, "/login");
		}

		const data = validationResult.data!;
		const email = data.email.trim().toLowerCase();
		const name = data.name.trim();
		const phone = data.phone?.trim() || null;
		const avatar = data.avatar || null;
		const emailChanged = currentUser.email.toLowerCase() !== email;

		const emailOwner = await UserRepository.findByEmail(email);
		if (emailOwner && emailOwner.id !== request.user.id) {
			inertia.flash(response, "error", "Email tersebut sudah dipakai akun lain.");
			return inertia.redirect(response, "/profile");
		}

		try {
			await UserRepository.updateProfile(request.user.id, {
				name,
				email,
				phone,
				avatar,
				...(emailChanged ? { is_verified: 0 } : {}),
			});
		} catch (error: any) {
			if (String(error?.code || "").startsWith("SQLITE_CONSTRAINT")) {
				inertia.flash(response, "error", "Email tersebut sudah dipakai akun lain.");
				return inertia.redirect(response, "/profile");
			}
			throw error;
		}

		const updatedUser = await UserRepository.findById(request.user.id);
		if (!updatedUser) {
			inertia.flash(response, "error", "Profil belum bisa diperbarui.");
			return inertia.redirect(response, "/profile");
		}

		const session = SessionStore.get(request);
		SessionStore.save(request, {
			...session,
			name: updatedUser.name || "",
			email: updatedUser.email,
			avatar: updatedUser.avatar || "",
			email_verified: updatedUser.is_verified === 1,
		});

		inertia.flash(response, "success", "Profil berhasil diperbarui.");
		return inertia.redirect(response, "/profile");
	},

	async deleteUsers(request: Request, response: Response) {
		if (!request.user) {
			return response.status(401).json({ error: "Unauthorized" });
		}

		const body = await request.json();
		const validationResult = Validator.validate(deleteUsersSchema, body);

		if (!validationResult.success) {
			return response.status(422).json({
				success: false,
				message: "Validation failed",
				errors: validationResult.errors,
			});
		}

		if (!request.user.is_admin) {
			return response.status(403).json({ error: "Forbidden" });
		}

		const { ids } = validationResult.data!;
		for (const id of ids) SessionStore.destroyAllForUser(id);
		await UserRepository.deleteMany(ids);

		return inertia.redirect(response, "/home");
	},
};

export default AppHandler;
