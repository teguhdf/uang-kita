import { describe, expect, it } from "vitest";
import { calculateMoneyMetrics } from "../../../app/services/UangKitaService";

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
});
