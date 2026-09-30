import { afterEach, describe, expect, it } from "vitest";
import { validateEnvironment } from "../../../app/services/Env";

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
});

function setMinimumProductionEnv() {
	process.env.NODE_ENV = "production";
	process.env.DB_CONNECTION = "production";
	process.env.APP_URL = "https://uang-kita.example.com";
	process.env.PORT = "5555";
	process.env.DB_PATH = "/var/lib/uang-kita/production.sqlite3";
	process.env.LOCAL_STORAGE_PATH = "/var/lib/uang-kita/storage";
	process.env.APP_TIMEZONE = "Asia/Jakarta";
	process.env.HAS_CERTIFICATE = "false";
	process.env.ENABLE_GOOGLE_OAUTH = "false";
	delete process.env.RESEND_API_KEY;
	delete process.env.DRIPSENDER_API_KEY;
	delete process.env.MAIL_FROM_ADDRESS;
}

describe("production environment validation", () => {
	it("allows development without production-only variables", () => {
		process.env.NODE_ENV = "development";
		process.env.DB_CONNECTION = "development";
		process.env.HAS_CERTIFICATE = "false";
		delete process.env.APP_URL;

		const result = validateEnvironment();
		expect(result.ok).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it("rejects unsafe production configuration", () => {
		setMinimumProductionEnv();
		process.env.DB_CONNECTION = "development";
		process.env.APP_URL = "http://localhost:5555";

		const result = validateEnvironment();
		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"DB_CONNECTION must be 'production' when NODE_ENV=production",
		);
		expect(result.errors).toContain("APP_URL must use https:// in production");
	});

	it("accepts the minimum safe production configuration", () => {
		setMinimumProductionEnv();

		const result = validateEnvironment();
		expect(result.ok).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it("requires an explicit sender when Resend is enabled", () => {
		setMinimumProductionEnv();
		process.env.RESEND_API_KEY = "re_test";

		const result = validateEnvironment();
		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"MAIL_FROM_ADDRESS is required when RESEND_API_KEY is configured",
		);
	});

	it("requires OAuth credentials when Google login is enabled", () => {
		setMinimumProductionEnv();
		process.env.ENABLE_GOOGLE_OAUTH = "true";
		delete process.env.GOOGLE_CLIENT_ID;
		delete process.env.GOOGLE_CLIENT_SECRET;
		delete process.env.GOOGLE_REDIRECT_URI;

		const result = validateEnvironment();
		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"GOOGLE_CLIENT_ID is required when Google OAuth is enabled",
		);
		expect(result.errors).toContain(
			"GOOGLE_CLIENT_SECRET is required when Google OAuth is enabled",
		);
	});

	it("requires explicit TLS files when direct TLS is enabled", () => {
		setMinimumProductionEnv();
		process.env.HAS_CERTIFICATE = "true";
		delete process.env.TLS_KEY_PATH;
		delete process.env.TLS_CERT_PATH;

		const result = validateEnvironment();
		expect(result.ok).toBe(false);
		expect(result.errors).toContain(
			"TLS_KEY_PATH is required when HAS_CERTIFICATE=true",
		);
	});
});
