/**
 * Authentication Service
 * Password hashing stays backward-compatible while using Node's async worker pool.
 */

import { SessionStore } from "../session/store";
import type { SessionData } from "../session/session";
import type { Request, Response, User } from "../../type";
import { pbkdf2, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";

const ITERATIONS = 100000;
const KEYLEN = 64;
const DIGEST = "sha512";
const SALT_SIZE = 16;
const pbkdf2Async = promisify(pbkdf2);

export const Authenticate = {
	async hash(password: string): Promise<string> {
		const salt = randomBytes(SALT_SIZE).toString("hex");
		const derived = await pbkdf2Async(
			password,
			salt,
			ITERATIONS,
			KEYLEN,
			DIGEST,
		);
		return `${salt}:${derived.toString("hex")}`;
	},

	async compare(password: string, storedHash: string): Promise<boolean> {
		const [salt, hash] = storedHash.split(":");
		if (!salt || !hash || !/^[0-9a-f]+$/i.test(salt) || !/^[0-9a-f]+$/i.test(hash)) {
			return false;
		}

		const derived = await pbkdf2Async(
			password,
			salt,
			ITERATIONS,
			KEYLEN,
			DIGEST,
		);
		const expected = Buffer.from(hash, "hex");
		if (expected.length !== derived.length) return false;
		return timingSafeEqual(expected, derived);
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
