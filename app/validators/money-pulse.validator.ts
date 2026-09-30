import { z } from "zod";

export const moneyPulseSchema = z.object({
	available_money: z.coerce
		.number()
		.int("Nominal harus berupa angka bulat")
		.min(0, "Uang tersedia tidak boleh negatif")
		.max(1_000_000_000_000, "Nominal terlalu besar"),
});

export type MoneyPulseInput = z.infer<typeof moneyPulseSchema>;
