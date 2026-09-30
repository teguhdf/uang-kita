import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run(`
    CREATE TABLE IF NOT EXISTS decision_rules (
      household_id TEXT PRIMARY KEY NOT NULL,
      free_limit INTEGER NOT NULL DEFAULT 0,
      notify_limit INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      CHECK (free_limit >= 0),
      CHECK (notify_limit >= free_limit)
    )
  `);
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP TABLE IF EXISTS decision_rules");
}
