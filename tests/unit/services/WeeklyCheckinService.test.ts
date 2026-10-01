import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import DB from "../../../app/services/DB";
import { UserRepository } from "../../../app/repositories/user.repository";
import UangKitaRepository from "../../../app/repositories/uang-kita.repository";
import WeeklyCheckinService from "../../../app/services/WeeklyCheckinService";
import { currentPeriod } from "../../../app/services/UangKitaService";

const DAY_MS = 24 * 60 * 60 * 1000;

describe("Ngobrol Mingguan", () => {
	let userId = "";

	afterEach(() => {
		if (userId) {
			DB.run("DELETE FROM users WHERE id = ?", [userId]);
			userId = "";
		}
	});

	async function setupPlan(now: number) {
		userId = randomUUID();
		await UserRepository.create({
			id: userId,
			email: `mingguan-${userId}@example.com`,
			password: "hashed",
			name: "Pemilik",
		});
		const household = await UangKitaRepository.createHouseholdWithMembers(
			userId,
			"Pemilik",
			"Pasangan",
		);
		const period = currentPeriod(new Date(now));
		await UangKitaRepository.upsertPlan(household.id, period, {
			monthly_income: 8_000_000,
			available_money: 5_000_000,
			fixed_commitments: 2_000_000,
			debt_payments: 500_000,
			savings_target: 500_000,
			safety_buffer: 250_000,
			personal_owner: 250_000,
			personal_partner: 250_000,
			next_income_date: "2099-12-31",
		});
		return { household, period };
	}

	it("allows the first conversation and waits seven days for the next one", async () => {
		const now = Date.parse("2026-09-10T02:00:00Z");
		await setupPlan(now);

		const before = await WeeklyCheckinService.getSummary(userId, now);
		expect(before?.dueNow).toBe(true);
		expect(before?.lastCheckin).toBeNull();
		expect(before?.safeWeeklyDelta).toBeNull();

		await WeeklyCheckinService.save(
			userId,
			{ status: "aman", note: "Minggu ini masih sesuai rencana." },
			now,
		);

		const after = await WeeklyCheckinService.getSummary(userId, now + DAY_MS);
		expect(after?.dueNow).toBe(false);
		expect(after?.daysUntilDue).toBe(6);
		expect(after?.lastCheckin?.status).toBe("aman");
		expect(after?.safeWeeklyDelta).toBeNull();

		await expect(
			WeeklyCheckinService.save(
				userId,
				{ status: "perlu_dibicarakan", topic: "pengeluaran" },
				now + DAY_MS,
			),
		).rejects.toThrow("Weekly check-in not due");

		await expect(
			WeeklyCheckinService.save(
				userId,
				{ status: "perlu_dibicarakan", topic: "pengeluaran" },
				now + 7 * DAY_MS,
			),
		).resolves.toMatchObject({ status: "perlu_dibicarakan", topic: "pengeluaran" });

		const afterSecond = await WeeklyCheckinService.getSummary(userId, now + 7 * DAY_MS);
		expect(afterSecond?.safeWeeklyDelta).toBe(0);
	});

	it("captures decision counts since the previous weekly conversation", async () => {
		const now = Date.parse("2026-09-10T02:00:00Z");
		const { household, period } = await setupPlan(now);

		await WeeklyCheckinService.save(userId, { status: "aman" }, now);

		const decisionId = randomUUID();
		DB.run(
			`INSERT INTO purchase_decisions (
         id, household_id, created_by, period, item_name, amount, outcome,
         impact_status, decision_level, flexible_before, flexible_after,
         deficit_after, safe_daily_before, safe_daily_after,
         safe_weekly_before, safe_weekly_after, created_at
       ) VALUES (?, ?, ?, ?, ?, ?, 'later', 'within-flexible', 'notify', ?, ?, ?, ?, ?, ?, ?, ?)`,
			[
				decisionId,
				household.id,
				userId,
				period,
				"Sepatu",
				500_000,
				1_250_000,
				1_250_000,
				0,
				50_000,
				50_000,
				350_000,
				350_000,
				now + DAY_MS,
			],
		);

		const summary = await WeeklyCheckinService.getSummary(userId, now + 7 * DAY_MS);
		expect(summary?.decisions.later).toBe(1);
		expect(summary?.conversationPrompt).toContain("ditunda atau dibatalkan");
	});
});
