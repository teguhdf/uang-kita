import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run(`
    CREATE TABLE IF NOT EXISTS money_snapshots (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      period TEXT NOT NULL,
      available_money INTEGER NOT NULL,
      safe_daily INTEGER NOT NULL,
      safe_weekly INTEGER NOT NULL,
      source TEXT NOT NULL CHECK (source IN ('baseline', 'pulse')),
      created_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

	db.run(
		"CREATE INDEX IF NOT EXISTS idx_money_snapshots_household_period_created ON money_snapshots(household_id, period, created_at DESC)",
	);
	db.run(
		`CREATE UNIQUE INDEX IF NOT EXISTS idx_money_snapshots_baseline_unique
     ON money_snapshots(household_id, period)
     WHERE source = 'baseline'`,
	);
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP TABLE IF EXISTS money_snapshots");
}
