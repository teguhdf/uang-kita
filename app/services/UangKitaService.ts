import UangKitaRepository, {
	type MonthlyPlanRow,
	type SavePlanData,
} from "../repositories/uang-kita.repository";

export interface MoneyMetrics {
	totalAllocated: number;
	flexibleAmount: number;
	deficitAmount: number;
	daysRemaining: number;
	safeDaily: number;
	safeWeekly: number;
}

export interface PurchaseImpact {
	purchaseAmount: number;
	flexibleBefore: number;
	flexibleAfter: number;
	deficitAfter: number;
	safeDailyAfter: number;
	safeWeeklyAfter: number;
	daysRemaining: number;
	status: "within-flexible" | "uses-all-flexible" | "over-flexible";
}

export interface UangKitaInput extends SavePlanData {
	partner_name: string;
}

export interface DashboardOverview {
	household: {
		id: string;
		name: string;
	};
	partnerName: string;
	plan: MonthlyPlanRow | null;
	metrics: MoneyMetrics | null;
}

export function currentPeriod(date = new Date()): string {
	const year = date.getFullYear();
	const month = String(date.getMonth() + 1).padStart(2, "0");
	return `${year}-${month}`;
}

export function calculateMoneyMetrics(
	plan: Pick<
		MonthlyPlanRow,
		| "available_money"
		| "fixed_commitments"
		| "debt_payments"
		| "savings_target"
		| "safety_buffer"
		| "personal_owner"
		| "personal_partner"
		| "next_income_date"
	>,
	now = new Date(),
): MoneyMetrics {
	const totalAllocated =
		plan.fixed_commitments +
		plan.debt_payments +
		plan.savings_target +
		plan.safety_buffer +
		plan.personal_owner +
		plan.personal_partner;

	const rawFlexible = plan.available_money - totalAllocated;
	const flexibleAmount = Math.max(0, rawFlexible);
	const deficitAmount = Math.max(0, -rawFlexible);

	const target = new Date(`${plan.next_income_date}T00:00:00`);
	const dayMs = 24 * 60 * 60 * 1000;
	const daysRemaining = Number.isNaN(target.getTime())
		? 1
		: Math.max(1, Math.ceil((target.getTime() - now.getTime()) / dayMs));

	const safeDaily = Math.floor(flexibleAmount / daysRemaining);
	const weekUnits = Math.max(1, daysRemaining / 7);
	const safeWeekly = Math.floor(flexibleAmount / weekUnits);

	return {
		totalAllocated,
		flexibleAmount,
		deficitAmount,
		daysRemaining,
		safeDaily,
		safeWeekly,
	};
}

export function simulatePurchaseImpact(
	metrics: MoneyMetrics,
	amount: number,
): PurchaseImpact {
	const purchaseAmount = Math.max(0, Math.floor(Number(amount) || 0));
	const rawAfter = metrics.flexibleAmount - purchaseAmount;
	const flexibleAfter = Math.max(0, rawAfter);
	const deficitAfter = Math.max(0, -rawAfter);
	const daysRemaining = Math.max(1, metrics.daysRemaining);
	const safeDailyAfter = Math.floor(flexibleAfter / daysRemaining);
	const safeWeeklyAfter = Math.floor(
		flexibleAfter / Math.max(1, daysRemaining / 7),
	);

	let status: PurchaseImpact["status"] = "within-flexible";
	if (purchaseAmount > metrics.flexibleAmount) {
		status = "over-flexible";
	} else if (
		purchaseAmount > 0 &&
		purchaseAmount === metrics.flexibleAmount
	) {
		status = "uses-all-flexible";
	}

	return {
		purchaseAmount,
		flexibleBefore: metrics.flexibleAmount,
		flexibleAfter,
		deficitAfter,
		safeDailyAfter,
		safeWeeklyAfter,
		daysRemaining,
		status,
	};
}

export const UangKitaService = {
	async getOverview(userId: string): Promise<DashboardOverview | null> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) return null;

		const partner = await UangKitaRepository.findMemberByRole(
			household.id,
			"partner",
		);
		const plan = await UangKitaRepository.findPlanByPeriod(
			household.id,
			currentPeriod(),
		);

		return {
			household: {
				id: household.id,
				name: household.name,
			},
			partnerName: partner?.display_name || "Pasangan",
			plan: plan || null,
			metrics: plan ? calculateMoneyMetrics(plan) : null,
		};
	},

	async saveMonthlyPlan(
		user: { id: string; name?: string | null },
		input: UangKitaInput,
	): Promise<DashboardOverview> {
		const ownerName = user.name?.trim() || "Kamu";
		let household = await UangKitaRepository.findHouseholdByUser(user.id);

		if (!household) {
			household = await UangKitaRepository.createHouseholdWithMembers(
				user.id,
				ownerName,
				input.partner_name,
			);
		} else {
			await UangKitaRepository.updatePeople(
				household.id,
				ownerName,
				input.partner_name,
			);
		}

		const {
			partner_name: _partnerName,
			...planInput
		} = input;

		const plan = await UangKitaRepository.upsertPlan(
			household.id,
			currentPeriod(),
			planInput,
		);

		return {
			household: {
				id: household.id,
				name: `${ownerName} & ${input.partner_name}`,
			},
			partnerName: input.partner_name,
			plan,
			metrics: calculateMoneyMetrics(plan),
		};
	},
};

export default UangKitaService;
