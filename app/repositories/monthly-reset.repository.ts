import { randomUUID } from "crypto";
import DB from "../services/DB";
import UangKitaRepository, {
	type MonthlyPlanRow,
	type SavePlanData,
} from "./uang-kita.repository";

export const MonthlyResetRepository = {
	async createPlan(
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
       ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
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

		const plan = await UangKitaRepository.findPlanByPeriod(householdId, period);
		if (!plan) throw new Error("Failed to create monthly reset plan");
		return plan;
	},
};

export default MonthlyResetRepository;
