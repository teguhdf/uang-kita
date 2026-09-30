import { describe, expect, it } from "vitest";
import {
	buildMonthlyResetPlan,
	isFutureIncomeDate,
} from "../../../app/services/MonthlyResetService";

describe("UANG KITA monthly reset", () => {
	it("copies recurring structure but requires fresh money and payday", () => {
		const plan = buildMonthlyResetPlan(
			{
				sourcePeriod: "2026-09",
				monthly_income: 12_000_000,
				fixed_commitments: 4_000_000,
				debt_payments: 500_000,
				savings_target: 1_000_000,
				safety_buffer: 500_000,
				personal_owner: 500_000,
				personal_partner: 500_000,
			},
			{
				available_money: 9_250_000,
				next_income_date: "2026-11-25",
			},
		);

		expect(plan).toEqual({
			monthly_income: 12_000_000,
			available_money: 9_250_000,
			fixed_commitments: 4_000_000,
			debt_payments: 500_000,
			savings_target: 1_000_000,
			safety_buffer: 500_000,
			personal_owner: 500_000,
			personal_partner: 500_000,
			next_income_date: "2026-11-25",
		});
	});

	it("accepts only a future next-income date in Jakarta time", () => {
		const now = new Date("2026-09-30T17:30:00Z"); // 2026-10-01 in Jakarta
		expect(isFutureIncomeDate("2026-10-02", now)).toBe(true);
		expect(isFutureIncomeDate("2026-10-01", now)).toBe(false);
		expect(isFutureIncomeDate("2026-09-30", now)).toBe(false);
	});
});
