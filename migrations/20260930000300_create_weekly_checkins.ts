import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run(`
    CREATE TABLE IF NOT EXISTS weekly_checkins (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      created_by TEXT NOT NULL,
      period TEXT NOT NULL,
      status TEXT NOT NULL CHECK (status IN ('aman', 'perlu_dibicarakan')),
      topic TEXT NULL CHECK (
        topic IS NULL OR topic IN ('pengeluaran', 'target', 'cicilan', 'pembelian', 'lainnya')
      ),
      note TEXT NULL,
      available_money INTEGER NOT NULL,
      safe_daily INTEGER NOT NULL,
      safe_weekly INTEGER NOT NULL,
      decisions_bought INTEGER NOT NULL DEFAULT 0,
      decisions_later INTEGER NOT NULL DEFAULT 0,
      decisions_cancelled INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

	db.run(
		"CREATE INDEX IF NOT EXISTS idx_weekly_checkins_household_created ON weekly_checkins(household_id, created_at DESC)",
	);
	db.run(
		"CREATE INDEX IF NOT EXISTS idx_weekly_checkins_household_period ON weekly_checkins(household_id, period, created_at DESC)",
	);
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP TABLE IF EXISTS weekly_checkins");
}
