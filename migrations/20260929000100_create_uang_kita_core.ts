import type DB from "../app/services/DB";

export async function up(db: typeof DB): Promise<void> {
	db.run(`
    CREATE TABLE IF NOT EXISTS households (
      id TEXT PRIMARY KEY NOT NULL,
      name TEXT NOT NULL,
      created_by TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (created_by) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS household_members (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      user_id TEXT,
      display_name TEXT NOT NULL,
      role TEXT NOT NULL CHECK (role IN ('owner', 'partner')),
      status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending')),
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
      UNIQUE (household_id, role),
      UNIQUE (user_id)
    )
  `);

	db.run(`
    CREATE TABLE IF NOT EXISTS monthly_plans (
      id TEXT PRIMARY KEY NOT NULL,
      household_id TEXT NOT NULL,
      period TEXT NOT NULL,
      monthly_income INTEGER NOT NULL DEFAULT 0,
      available_money INTEGER NOT NULL DEFAULT 0,
      fixed_commitments INTEGER NOT NULL DEFAULT 0,
      debt_payments INTEGER NOT NULL DEFAULT 0,
      savings_target INTEGER NOT NULL DEFAULT 0,
      safety_buffer INTEGER NOT NULL DEFAULT 0,
      personal_owner INTEGER NOT NULL DEFAULT 0,
      personal_partner INTEGER NOT NULL DEFAULT 0,
      next_income_date TEXT NOT NULL,
      created_at INTEGER NOT NULL,
      updated_at INTEGER NOT NULL,
      FOREIGN KEY (household_id) REFERENCES households(id) ON DELETE CASCADE,
      UNIQUE (household_id, period)
    )
  `);

	db.run("CREATE INDEX IF NOT EXISTS idx_household_members_user ON household_members(user_id)");
	db.run("CREATE INDEX IF NOT EXISTS idx_monthly_plans_household_period ON monthly_plans(household_id, period)");
}

export async function down(db: typeof DB): Promise<void> {
	db.run("DROP TABLE IF EXISTS monthly_plans");
	db.run("DROP TABLE IF EXISTS household_members");
	db.run("DROP TABLE IF EXISTS households");
}
