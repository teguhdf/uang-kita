import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	const duplicate = db.get<{ email: string; count: number }>(
		`SELECT LOWER(TRIM(email)) AS email, COUNT(*) AS count
     FROM users
     GROUP BY LOWER(TRIM(email))
     HAVING COUNT(*) > 1
     LIMIT 1`,
	);

	if (duplicate) {
		throw new Error(
			`Cannot enforce case-insensitive email uniqueness; duplicate found for ${duplicate.email}`,
		);
	}

	db.run("UPDATE users SET email = LOWER(TRIM(email))");
	db.run(
		"CREATE UNIQUE INDEX IF NOT EXISTS users_email_nocase_unique ON users(LOWER(email))",
	);
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP INDEX IF EXISTS users_email_nocase_unique");
}
