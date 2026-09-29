import UangKitaRepository, {
	type DecisionRuleRow,
	type MonthlyPlanRow,
	type PurchaseDecisionRow,
	type SavePlanData,
} from "../repositories/uang-kita.repository";
import { UserRepository } from "../repositories/user.repository";

const APP_TIMEZONE = process.env.APP_TIMEZONE || "Asia/Jakarta";

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

export type DecisionLevel = "free" | "notify" | "discuss" | "unconfigured";
export type PurchaseOutcome = "bought" | "later" | "cancelled";

export interface UangKitaInput extends SavePlanData {
	partner_name: string;
}

export interface CarryoverPlanSeed {
	sourcePeriod: string;
	monthly_income: number;
	fixed_commitments: number;
	debt_payments: number;
	savings_target: number;
	safety_buffer: number;
	personal_owner: number;
	personal_partner: number;
}

export interface DashboardOverview {
	household: { id: string; name: string };
	partnerName: string;
	partnerStatus: "active" | "pending";
	partnerInviteEmail: string | null;
	plan: MonthlyPlanRow | null;
	carryoverSeed: CarryoverPlanSeed | null;
	metrics: MoneyMetrics | null;
	decisionRule: DecisionRuleRow | null;
	recentDecisions: PurchaseDecisionRow[];
}

function datePartsInTimeZone(date: Date, timeZone = APP_TIMEZONE) {
	const parts = new Intl.DateTimeFormat("en-CA", {
		timeZone,
		year: "numeric",
		month: "2-digit",
		day: "2-digit",
	}).formatToParts(date);
	const get = (type: string) => parts.find((part) => part.type === type)?.value || "";
	return { year: get("year"), month: get("month"), day: get("day") };
}

export function currentPeriod(date = new Date()): string {
	const { year, month } = datePartsInTimeZone(date);
	return `${year}-${month}`;
}

function currentDateKey(date = new Date()): string {
	const { year, month, day } = datePartsInTimeZone(date);
	return `${year}-${month}-${day}`;
}

