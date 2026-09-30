import { afterEach, describe, expect, it } from "vitest";
import { randomUUID } from "crypto";
import DB from "../../../app/services/DB";
import { UserRepository } from "../../../app/repositories/user.repository";
import UangKitaRepository from "../../../app/repositories/uang-kita.repository";
import MoneyPulseService from "../../../app/services/MoneyPulseService";
import { currentPeriod } from "../../../app/services/UangKitaService";

describe("Pulse Uang", () => {
	let userId = "";

	afterEach(() => {
		if (userId) {
			DB.run("DELETE FROM users WHERE id = ?", [userId]);
			userId = "";
		}
	});

	async function setupPlan() {
		userId = randomUUID();
		await UserRepository.create({
			id: userId,
			email: `pulse-${userId}@example.com`,
			password: "hashed",
			name: "Owner",
		});
		const household = await UangKitaRepository.createHouseholdWithMembers(
			userId,
			"Owner",
			"Partner",
		);
		const period = currentPeriod();
		const plan = await UangKitaRepository.upsertPlan(household.id, period, {
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
		return { household, period, plan };
	}

	it("stores the original balance as baseline and updates the live plan", async () => {
		const { household, period } = await setupPlan();

		await MoneyPulseService.savePulse(userId, 4_250_000);

		const freshPlan = await UangKitaRepository.findPlanByPeriod(household.id, period);
		expect(freshPlan?.available_money).toBe(4_250_000);

		const summary = await MoneyPulseService.getSummary(userId);
		expect(summary?.recentSnapshots).toHaveLength(2);
		expect(summary?.recentSnapshots[0].source).toBe("pulse");
		expect(summary?.recentSnapshots[0].available_money).toBe(4_250_000);
		expect(summary?.recentSnapshots[1].source).toBe("baseline");
		expect(summary?.recentSnapshots[1].available_money).toBe(5_000_000);
		expect(summary?.availableDelta).toBe(-750_000);
	});

	it("keeps one baseline while allowing repeated pulse updates", async () => {
		await setupPlan();

		await MoneyPulseService.savePulse(userId, 4_500_000);
		await MoneyPulseService.savePulse(userId, 4_000_000);

		const summary = await MoneyPulseService.getSummary(userId);
		const baselines = summary?.recentSnapshots.filter((item) => item.source === "baseline") || [];
		const pulses = summary?.recentSnapshots.filter((item) => item.source === "pulse") || [];
		expect(baselines).toHaveLength(1);
		expect(pulses).toHaveLength(2);
		expect(summary?.currentAvailableMoney).toBe(4_000_000);
	});
});
