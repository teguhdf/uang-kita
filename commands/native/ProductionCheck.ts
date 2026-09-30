import "dotenv/config";
import { assertEnvironment } from "../../app/services/Env";
import DB from "../../app/services/DB";

function main() {
	const environment = assertEnvironment();
	const probe = DB.get<{ ok: number }>("SELECT 1 AS ok");
	if (!probe || probe.ok !== 1) {
		throw new Error("Database health check failed");
	}

	console.log("Production environment: OK");
	console.log(`Database: ${DB.getFilename()}`);
	for (const warning of environment.warnings) {
		console.log(`Warning: ${warning}`);
	}
}

try {
	main();
} catch (error) {
	console.error("Production check failed:", error instanceof Error ? error.message : error);
	process.exit(1);
}
