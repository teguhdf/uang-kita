import MonthlyResetRepository from "../repositories/monthly-reset.repository";
import UangKitaRepository, {
	type SavePlanData,
} from "../repositories/uang-kita.repository";
import {
	buildCarryoverPlanSeed,
	currentPeriod,
	type CarryoverPlanSeed,
} from "./UangKitaService";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Jakarta";

export interface MonthlyResetInput {
	available_money: number;
	next_income_date: string;
}

function todayKey(date = new Date()): string {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone: APP_TIMEZONE,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
	return `${get("year")}-${get("month")}-${get("day")}`;
}

export function buildMonthlyResetPlan(
	seed: CarryoverPlanSeed,
	input: MonthlyResetInput,
): SavePlanData {
	return {
		monthly_income: seed.monthly_income,
		available_money: Math.max(0, Math.floor(Number(input.available_money) || 0)),
		fixed_commitments: seed.fixed_commitments,
		debt_payments: seed.debt_payments,
		savings_target: seed.savings_target,
		safety_buffer: seed.safety_buffer,
		personal_owner: seed.personal_owner,
		personal_partner: seed.personal_partner,
		next_income_date: input.next_income_date,
	};
}

export function isFutureIncomeDate(value: string, now = new Date()): boolean {
	return Boolean(value) && value > todayKey(now);
}

export const MonthlyResetService = {
	async start(userId: string, input: MonthlyResetInput) {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");

		const period = currentPeriod();
		const existingPlan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (existingPlan) throw new Error("Current period already exists");

		const previousPlan = await UangKitaRepository.findLatestPlanBeforePeriod(
			household.id,
			period,
		);
		const seed = buildCarryoverPlanSeed(previousPlan);
		if (!seed) throw new Error("Previous plan not found");
		if (!isFutureIncomeDate(input.next_income_date)) {
			throw new Error("Next income date must be future");
		}

		return MonthlyResetRepository.createPlan(
			household.id,
			period,
			buildMonthlyResetPlan(seed, input),
		);
	},
};

export default MonthlyResetService;
