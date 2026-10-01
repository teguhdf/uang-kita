import WeeklyCheckinRepository, {
	type WeeklyCheckinRow,
	type WeeklyCheckinStatus,
	type WeeklyCheckinTopic,
} from "../repositories/weekly-checkin.repository";
import UangKitaRepository from "../repositories/uang-kita.repository";
import {
	calculateMoneyMetrics,
	currentPeriod,
	type MoneyMetrics,
} from "./UangKitaService";

const WEEK_MS = 7 * 24 * 60 * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

export interface WeeklyCheckinInput {
	status: WeeklyCheckinStatus;
	topic?: WeeklyCheckinTopic | null;
	note?: string | null;
}

export interface WeeklyCheckinSummary {
	metrics: MoneyMetrics;
	availableMoney: number;
	lastCheckin: WeeklyCheckinRow | null;
	recentCheckins: WeeklyCheckinRow[];
	decisions: {
		bought: number;
		later: number;
		cancelled: number;
	};
	dueNow: boolean;
	nextDueAt: number | null;
	daysUntilDue: number;
	safeWeeklyDelta: number | null;
	conversationPrompt: string;
}

function buildConversationPrompt(
	metrics: MoneyMetrics,
	lastCheckin: WeeklyCheckinRow | null,
	decisions: { bought: number; later: number; cancelled: number },
): string {
	const delta = lastCheckin ? metrics.safeWeekly - lastCheckin.safe_weekly : null;
	const postponed = decisions.later + decisions.cancelled;
	const totalDecisions = decisions.bought + postponed;

	if (delta !== null && delta < 0) {
		return "Angka Aman minggu ini lebih ketat dari obrolan sebelumnya. Apa yang paling berubah dan perlu kalian samakan dulu?";
	}
	if (postponed > 0) {
		return `Ada ${postponed} keputusan yang ditunda atau dibatalkan sejak obrolan terakhir. Masih ada yang mengganjal?`;
	}
	if (totalDecisions > 0) {
		return `Ada ${totalDecisions} keputusan uang sejak obrolan terakhir. Apakah semuanya masih terasa sesuai rencana kalian?`;
	}
	return "Ada perubahan kondisi, rencana, atau kebutuhan yang perlu kalian samakan minggu ini?";
}

export const WeeklyCheckinService = {
	async getSummary(userId: string, now = Date.now()): Promise<WeeklyCheckinSummary | null> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) return null;

		const period = currentPeriod(new Date(now));
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (!plan) return null;

		const metrics = calculateMoneyMetrics(plan, new Date(now));
		const lastCheckin = (await WeeklyCheckinRepository.findLatest(household.id)) || null;
		const since = lastCheckin?.created_at || now - WEEK_MS;
		const decisions = await WeeklyCheckinRepository.countDecisionsSince(household.id, since);
		const recentCheckins = await WeeklyCheckinRepository.listRecent(household.id, 6);
		const previousCheckin = recentCheckins[1] || null;
		const nextDueAt = lastCheckin ? lastCheckin.created_at + WEEK_MS : null;
		const dueNow = !nextDueAt || now >= nextDueAt;
		const daysUntilDue = nextDueAt && !dueNow
			? Math.max(1, Math.ceil((nextDueAt - now) / DAY_MS))
			: 0;

		const safeWeeklyDelta = dueNow
			? (lastCheckin ? metrics.safeWeekly - lastCheckin.safe_weekly : null)
			: (lastCheckin && previousCheckin
				? lastCheckin.safe_weekly - previousCheckin.safe_weekly
				: null);

		return {
			metrics,
			availableMoney: plan.available_money,
			lastCheckin,
			recentCheckins,
			decisions,
			dueNow,
			nextDueAt,
			daysUntilDue,
			safeWeeklyDelta,
			conversationPrompt: buildConversationPrompt(metrics, lastCheckin, decisions),
		};
	},

	async save(
		userId: string,
		input: WeeklyCheckinInput,
		now = Date.now(),
	): Promise<WeeklyCheckinRow> {
		const household = await UangKitaRepository.findHouseholdByUser(userId);
		if (!household) throw new Error("Household not found");

		const period = currentPeriod(new Date(now));
		const plan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		if (!plan) throw new Error("Plan not found");

		const metrics = calculateMoneyMetrics(plan, new Date(now));
		const latest = await WeeklyCheckinRepository.findLatest(household.id);
		const since = latest?.created_at || now - WEEK_MS;
		const decisions = await WeeklyCheckinRepository.countDecisionsSince(household.id, since);
		const topic = input.status === "perlu_dibicarakan" ? input.topic || null : null;
		const note = input.note?.trim() || null;

		return WeeklyCheckinRepository.createIfDue(
			household.id,
			{
				created_by: userId,
				period,
				status: input.status,
				topic,
				note,
				available_money: plan.available_money,
				safe_daily: metrics.safeDaily,
				safe_weekly: metrics.safeWeekly,
				decisions,
			},
			now,
		);
	},
};

export default WeeklyCheckinService;
