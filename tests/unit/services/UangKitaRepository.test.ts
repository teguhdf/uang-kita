import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import DB from "../../../app/services/DB";
import { UserRepository } from "../../../app/repositories/user.repository";
import UangKitaRepository from "../../../app/repositories/uang-kita.repository";

describe("UANG KITA repository concurrency", () => {
	let userId = "";

	afterEach(() => {
		if (userId) {
			DB.run("DELETE FROM users WHERE id = ?", [userId]);
			userId = "";
		}
	});

	it("rejects a bought decision calculated from a stale balance snapshot", async () => {
		userId = randomUUID();
		await UserRepository.create({
			id: userId,
			email: `concurrency-${userId}@example.com`,
			password: "hashed",
			name: "Owner",
		});

		const household = await UangKitaRepository.createHouseholdWithMembers(
			userId,
			"Owner",
			"Partner",
		);
		const plan = await UangKitaRepository.upsertPlan(household.id, "2026-09", {
			monthly_income: 5_000_000,
			available_money: 2_000_000,
			fixed_commitments: 500_000,
			debt_payments: 0,
			savings_target: 0,
			safety_buffer: 0,
			personal_owner: 0,
			personal_partner: 0,
			next_income_date: "2026-10-10",
		});

		const decision = {
			created_by: userId,
			period: "2026-09",
			item_name: "Test purchase",
			amount: 100_000,
			outcome: "bought" as const,
			impact_status: "within-flexible" as const,
			decision_level: "free" as const,
			flexible_before: 1_500_000,
			flexible_after: 1_400_000,
			deficit_after: 0,
			safe_daily_before: 100_000,
			safe_daily_after: 90_000,
			safe_weekly_before: 700_000,
			safe_weekly_after: 630_000,
			expected_available_money: plan.available_money,
			expected_plan_updated_at: plan.updated_at,
		};

		await UangKitaRepository.recordPurchaseDecision(household.id, decision);

		expect(() =>
			UangKitaRepository.recordPurchaseDecision(household.id, decision),
		).rejects.toThrow("Purchase balance changed");

		const freshPlan = await UangKitaRepository.findPlanByPeriod(
			household.id,
			"2026-09",
		);
		expect(freshPlan?.available_money).toBe(1_900_000);
	});
});
