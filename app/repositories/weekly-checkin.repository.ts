import { randomUUID } from "crypto";
import DB from "../services/DB";

export type WeeklyCheckinStatus = "aman" | "perlu_dibicarakan";
export type WeeklyCheckinTopic =
	| "pengeluaran"
	| "target"
	| "cicilan"
	| "pembelian"
	| "lainnya";

export interface WeeklyCheckinRow {
	id: string;
	household_id: string;
	created_by: string;
	period: string;
	status: WeeklyCheckinStatus;
	topic: WeeklyCheckinTopic | null;
	note: string | null;
	available_money: number;
	safe_daily: number;
	safe_weekly: number;
	decisions_bought: number;
	decisions_later: number;
	decisions_cancelled: number;
	created_at: number;
	actor_name?: string;
}

export interface DecisionCounts {
	bought: number;
	later: number;
	cancelled: number;
}

export interface CreateWeeklyCheckinData {
	created_by: string;
	period: string;
	status: WeeklyCheckinStatus;
	topic: WeeklyCheckinTopic | null;
	note: string | null;
	available_money: number;
	safe_daily: number;
	safe_weekly: number;
	decisions: DecisionCounts;
}

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;

export const WeeklyCheckinRepository = {
	async findLatest(householdId: string): Promise<WeeklyCheckinRow | undefined> {
		return DB.get<WeeklyCheckinRow>(
			`SELECT wc.*, COALESCE(u.name, 'Pengguna') AS actor_name
       FROM weekly_checkins wc
       LEFT JOIN users u ON u.id = wc.created_by
       WHERE wc.household_id = ?
       ORDER BY wc.created_at DESC, wc.id DESC
       LIMIT 1`,
			[householdId],
		);
	},

	async listRecent(householdId: string, limit = 6): Promise<WeeklyCheckinRow[]> {
		return DB.all<WeeklyCheckinRow>(
			`SELECT wc.*, COALESCE(u.name, 'Pengguna') AS actor_name
       FROM weekly_checkins wc
       LEFT JOIN users u ON u.id = wc.created_by
       WHERE wc.household_id = ?
       ORDER BY wc.created_at DESC, wc.id DESC
       LIMIT ?`,
			[householdId, limit],
		);
	},

	async countDecisionsSince(
		householdId: string,
		since: number,
	): Promise<DecisionCounts> {
		const row = DB.get<{
			bought: number;
			later: number;
			cancelled: number;
		}>(
			`SELECT
         SUM(CASE WHEN outcome = 'bought' THEN 1 ELSE 0 END) AS bought,
         SUM(CASE WHEN outcome = 'later' THEN 1 ELSE 0 END) AS later,
         SUM(CASE WHEN outcome = 'cancelled' THEN 1 ELSE 0 END) AS cancelled
       FROM purchase_decisions
       WHERE household_id = ? AND created_at >= ?`,
			[householdId, since],
		);
		return {
			bought: Number(row?.bought || 0),
			later: Number(row?.later || 0),
			cancelled: Number(row?.cancelled || 0),
		};
	},

	async createIfDue(
		householdId: string,
		data: CreateWeeklyCheckinData,
		now = Date.now(),
	): Promise<WeeklyCheckinRow> {
		const id = randomUUID();

		DB.transaction(() => {
			const latest = DB.get<{ created_at: number }>(
				`SELECT created_at FROM weekly_checkins
         WHERE household_id = ?
         ORDER BY created_at DESC, id DESC
         LIMIT 1`,
				[householdId],
			);

			if (latest && now < latest.created_at + WEEK_MS) {
				throw new Error("Weekly check-in not due");
			}

			DB.run(
				`INSERT INTO weekly_checkins (
         id, household_id, created_by, period, status, topic, note,
         available_money, safe_daily, safe_weekly,
         decisions_bought, decisions_later, decisions_cancelled, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					id,
					householdId,
					data.created_by,
					data.period,
					data.status,
					data.topic,
					data.note,
					data.available_money,
					data.safe_daily,
					data.safe_weekly,
					data.decisions.bought,
					data.decisions.later,
					data.decisions.cancelled,
					now,
				],
			);
		});

		const saved = DB.get<WeeklyCheckinRow>(
			"SELECT * FROM weekly_checkins WHERE id = ? LIMIT 1",
			[id],
		);
		if (!saved) throw new Error("Failed to save weekly check-in");
		return saved;
	},
};

export default WeeklyCheckinRepository;
