import { randomUUID } from "crypto";
import DB from "../services/DB";

export interface HouseholdRow {
	id: string;
	name: string;
	created_by: string;
	created_at: number;
	updated_at: number;
}

export interface HouseholdMemberRow {
	id: string;
	household_id: string;
	user_id: string | null;
	display_name: string;
	role: "owner" | "partner";
	status: "active" | "pending";
	invite_email: string | null;
	created_at: number;
	updated_at: number;
}

export interface MonthlyPlanRow {
	id: string;
	household_id: string;
	period: string;
	monthly_income: number;
	available_money: number;
	fixed_commitments: number;
	debt_payments: number;
	savings_target: number;
	safety_buffer: number;
	personal_owner: number;
	personal_partner: number;
	next_income_date: string;
	created_at: number;
	updated_at: number;
}

export interface DecisionRuleRow {
	household_id: string;
	free_limit: number;
	notify_limit: number;
	created_at: number;
	updated_at: number;
}

export interface PurchaseDecisionRow {
	id: string;
	household_id: string;
	created_by: string;
	period: string;
	item_name: string;
	amount: number;
	outcome: "bought" | "later" | "cancelled";
	impact_status: "within-flexible" | "uses-all-flexible" | "over-flexible";
	decision_level: "free" | "notify" | "discuss" | "unconfigured";
	flexible_before: number;
	flexible_after: number;
	deficit_after: number;
	safe_daily_before: number;
	safe_daily_after: number;
	safe_weekly_before: number;
	safe_weekly_after: number;
	created_at: number;
	actor_name?: string;
}

export interface SavePlanData {
	monthly_income: number;
	available_money: number;
	fixed_commitments: number;
	debt_payments: number;
	savings_target: number;
	safety_buffer: number;
	personal_owner: number;
	personal_partner: number;
	next_income_date: string;
}

export interface SavePurchaseDecisionData {
	created_by: string;
	period: string;
	item_name: string;
	amount: number;
	outcome: PurchaseDecisionRow["outcome"];
	impact_status: PurchaseDecisionRow["impact_status"];
	decision_level: PurchaseDecisionRow["decision_level"];
	flexible_before: number;
	flexible_after: number;
	deficit_after: number;
	safe_daily_before: number;
	safe_daily_after: number;
	safe_weekly_before: number;
	safe_weekly_after: number;
	expected_available_money: number;
	expected_plan_updated_at: number;
}