export function buildCarryoverPlanSeed(
	plan: MonthlyPlanRow | null | undefined,
): CarryoverPlanSeed | null {
	if (!plan) return null;
	return {
		sourcePeriod: plan.period,
		monthly_income: plan.monthly_income,
		fixed_commitments: plan.fixed_commitments,
		debt_payments: plan.debt_payments,
		savings_target: plan.savings_target,
		safety_buffer: plan.safety_buffer,
		personal_owner: plan.personal_owner,
		personal_partner: plan.personal_partner,
	};
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

	const dayMs = 24 * 60 * 60 * 1000;
	const todayKey = currentDateKey(now);
	const targetMs = Date.parse(`${plan.next_income_date}T00:00:00Z`);
	const todayMs = Date.parse(`${todayKey}T00:00:00Z`);
	const daysRemaining =
		Number.isNaN(targetMs) || Number.isNaN(todayMs)
			? 1
			: Math.max(1, Math.ceil((targetMs - todayMs) / dayMs));

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
	const currentHeadroom = metrics.flexibleAmount - metrics.deficitAmount;
	const rawAfter = currentHeadroom - purchaseAmount;
	const flexibleAfter = Math.max(0, rawAfter);
	const deficitAfter = Math.max(0, -rawAfter);
	const daysRemaining = Math.max(1, metrics.daysRemaining);
	const safeDailyAfter = Math.floor(flexibleAfter / daysRemaining);
	const safeWeeklyAfter = Math.floor(
		flexibleAfter / Math.max(1, daysRemaining / 7),
	);

	let status: PurchaseImpact["status"] = "within-flexible";
	if (purchaseAmount > metrics.flexibleAmount || metrics.deficitAmount > 0) {
		status = "over-flexible";
	} else if (purchaseAmount > 0 && purchaseAmount === metrics.flexibleAmount) {
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

export function classifyDecisionRule(
	amount: number,
	rule: Pick<DecisionRuleRow, "free_limit" | "notify_limit"> | null | undefined,
): DecisionLevel {
	if (!rule) return "unconfigured";
	const normalizedAmount = Math.max(0, Math.floor(Number(amount) || 0));
	if (normalizedAmount <= rule.free_limit) return "free";
	if (normalizedAmount <= rule.notify_limit) return "notify";
	return "discuss";
}

export const UangKitaService = {
	async getOverview(userId: string): Promise<DashboardOverview | null> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) return null;

		const period = currentPeriod();
		const partner = await UangKitaRepository.findMemberByRole(household.id, "partner");
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		const previousPlan = plan
			? undefined
			: await UangKitaRepository.findLatestPlanBeforePeriod(household.id, period);
		const decisionRule = await UangKitaRepository.findDecisionRule(household.id);
		const recentDecisions = await UangKitaRepository.listRecentPurchaseDecisions(
			household.id,
			8,
		);

		return {
			household: { id: household.id, name: household.name },
			partnerName: partner?.display_name || "Pasangan",
			partnerStatus: partner?.status || "pending",
			partnerInviteEmail: partner?.invite_email || null,
			plan: plan || null,
			carryoverSeed: buildCarryoverPlanSeed(previousPlan),
			metrics: plan ? calculateMoneyMetrics(plan) : null,
			decisionRule: decisionRule || null,
			recentDecisions,
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

		const { partner_name: _partnerName, ...planInput } = input;
		const plan = await UangKitaRepository.upsertPlan(
			household.id,
			currentPeriod(),
			planInput,
		);
		const decisionRule = await UangKitaRepository.findDecisionRule(household.id);
		const partner = await UangKitaRepository.findMemberByRole(household.id, "partner");
		const recentDecisions = await UangKitaRepository.listRecentPurchaseDecisions(
			household.id,
			8,
		);

		return {
			household: { id: household.id, name: `${ownerName} & ${input.partner_name}` },
			partnerName: input.partner_name,
			partnerStatus: partner?.status || "pending",
			partnerInviteEmail: partner?.invite_email || null,
			plan,
			carryoverSeed: null,
			metrics: calculateMoneyMetrics(plan),
			decisionRule: decisionRule || null,
			recentDecisions,
		};
	},

	async saveDecisionRule(
		userId: string,
		input: { free_limit: number; notify_limit: number },
	): Promise<DecisionRuleRow> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");
		return UangKitaRepository.upsertDecisionRule(
			household.id,
			input.free_limit,
			input.notify_limit,
		);
	},

	async recordPurchaseDecision(
		userId: string,
		input: { item_name: string; amount: number; outcome: PurchaseOutcome },
	): Promise<PurchaseDecisionRow> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");

		const period = currentPeriod();
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (!plan) throw new Error("Plan not found");

		const amount = Math.max(0, Math.floor(Number(input.amount) || 0));
		if (input.outcome === "bought" && amount > plan.available_money) {
			throw new Error("Purchase exceeds available money");
		}

		const metrics = calculateMoneyMetrics(plan);
		const impact = simulatePurchaseImpact(metrics, amount);
		const rule = await UangKitaRepository.findDecisionRule(household.id);
		const decisionLevel = classifyDecisionRule(amount, rule);

		return UangKitaRepository.recordPurchaseDecision(household.id, {
			created_by: userId,
			period,
			item_name: input.item_name.trim(),
			amount,
			outcome: input.outcome,
			impact_status: impact.status,
			decision_level: decisionLevel,
			flexible_before: metrics.flexibleAmount,
			flexible_after: impact.flexibleAfter,
			deficit_after: impact.deficitAfter,
			safe_daily_before: metrics.safeDaily,
			safe_daily_after: impact.safeDailyAfter,
			safe_weekly_before: metrics.safeWeekly,
			safe_weekly_after: impact.safeWeeklyAfter,
			expected_available_money: plan.available_money,
			expected_plan_updated_at: plan.updated_at,
		});
	},

	async invitePartner(userId: string, email: string): Promise<void> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");

		const partner = await UangKitaRepository.findMemberByRole(household.id, "partner");
		if (!partner) throw new Error("Partner member not found");
		if (partner.status === "active" && partner.user_id) {
			throw new Error("Partner already connected");
		}

		const normalizedEmail = email.trim().toLowerCase();
		const targetUser = await UserRepository.findByEmail(normalizedEmail);
		if (!targetUser) throw new Error("Partner account not found");
		if (targetUser.id === userId) throw new Error("Cannot link self");

		const targetHousehold = await UangKitaRepository.findHouseholdByUser(targetUser.id);
		if (targetHousehold) throw new Error("Partner already belongs to household");

		// Store the pending link only. The target account completes it on its next login.
		await UangKitaRepository.setPartnerInviteEmail(household.id, normalizedEmail);
	},

	async claimPartnerInvite(user: {
		id: string;
		email: string;
		name?: string | null;
	}): Promise<boolean> {
		const account = await UserRepository.findById(user.id);
		if (!account) return false;

		// The repository also verifies the account existed before this invitation,
		// preventing an invitation from being claimed by registering the email later.
		return UangKitaRepository.claimPendingPartnerInvite(
			user.id,
			user.email,
			user.name?.trim() || "Pasangan",
		);
	},
};

export default UangKitaService;
