import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run(`
    CREATE TABLE IF NOT EXISTS purchase_decisions (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      period TEXT NOT NULL,
      item_name TEXT NOT NULL,
      amount INTEGER NOT NULL,
      outcome TEXT NOT NULL CHECK (outcome IN ('bought', 'later', 'cancelled')),
      impact_status TEXT NOT NULL CHECK (impact_status IN ('within-flexible', 'uses-all-flexible', 'over-flexible')),
      decision_level TEXT NOT NULL CHECK (decision_level IN ('free', 'notify', 'discuss', 'unconfigured')),
      flexible_before INTEGER NOT NULL,
      flexible_after INTEGER NOT NULL,
      deficit_after INTEGER NOT NULL,
      safe_daily_before INTEGER NOT NULL,
      safe_daily_after INTEGER NOT NULL,
      safe_weekly_before INTEGER NOT NULL,
      safe_weekly_after INTEGER NOT NULL,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

	db.run(
		"CREATE INDEX IF NOT EXISTS idx_purchase_decisions_household_created ON purchase_decisions(household_id, created_at DESC)",
	);
	db.run(
		"CREATE INDEX IF NOT EXISTS idx_purchase_decisions_household_period ON purchase_decisions(household_id, period)",
	);
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP TABLE IF EXISTS purchase_decisions");
}
