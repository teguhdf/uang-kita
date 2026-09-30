import { randomUUID } from "crypto";
import DB from "../services/DB";

export interface MoneySnapshotRow {
	id: string;
	household_id: string;
	created_by: string;
	period: string;
	available_money: number;
	safe_daily: number;
	safe_weekly: number;
	source: "baseline" | "pulse";
	created_at: number;
	actor_name?: string;
}

export interface RecordMoneyPulseData {
	created_by: string;
	period: string;
	available_money: number;
	safe_daily: number;
	safe_weekly: number;
	baseline_available_money: number;
	baseline_safe_daily: number;
	baseline_safe_weekly: number;
	expected_available_money: number;
	expected_plan_updated_at: number;
}

export const MoneySnapshotRepository = {
	async listRecent(
		householdId: string,
		period: string,
		limit = 8,
	): Promise<MoneySnapshotRow[]> {
		return DB.all<MoneySnapshotRow>(
			`SELECT ms.*, COALESCE(u.name, 'Pengguna') AS actor_name
       FROM money_snapshots ms
       LEFT JOIN users u ON u.id = ms.created_by
       WHERE ms.household_id = ? AND ms.period = ?
       ORDER BY ms.created_at DESC, ms.id DESC
       LIMIT ?`,
			[householdId, period, limit],
		);
	},

	async recordPulse(
		householdId: string,
		data: RecordMoneyPulseData,
	): Promise<MoneySnapshotRow> {
		const now = Date.now();
		const pulseId = randomUUID();

		DB.transaction(() => {
			const existingBaseline = DB.get<{ id: string }>(
				`SELECT id FROM money_snapshots
         WHERE household_id = ? AND period = ? AND source = 'baseline'
         LIMIT 1`,
				[householdId, data.period],
			);

			if (!existingBaseline) {
				DB.run(
					`INSERT INTO money_snapshots (
           id, household_id, created_by, period, available_money,
           safe_daily, safe_weekly, source, created_at
         ) VALUES (?, ?, ?, ?, ?, ?, ?, 'baseline', ?)`,
					[
						randomUUID(),
						householdId,
						data.created_by,
						data.period,
						data.baseline_available_money,
						data.baseline_safe_daily,
						data.baseline_safe_weekly,
						now - 1,
					],
				);
			}

			const update = DB.run(
				`UPDATE monthly_plans
         SET available_money = ?, updated_at = ?
         WHERE household_id = ?
           AND period = ?
           AND available_money = ?
           AND updated_at = ?`,
				[
					data.available_money,
					now,
					householdId,
					data.period,
					data.expected_available_money,
					data.expected_plan_updated_at,
				],
			);

			if (update.changes !== 1) {
				throw new Error("Money pulse changed");
			}

			DB.run(
				`INSERT INTO money_snapshots (
         id, household_id, created_by, period, available_money,
         safe_daily, safe_weekly, source, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, 'pulse', ?)`,
				[
					pulseId,
					householdId,
					data.created_by,
					data.period,
					data.available_money,
					data.safe_daily,
					data.safe_weekly,
					now,
				],
			);
		});

		const snapshot = DB.get<MoneySnapshotRow>(
			"SELECT * FROM money_snapshots WHERE id = ? LIMIT 1",
			[pulseId],
		);
		if (!snapshot) throw new Error("Failed to save money pulse");
		return snapshot;
	},
};

export default MoneySnapshotRepository;
