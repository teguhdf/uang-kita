import { describe, expect, it } from "vitest";
import {
	buildCarryoverPlanSeed,
	calculateMoneyMetrics,
	classifyDecisionRule,
	simulatePurchaseImpact,
} from "../../../app/services/UangKitaService";

describe("UANG KITA Angka Aman engine", () => {
	it("calculates flexible, daily, and weekly safe money", () => {
		const metrics = calculateMoneyMetrics(
			{
				available_money: 5_000_000,
				fixed_commitments: 2_000_000,
				debt_payments: 500_000,
				savings_target: 500_000,
				safety_buffer: 500_000,
				personal_owner: 250_000,
				personal_partner: 250_000,
				next_income_date: "2026-10-13",
			},
			new Date("2026-09-29T00:00:00"),
		);

		expect(metrics.totalAllocated).toBe(4_000_000);
		expect(metrics.flexibleAmount).toBe(1_000_000);
		expect(metrics.deficitAmount).toBe(0);
		expect(metrics.daysRemaining).toBe(14);
		expect(metrics.safeDaily).toBe(71_428);
		expect(metrics.safeWeekly).toBe(500_000);
	});

	it("never reports negative safe money when allocations exceed available money", () => {
		const metrics = calculateMoneyMetrics(
			{
				available_money: 2_000_000,
				fixed_commitments: 2_500_000,
				debt_payments: 0,
				savings_target: 0,
				safety_buffer: 0,
				personal_owner: 0,
				personal_partner: 0,
				next_income_date: "2026-10-06",
			},
			new Date("2026-09-29T00:00:00"),
		);

		expect(metrics.flexibleAmount).toBe(0);
		expect(metrics.deficitAmount).toBe(500_000);
		expect(metrics.safeDaily).toBe(0);
		expect(metrics.safeWeekly).toBe(0);
	});

	it("shows the remaining flexible money after a simulated purchase", () => {
		const impact = simulatePurchaseImpact(
			{
				totalAllocated: 3_000_000,
				flexibleAmount: 1_400_000,
				deficitAmount: 0,
				daysRemaining: 14,
				safeDaily: 100_000,
				safeWeekly: 700_000,
			},
			400_000,
		);

		expect(impact.status).toBe("within-flexible");
		expect(impact.flexibleAfter).toBe(1_000_000);
		expect(impact.deficitAfter).toBe(0);
		expect(impact.safeDailyAfter).toBe(71_428);
		expect(impact.safeWeeklyAfter).toBe(500_000);
	});

	it("flags a simulated purchase that exceeds flexible money", () => {
		const impact = simulatePurchaseImpact(
			{
				totalAllocated: 3_000_000,
				flexibleAmount: 500_000,
				deficitAmount: 0,
				daysRemaining: 10,
				safeDaily: 50_000,
				safeWeekly: 350_000,
			},
			800_000,
		);

		expect(impact.status).toBe("over-flexible");
		expect(impact.flexibleAfter).toBe(0);
		expect(impact.deficitAfter).toBe(300_000);
		expect(impact.safeDailyAfter).toBe(0);
		expect(impact.safeWeeklyAfter).toBe(0);
	});

	it("adds a new purchase on top of an existing deficit", () => {
		const impact = simulatePurchaseImpact(
			{
				totalAllocated: 3_000_000,
				flexibleAmount: 0,
				deficitAmount: 500_000,
				daysRemaining: 10,
				safeDaily: 0,
				safeWeekly: 0,
			},
			200_000,
		);

		expect(impact.status).toBe("over-flexible");
		expect(impact.flexibleAfter).toBe(0);
		expect(impact.deficitAfter).toBe(700_000);
	});

	it("classifies purchase communication using the couple's own limits", () => {
		const rule = {
			free_limit: 100_000,
			notify_limit: 500_000,
		};

		expect(classifyDecisionRule(75_000, rule)).toBe("free");
		expect(classifyDecisionRule(100_000, rule)).toBe("free");
		expect(classifyDecisionRule(137_000, rule)).toBe("notify");
		expect(classifyDecisionRule(500_000, rule)).toBe("notify");
		expect(classifyDecisionRule(500_001, rule)).toBe("discuss");
	});

	it("does not invent a decision rule when the couple has not configured one", () => {
		expect(classifyDecisionRule(137_000, null)).toBe("unconfigured");
	});

	it("carries recurring structure without copying old available money or payday", () => {
		const seed = buildCarryoverPlanSeed({
			id: "plan-1",
			household_id: "household-1",
			period: "2026-09",
			monthly_income: 12_000_000,
			available_money: 8_000_000,
			fixed_commitments: 4_000_000,
			debt_payments: 500_000,
			savings_target: 1_000_000,
			safety_buffer: 500_000,
			personal_owner: 500_000,
			personal_partner: 500_000,
			next_income_date: "2026-10-25",
			created_at: 1,
			updated_at: 1,
		});

		expect(seed).toEqual({
			sourcePeriod: "2026-09",
			monthly_income: 12_000_000,
			fixed_commitments: 4_000_000,
			debt_payments: 500_000,
			savings_target: 1_000_000,
			safety_buffer: 500_000,
			personal_owner: 500_000,
			personal_partner: 500_000,
		});
		expect(seed).not.toHaveProperty("available_money");
		expect(seed).not.toHaveProperty("next_income_date");
	});
});
