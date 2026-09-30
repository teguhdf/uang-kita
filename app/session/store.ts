/**
 * Session Store
 * Manages HTTP sessions with database persistence and a short in-memory cache.
 */

import { randomUUID } from "crypto";
import type { Request, Response } from "../../type";
import SessionRepository from "../repositories/session.repository";
import type { SessionData } from "./session";
import { emptySessionData } from "./session";

interface CacheEntry {
	data: SessionData;
	expiresAt: number;
}

const sessionCache = new Map<string, CacheEntry>();

const CACHE_TTL_MS = 5 * 60 * 1000;
const SESSION_TTL_MS = 60 * 24 * 60 * 60 * 1000;
const SESSION_COOKIE = "auth_id";

function cookieOptions(httpOnly = true) {
	return {
		httpOnly,
		secure: process.env.NODE_ENV === "production",
		sameSite: "lax" as const,
		path: "/",
	};
}

function setCookie(
	res: Response,
	name: string,
	value: string,
	maxAgeMs: number,
	httpOnly = true,
): void {
	(res as any).cookie(name, value, maxAgeMs, cookieOptions(httpOnly));
}

function clearCookie(res: Response, name: string): void {
	(res as any).cookie(name, "", 0, cookieOptions(true));
}

export const SessionStore = {
	get(req: Request): SessionData {
		const sessionId = req.cookies?.[SESSION_COOKIE];
		if (!sessionId) return emptySessionData();

		const cached = sessionCache.get(sessionId);
		if (cached && cached.expiresAt > Date.now()) {
			return { ...cached.data };
		}
		if (cached) sessionCache.delete(sessionId);

		try {
			const row = SessionRepository.findById(sessionId);
			if (!row) return emptySessionData();

			if (row.expires_at && new Date(row.expires_at) < new Date()) {
				SessionRepository.delete(sessionId);
				sessionCache.delete(sessionId);
				return emptySessionData();
			}

			const data = JSON.parse(row.data || "{}") as SessionData;
			sessionCache.set(sessionId, {
				data: { ...data },
				expiresAt: Date.now() + CACHE_TTL_MS,
			});
			return { ...data };
		} catch {
			return emptySessionData();
		}
	},

	create(res: Response, data: SessionData): string {
		const sessionId = randomUUID();
		const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();

		SessionRepository.create(
			sessionId,
			data.user_id,
			JSON.stringify(data),
			expiresAt,
			"",
		);

		sessionCache.set(sessionId, {
			data: { ...data },
			expiresAt: Date.now() + CACHE_TTL_MS,
		});
		setCookie(res, SESSION_COOKIE, sessionId, SESSION_TTL_MS, true);
		return sessionId;
	},

	save(req: Request, data: SessionData): void {
		const sessionId = req.cookies?.[SESSION_COOKIE];
		if (!sessionId) return;

		const expiresAt = new Date(Date.now() + SESSION_TTL_MS).toISOString();
		SessionRepository.update(sessionId, JSON.stringify(data), expiresAt);
		sessionCache.set(sessionId, {
			data: { ...data },
			expiresAt: Date.now() + CACHE_TTL_MS,
		});
	},

	destroy(req: Request, res: Response): void {
		const sessionId = req.cookies?.[SESSION_COOKIE];
		if (sessionId) {
			SessionRepository.delete(sessionId);
			sessionCache.delete(sessionId);
		}
		clearCookie(res, SESSION_COOKIE);
	},

	destroyAllForUser(userId: string): void {
		SessionRepository.deleteByUserId(userId);
		for (const [sessionId, entry] of sessionCache.entries()) {
			if (entry.data.user_id === userId) sessionCache.delete(sessionId);
		}
	},

	flash(res: Response, key: string, message: string): void {
		setCookie(res, key, message, 5000, true);
	},

	getFlash(req: Request): Record<string, string> {
		const types = ["error", "success", "info", "warning"];
		const messages: Record<string, string> = {};
		const cookies = req.cookies || {};

		for (const type of types) {
			if (cookies[type]) messages[type] = cookies[type];
		}
		return messages;
	},

	redirect(res: Response, url: string): void {
		if (!url.startsWith("/")) url = "/login";
		res.status(303).setHeader("Location", url).send();
	},
};

export default SessionStore;
