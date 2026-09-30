/**
 * Rate Limit Middleware
 * Provides flexible rate limiting for routes
 */

import type { Request, Response } from "../../type";
import rateLimiter from "../services/RateLimiter";
import { logWarn } from "../services/Logger";
import inertia from "../services/inertia";

/**
 * Get client IP from reverse proxy headers.
 * Nginx overwrites X-Real-IP, so prefer it over client-supplied forwarding headers.
 */
function getClientIP(request: Request): string {
	return (
		(request.headers["x-real-ip"] as string) ||
		(request.headers["cf-connecting-ip"] as string) ||
		request.ip ||
		"unknown"
	);
}

function routeScopedKey(prefix: string, request: Request): string {
	const pathname = (request.url || "").split("?")[0] || "/";
	return `${prefix}:${pathname}:${getClientIP(request)}`;
}

export interface RateLimitOptions {
	windowMs?: number; // Time window (default: 15 minutes)
	maxRequests?: number; // Max requests per window (default: 100)
	message?: string; // Custom error message
	statusCode?: number; // HTTP status code (default: 429)
	keyGenerator?: (request: Request) => string; // Custom key generator
	skip?: (request: Request) => boolean; // Skip rate limiting
	handler?: (request: Request, response: Response) => void; // Custom handler
}

/** Create rate limit middleware */
export function rateLimit(options: RateLimitOptions = {}) {
	const config = {
		windowMs: options.windowMs || 15 * 60 * 1000,
		maxRequests: options.maxRequests || 100,
		message: options.message || "Too many requests, please try again later",
		statusCode: options.statusCode || 429,
		keyGenerator:
			options.keyGenerator || ((request: Request) => `general:${getClientIP(request)}`),
		skip: options.skip || (() => false),
		handler: options.handler,
	};

	return async (request: Request, response: Response) => {
		if (config.skip(request)) return;

		const key = config.keyGenerator(request);
		const result = rateLimiter.check(key, {
			windowMs: config.windowMs,
			maxRequests: config.maxRequests,
			message: config.message,
		});

		response.setHeader("X-RateLimit-Limit", config.maxRequests.toString());
		response.setHeader("X-RateLimit-Remaining", result.remaining.toString());
		response.setHeader("X-RateLimit-Reset", new Date(result.resetAt).toISOString());

		if (!result.allowed) {
			response.setHeader("Retry-After", result.retryAfter?.toString() || "60");

			logWarn("Rate limit exceeded", {
				ip: getClientIP(request),
				url: request.url,
				method: request.method,
				key,
				retryAfter: result.retryAfter,
			});

			if (config.handler) return config.handler(request, response);

			return response.status(config.statusCode).json({
				success: false,
				error: {
					message: config.message,
					code: "RATE_LIMIT_EXCEEDED",
					statusCode: config.statusCode,
					retryAfter: result.retryAfter,
				},
			});
		}
	};
}

export const authRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	maxRequests: 5,
	message: "Too many login attempts, please try again later",
	keyGenerator: (request) => routeScopedKey("auth", request),
	handler: (request: Request, response: Response) => {
		const isResetPassword = request.url.includes("/reset-password");
		const redirectPath = isResetPassword ? "/forgot-password" : "/login";
		inertia.flash(response, "error", "Terlalu banyak percobaan. Coba lagi beberapa saat nanti.");
		return inertia.redirect(response, redirectPath);
	},
});

export const apiRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	maxRequests: 100,
	message: "Too many API requests, please try again later",
	keyGenerator: (request) => routeScopedKey("api", request),
});

export const generalRateLimit = rateLimit({
	windowMs: 15 * 60 * 1000,
	maxRequests: 1000,
	message: "Too many requests, please try again later",
	keyGenerator: (request) => routeScopedKey("general", request),
});

export const passwordResetRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	maxRequests: 3,
	message: "Too many password reset attempts, please try again later",
	keyGenerator: (request) => routeScopedKey("password-reset", request),
	handler: (_request: Request, response: Response) => {
		inertia.flash(response, "error", "Terlalu banyak permintaan reset kata sandi. Coba lagi nanti.");
		return inertia.redirect(response, "/forgot-password");
	},
});

export const emailRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	maxRequests: 10,
	message: "Too many emails sent, please try again later",
	keyGenerator: (request) => {
		const userId = request.user?.id || getClientIP(request);
		return `email:${userId}`;
	},
});

export const uploadRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	maxRequests: 50,
	message: "Too many file uploads, please try again later",
	keyGenerator: (request) => {
		const userId = request.user?.id || getClientIP(request);
		return `upload:${userId}`;
	},
});

export const createAccountRateLimit = rateLimit({
	windowMs: 60 * 60 * 1000,
	maxRequests: 3,
	message: "Too many account creation attempts, please try again later",
	keyGenerator: (request) => routeScopedKey("register", request),
	handler: (_request: Request, response: Response) => {
		inertia.flash(response, "error", "Terlalu banyak percobaan membuat akun. Coba lagi nanti.");
		return inertia.redirect(response, "/register");
	},
});

export const userRateLimit = (
	maxRequests: number = 100,
	windowMs: number = 15 * 60 * 1000,
) => {
	return rateLimit({
		windowMs,
		maxRequests,
		keyGenerator: (request) => {
			const userId = request.user?.id || getClientIP(request);
			return `user:${userId}`;
		},
		skip: (request) => !request.user,
	});
};

export const customRateLimit = (
	key: string,
	maxRequests: number = 100,
	windowMs: number = 15 * 60 * 1000,
) => {
	return rateLimit({
		windowMs,
		maxRequests,
		keyGenerator: () => `custom:${key}`,
	});
};

export default rateLimit;
