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

	async findPlanByPeriod(
		householdId: string,
		period: string,
	): Promise<MonthlyPlanRow | undefined> {
		return DB.get<MonthlyPlanRow>(
			"SELECT * FROM monthly_plans WHERE household_id = ? AND period = ? LIMIT 1",
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
};

export default UangKitaRepository;
