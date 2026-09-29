import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run("ALTER TABLE household_members ADD COLUMN invite_email TEXT");
	db.run(
		"CREATE INDEX IF NOT EXISTS idx_household_members_invite_email ON household_members(invite_email)",
	);
}

export async function down(_db: typeof DB): Promise<void> {
	// SQLite column removal is intentionally omitted for this additive MVP migration.
}
