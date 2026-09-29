import { z } from "zod";

const amount = z.coerce
	.number()
	.int("Nominal harus berupa angka bulat")
	.min(0, "Nominal tidak boleh negatif")
	.max(1_000_000_000_000, "Nominal terlalu besar");

export const monthlyPlanSchema = z.object({
	partner_name: z
		.string()
		.trim()
		.min(2, "Nama pasangan minimal 2 karakter")
		.max(80, "Nama pasangan terlalu panjang"),
	monthly_income: amount,
	available_money: amount,
	fixed_commitments: amount,
	debt_payments: amount,
	savings_target: amount,
	safety_buffer: amount,
	personal_owner: amount,
	personal_partner: amount,
	next_income_date: z
		.string()
		.regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal pemasukan berikutnya tidak valid")
		.refine((value) => !Number.isNaN(new Date(`${value}T00:00:00`).getTime()), {
			message: "Tanggal pemasukan berikutnya tidak valid",
		}),
});

export const decisionRuleSchema = z
	.object({
		free_limit: amount,
		notify_limit: amount,
	})
	.refine((data) => data.notify_limit >= data.free_limit, {
		message: "Batas kasih tahu harus sama atau lebih besar dari batas bebas",
		path: ["notify_limit"],
	});

export const partnerInviteSchema = z.object({
	email: z
		.string()
		.trim()
		.toLowerCase()
		.email("Email pasangan tidak valid")
		.max(254, "Email pasangan terlalu panjang"),
});

export type MonthlyPlanInput = z.infer<typeof monthlyPlanSchema>;
export type DecisionRuleInput = z.infer<typeof decisionRuleSchema>;
export type PartnerInviteInput = z.infer<typeof partnerInviteSchema>;
