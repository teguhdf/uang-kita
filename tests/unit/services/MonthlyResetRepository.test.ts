import { randomUUID } from "crypto";
import { afterEach, describe, expect, it } from "vitest";
import MonthlyResetRepository from "../../../app/repositories/monthly-reset.repository";
import UangKitaRepository from "../../../app/repositories/uang-kita.repository";
import { UserRepository } from "../../../app/repositories/user.repository";
import DB from "../../../app/services/DB";

describe("UANG KITA monthly reset repository", () => {
	let userId = "";

	afterEach(() => {
		if (userId) {
			DB.run("DELETE FROM users WHERE id = ?", [userId]);
			userId = "";
		}
	});

	it("does not let two reset submissions overwrite the same period", async () => {
		userId = randomUUID();
		await UserRepository.create({
			id: userId,
			email: `reset-${userId}@example.com`,
			password: "hashed",
			name: "Owner",
		});

		const household = await UangKitaRepository.createHouseholdWithMembers(
			userId,
			"Owner",
			"Partner",
		);
		const data = {
			monthly_income: 8_000_000,
			available_money: 6_000_000,
			fixed_commitments: 2_000_000,
			debt_payments: 500_000,
			savings_target: 500_000,
			safety_buffer: 300_000,
			personal_owner: 250_000,
			personal_partner: 250_000,
			next_income_date: "2099-03-25",
		};

		await MonthlyResetRepository.createPlan(household.id, "2099-02", data);
		await expect(
			MonthlyResetRepository.createPlan(household.id, "2099-02", {
				...data,
				available_money: 99_000_000,
			}),
		).rejects.toThrow();

		const plan = await UangKitaRepository.findPlanByPeriod(household.id, "2099-02");
		expect(plan?.available_money).toBe(6_000_000);
	});
});
