import { afterEach, describe, expect, it } from "vitest";
import { validateEnvironment } from "../../../app/services/Env";

const originalEnv = { ...process.env };

afterEach(() => {
	process.env = { ...originalEnv };
});

describe("production environment validation", () => {
	it("allows development without production-only variables", () => {
		process.env.NODE_ENV = "development";
		process.env.DB_CONNECTION = "development";
		delete process.env.APP_URL;

		const result = validateEnvironment();
		expect(result.ok).toBe(true);
		expect(result.errors).toEqual([]);
	});

	it("rejects unsafe production configuration", () => {
		process.env.NODE_ENV = "production";
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
		process.env.NODE_ENV = "production";
		process.env.DB_CONNECTION = "production";
		process.env.APP_URL = "https://uang-kita.example.com";
		process.env.PORT = "5555";
		process.env.DB_PATH = "/var/lib/uang-kita/production.sqlite3";
		process.env.LOCAL_STORAGE_PATH = "/var/lib/uang-kita/storage";

		const result = validateEnvironment();
		expect(result.ok).toBe(true);
		expect(result.errors).toEqual([]);
	});
});
