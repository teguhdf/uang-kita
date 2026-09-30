import MoneySnapshotRepository, {
	type MoneySnapshotRow,
} from "../repositories/money-snapshot.repository";
import UangKitaRepository from "../repositories/uang-kita.repository";
import {
	calculateMoneyMetrics,
	currentPeriod,
	type MoneyMetrics,
} from "./UangKitaService";

export interface MoneyPulseSummary {
	currentAvailableMoney: number;
	currentMetrics: MoneyMetrics;
	recentSnapshots: MoneySnapshotRow[];
	lastPulse: MoneySnapshotRow | null;
	previousSnapshot: MoneySnapshotRow | null;
	availableDelta: number | null;
	safeDailyDelta: number | null;
}

export const MoneyPulseService = {
	async getSummary(userId: string): Promise<MoneyPulseSummary | null> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) return null;

		const period = currentPeriod();
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (!plan) return null;

		const currentMetrics = calculateMoneyMetrics(plan);
		const recentSnapshots = await MoneySnapshotRepository.listRecent(
			household.id,
			period,
			8,
		);
		const lastPulse = recentSnapshots.find((item) => item.source === "pulse") || null;
		const latest = recentSnapshots[0] || null;
		const previousSnapshot = recentSnapshots[1] || null;

		return {
			currentAvailableMoney: plan.available_money,
			currentMetrics,
			recentSnapshots,
			lastPulse,
			previousSnapshot,
			availableDelta:
				latest && previousSnapshot
					? latest.available_money - previousSnapshot.available_money
					: null,
			safeDailyDelta:
				latest && previousSnapshot
					? latest.safe_daily - previousSnapshot.safe_daily
					: null,
		};
	},

	async savePulse(userId: string, availableMoneyInput: number): Promise<MoneySnapshotRow> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");

		const period = currentPeriod();
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (!plan) throw new Error("Plan not found");

		const availableMoney = Math.max(0, Math.floor(Number(availableMoneyInput) || 0));
		const baselineMetrics = calculateMoneyMetrics(plan);
		const nextPlan = { ...plan, available_money: availableMoney };
		const nextMetrics = calculateMoneyMetrics(nextPlan);

		return MoneySnapshotRepository.recordPulse(household.id, {
			created_by: userId,
			period,
			available_money: availableMoney,
			safe_daily: nextMetrics.safeDaily,
			safe_weekly: nextMetrics.safeWeekly,
			baseline_available_money: plan.available_money,
			baseline_safe_daily: baselineMetrics.safeDaily,
			baseline_safe_weekly: baselineMetrics.safeWeekly,
			expected_available_money: plan.available_money,
			expected_plan_updated_at: plan.updated_at,
		});
	},
};

export default MoneyPulseService;
