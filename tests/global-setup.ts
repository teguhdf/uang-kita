/**
 * Vitest Global Setup
 * Ensures the test database schema exists before any test file is loaded.
 */

export default async function setup() {
	process.env.NODE_ENV = "test";
	process.env.DB_CONNECTION = "test";
	process.env.APP_URL = "http://localhost:5555";

	const { migrateToLatest } = await import("../app/services/Migrator");
	const results = await migrateToLatest();
	const failed = results.filter((result) => !result.success);

	if (failed.length > 0) {
		throw new Error(
			`Test database migration failed: ${failed
				.map((result) => `${result.name}: ${result.error || "unknown error"}`)
				.join("; ")}`,
		);
	}
}
