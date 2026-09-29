/**
 * Authentication Service
 * Handles user authentication operations including password hashing,
 * session management, and login/logout functionality.
 */

import { SessionStore } from "../session/store";
import type { SessionData } from "../session/session";
import type { Request, Response, User } from "../../type";
import { pbkdf2Sync, randomBytes, timingSafeEqual } from "crypto";

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = "sha512";
const SALT_SIZE = 16;

export const Authenticate = {
	async hash(password: string): Promise<string> {
		const salt = randomBytes(SALT_SIZE).toString("hex");
		const hash = pbkdf2Sync(
			password,
			salt,
			ITERATIONS,
			KEYLEN,
			DIGEST,
		).toString("hex");
		return `${salt}:${hash}`;
	},

	async compare(password: string, storedHash: string): Promise<boolean> {
		const [salt, hash] = storedHash.split(":");
		if (!salt || !hash) return false;

		const newHash = pbkdf2Sync(
			password,
			salt,
			ITERATIONS,
			KEYLEN,
			DIGEST,
		).toString("hex");

		const expected = Buffer.from(hash, "hex");
		const actual = Buffer.from(newHash, "hex");
		if (expected.length !== actual.length) return false;
		return timingSafeEqual(expected, actual);
	},

	async process(
		user: User,
		_request: Request,
		response: Response,
		redirectPath: string = "/home",
	) {
		const sessionData: SessionData = {
			user_id: user.id,
			name: user.name || "",
			email: user.email,
			avatar: user.avatar || "",
			email_verified: user.is_verified === 1,
			role: user.is_admin ? "admin" : "user",
			is_admin: user.is_admin === 1,
		};

		SessionStore.create(response, sessionData);
		SessionStore.redirect(response, redirectPath);
	},

	async logout(request: Request, response: Response) {
		SessionStore.destroy(request, response);
		SessionStore.redirect(response, "/login");
	},
};

export default Authenticate;