export const UangKitaRepository = {
	async findHouseholdByUser(userId: string): Promise<HouseholdRow | undefined> {
		return DB.get<HouseholdRow>(
			`SELECT h.*
       FROM households h
       INNER JOIN household_members hm ON hm.household_id = h.id
       WHERE hm.user_id = ? AND hm.status = 'active'
       LIMIT 1`,
			[userId],
		);
	},

	async findMemberByRole(
		householdId: string,
		role: "owner" | "partner",
	): Promise<HouseholdMemberRow | undefined> {
		return DB.get<HouseholdMemberRow>(
			"SELECT * FROM household_members WHERE household_id = ? AND role = ? LIMIT 1",
			[householdId, role],
		);
	},

	async findPendingPartnerInviteByEmail(
		email: string,
	): Promise<HouseholdMemberRow | undefined> {
		return DB.get<HouseholdMemberRow>(
			`SELECT * FROM household_members
       WHERE role = 'partner'
         AND status = 'pending'
         AND user_id IS NULL
         AND LOWER(invite_email) = LOWER(?)
       ORDER BY updated_at DESC
       LIMIT 1`,
			[email.trim().toLowerCase()],
		);
	},

	async findPlanByPeriod(
		householdId: string,
		period: string,
	): Promise<MonthlyPlanRow | undefined> {
		return DB.get<MonthlyPlanRow>(
			"SELECT * FROM monthly_plans WHERE household_id = ? AND period = ? LIMIT 1",
			[householdId, period],
		);
	},

	async findLatestPlanBeforePeriod(
		householdId: string,
		period: string,
	): Promise<MonthlyPlanRow | undefined> {
		return DB.get<MonthlyPlanRow>(
			`SELECT * FROM monthly_plans
       WHERE household_id = ? AND period < ?
       ORDER BY period DESC
       LIMIT 1`,
			[householdId, period],
		);
	},

	async findDecisionRule(
		householdId: string,
	): Promise<DecisionRuleRow | undefined> {
		return DB.get<DecisionRuleRow>(
			"SELECT * FROM decision_rules WHERE household_id = ? LIMIT 1",
			[householdId],
		);
	},

	async listRecentPurchaseDecisions(
		householdId: string,
		limit = 8,
	): Promise<PurchaseDecisionRow[]> {
		return DB.all<PurchaseDecisionRow>(
			`SELECT pd.*, COALESCE(u.name, 'Pengguna') AS actor_name
       FROM purchase_decisions pd
       LEFT JOIN users u ON u.id = pd.created_by
       WHERE pd.household_id = ?
       ORDER BY pd.created_at DESC
       LIMIT ?`,
			[householdId, limit],
		);
	},

	async createHouseholdWithMembers(
		ownerUserId: string,
		ownerName: string,
		partnerName: string,
	): Promise<HouseholdRow> {
		const householdId = randomUUID();
		const now = Date.now();
		const householdName = `${ownerName} & ${partnerName}`;

		DB.transaction(() => {
			DB.run(
				"INSERT INTO households (id, name, created_by, created_at, updated_at) VALUES (?, ?, ?, ?, ?)",
				[householdId, householdName, ownerUserId, now, now],
			);
			DB.run(
				`INSERT INTO household_members
         (id, household_id, user_id, display_name, role, status, created_at, updated_at)
         VALUES (?, ?, ?, ?, 'owner', 'active', ?, ?)`,
				[randomUUID(), householdId, ownerUserId, ownerName, now, now],
			);
			DB.run(
				`INSERT INTO household_members
         (id, household_id, user_id, display_name, role, status, created_at, updated_at)
         VALUES (?, ?, NULL, ?, 'partner', 'pending', ?, ?)`,
				[randomUUID(), householdId, partnerName, now, now],
			);
		});

		const household = DB.get<HouseholdRow>(
			"SELECT * FROM households WHERE id = ?",
			[householdId],
		);
		if (!household) throw new Error("Failed to create household");
		return household;
	},

	async updatePeople(
		householdId: string,
		ownerName: string,
		partnerName: string,
	): Promise<void> {
		const now = Date.now();
		DB.transaction(() => {
			DB.run("UPDATE households SET name = ?, updated_at = ? WHERE id = ?", [
				`${ownerName} & ${partnerName}`,
				now,
				householdId,
			]);
			DB.run(
				"UPDATE household_members SET display_name = ?, updated_at = ? WHERE household_id = ? AND role = 'owner'",
				[ownerName, now, householdId],
			);
			DB.run(
				"UPDATE household_members SET display_name = ?, updated_at = ? WHERE household_id = ? AND role = 'partner'",
				[partnerName, now, householdId],
			);
		});
	},

	async setPartnerInviteEmail(
		householdId: string,
		email: string,
	): Promise<HouseholdMemberRow> {
		const normalizedEmail = email.trim().toLowerCase();
		const now = Date.now();
		DB.run(
			`UPDATE household_members
       SET invite_email = ?, status = CASE WHEN user_id IS NULL THEN 'pending' ELSE status END, updated_at = ?
       WHERE household_id = ? AND role = 'partner'`,
			[normalizedEmail, now, householdId],
		);

		const partner = await this.findMemberByRole(householdId, "partner");
		if (!partner) throw new Error("Partner member not found");
		return partner;
	},

	async claimPendingPartnerInvite(
		userId: string,
		email: string,
		displayName: string,
	): Promise<boolean> {
		const normalizedEmail = email.trim().toLowerCase();
		const existingMembership = DB.get<{ household_id: string }>(
			"SELECT household_id FROM household_members WHERE user_id = ? LIMIT 1",
			[userId],
		);
		if (existingMembership) return false;

		const pending = await this.findPendingPartnerInviteByEmail(normalizedEmail);
		if (!pending) return false;

		const account = DB.get<{ id: string; email: string; created_at: number }>(
			"SELECT id, email, created_at FROM users WHERE id = ? AND LOWER(email) = LOWER(?) LIMIT 1",
			[userId, normalizedEmail],
		);
		if (!account || account.created_at > pending.updated_at) return false;

		const result = DB.run(
			`UPDATE household_members
       SET user_id = ?, display_name = ?, status = 'active', updated_at = ?
       WHERE id = ? AND user_id IS NULL AND status = 'pending'`,
			[userId, displayName || pending.display_name, Date.now(), pending.id],
		);
		return result.changes > 0;
	},

	async upsertPlan(
		householdId: string,
		period: string,
		data: SavePlanData,
	): Promise<MonthlyPlanRow> {
		const now = Date.now();
		const id = randomUUID();

		DB.run(
			`INSERT INTO monthly_plans (
         id, household_id, period, monthly_income, available_money,
         fixed_commitments, debt_payments, savings_target, safety_buffer,
         personal_owner, personal_partner, next_income_date, created_at, updated_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(household_id, period) DO UPDATE SET
         monthly_income = excluded.monthly_income,
         available_money = excluded.available_money,
         fixed_commitments = excluded.fixed_commitments,
         debt_payments = excluded.debt_payments,
         savings_target = excluded.savings_target,
         safety_buffer = excluded.safety_buffer,
         personal_owner = excluded.personal_owner,
         personal_partner = excluded.personal_partner,
         next_income_date = excluded.next_income_date,
         updated_at = excluded.updated_at`,
			[
				id,
				householdId,
				period,
				data.monthly_income,
				data.available_money,
				data.fixed_commitments,
				data.debt_payments,
				data.savings_target,
				data.safety_buffer,
				data.personal_owner,
				data.personal_partner,
				data.next_income_date,
				now,
				now,
			],
		);

		const plan = await this.findPlanByPeriod(householdId, period);
		if (!plan) throw new Error("Failed to save monthly plan");
		return plan;
	},

	async upsertDecisionRule(
		householdId: string,
		freeLimit: number,
		notifyLimit: number,
	): Promise<DecisionRuleRow> {
		const now = Date.now();
		DB.run(
			`INSERT INTO decision_rules (household_id, free_limit, notify_limit, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?)
       ON CONFLICT(household_id) DO UPDATE SET
         free_limit = excluded.free_limit,
         notify_limit = excluded.notify_limit,
         updated_at = excluded.updated_at`,
			[householdId, freeLimit, notifyLimit, now, now],
		);

		const rule = await this.findDecisionRule(householdId);
		if (!rule) throw new Error("Failed to save decision rule");
		return rule;
	},

	async recordPurchaseDecision(
		householdId: string,
		data: SavePurchaseDecisionData,
	): Promise<PurchaseDecisionRow> {
		const id = randomUUID();
		const now = Date.now();

		DB.transaction(() => {
			if (data.outcome === "bought") {
				const balanceUpdate = DB.run(
					`UPDATE monthly_plans
         SET available_money = available_money - ?, updated_at = ?
         WHERE household_id = ?
           AND period = ?
           AND available_money = ?
           AND updated_at = ?
           AND available_money >= ?`,
					[
						data.amount,
						now,
						householdId,
						data.period,
						data.expected_available_money,
						data.expected_plan_updated_at,
						data.amount,
					],
				);
				if (balanceUpdate.changes !== 1) {
					throw new Error("Purchase balance changed");
				}
			}

			DB.run(
				`INSERT INTO purchase_decisions (
         id, household_id, created_by, period, item_name, amount, outcome,
         impact_status, decision_level, flexible_before, flexible_after,
         deficit_after, safe_daily_before, safe_daily_after,
         safe_weekly_before, safe_weekly_after, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
				[
					id,
					householdId,
					data.created_by,
					data.period,
					data.item_name,
					data.amount,
					data.outcome,
					data.impact_status,
					data.decision_level,
					data.flexible_before,
					data.flexible_after,
					data.deficit_after,
					data.safe_daily_before,
					data.safe_daily_after,
					data.safe_weekly_before,
					data.safe_weekly_after,
					now,
				],
			);
		});

		const decision = DB.get<PurchaseDecisionRow>(
			"SELECT * FROM purchase_decisions WHERE id = ? LIMIT 1",
			[id],
		);
		if (!decision) throw new Error("Failed to save purchase decision");
		return decision;
	},
};

export default UangKitaRepository;
