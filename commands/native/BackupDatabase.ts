import "dotenv/config";
import { chmodSync, mkdirSync, readdirSync, statSync, unlinkSync } from "fs";
import path from "path";
import DB from "../../app/services/DB";

function timestamp(): string {
	return new Date().toISOString().replace(/[:.]/g, "-");
}

function cleanupOldBackups(directory: string, retentionDays: number): void {
	if (retentionDays <= 0) return;
	const cutoff = Date.now() - retentionDays * 24 * 60 * 60 * 1000;

	for (const filename of readdirSync(directory)) {
		if (!filename.startsWith("uang-kita-") || !filename.endsWith(".sqlite3")) {
			continue;
		}

		const fullPath = path.join(directory, filename);
		if (statSync(fullPath).mtimeMs < cutoff) {
			unlinkSync(fullPath);
		}
	}
}

async function main() {
	const source = DB.getFilename();
	if (source === ":memory:") {
		throw new Error("Cannot back up an in-memory database");
	}

	const backupDirectory = path.resolve(process.env.BACKUP_DIR || "./backups");
	const retentionDays = Math.max(0, Number(process.env.BACKUP_RETENTION_DAYS || 14));
	mkdirSync(backupDirectory, { recursive: true, mode: 0o700 });

	const stage = process.env.DB_CONNECTION || "development";
	const destination = path.join(
		backupDirectory,
		`uang-kita-${stage}-${timestamp()}.sqlite3`,
	);

	await DB.getNativeDb().backup(destination);

	try {
		chmodSync(destination, 0o600);
	} catch {
		// Windows may not apply POSIX file modes. The backup itself is still valid.
	}

	cleanupOldBackups(backupDirectory, retentionDays);

	console.log(`Database backup created: ${destination}`);
}

main().catch((error) => {
	console.error("Database backup failed:", error instanceof Error ? error.message : error);
	process.exit(1);
});
