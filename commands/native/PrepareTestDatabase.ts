import * as fs from "fs";
import * as path from "path";

async function main() {
	process.env.NODE_ENV = "test";
	process.env.DB_CONNECTION = "test";
	process.env.APP_URL = "http://localhost:5555";

	const dataDir = path.resolve(process.cwd(), "data");
	fs.mkdirSync(dataDir, { recursive: true });

	const testDatabase = path.join(dataDir, "test.sqlite3");
	for (const file of [
		testDatabase,
		`${testDatabase}-wal`,
		`${testDatabase}-shm`,
	]) {
		if (fs.existsSync(file)) {
			fs.rmSync(file, { force: true });
		}
	}

	const { migrateToLatest } = await import("../../app/services/Migrator");
	const results = await migrateToLatest();
	const failed = results.filter((result) => !result.success);

	if (failed.length > 0) {
		throw new Error(
			`Test database migration failed: ${failed
				.map((result) => `${result.name}: ${result.error || "unknown error"}`)
				.join("; ")}`,
		);
	}

	console.log("✓ Test database rebuilt and migrated");
}

main().catch((error) => {
	console.error("✗ Failed to prepare test database", error);
	process.exit(1);
});
