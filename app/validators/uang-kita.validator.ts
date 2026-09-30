import { z } from "zod";

const amount = z.coerce
	.number()
	.int("Nominal harus berupa angka bulat")
	.min(0, "Nominal tidak boleh negatif")
	.max(1_000_000_000_000, "Nominal terlalu besar");

const positiveAmount = amount.refine((value) => value > 0, {
	message: "Nominal harus lebih dari 0",
});

function isStrictIsoDate(value: string): boolean {
	const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(value);
	if (!match) return false;
	const year = Number(match[1]);
	const month = Number(match[2]);
	const day = Number(match[3]);
	const date = new Date(Date.UTC(year, month - 1, day));
	return (
		date.getUTCFullYear() === year &&
		date.getUTCMonth() === month - 1 &&
		date.getUTCDate() === day
	);
}

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
		.refine(isStrictIsoDate, "Tanggal pemasukan berikutnya tidak valid"),
});

export const monthlyResetSchema = z.object({
	available_money: amount,
	next_income_date: z
		.string()
		.refine(isStrictIsoDate, "Tanggal pemasukan berikutnya tidak valid"),
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

export const purchaseDecisionSchema = z.object({
	item_name: z
		.string()
		.trim()
		.min(2, "Nama pembelian minimal 2 karakter")
		.max(120, "Nama pembelian terlalu panjang"),
	amount: positiveAmount,
	outcome: z.enum(["bought", "later", "cancelled"]),
});

export const weeklyCheckinSchema = z
	.object({
		status: z.enum(["aman", "perlu_dibicarakan"]),
		topic: z
			.enum(["pengeluaran", "target", "cicilan", "pembelian", "lainnya"])
			.nullable()
			.optional(),
		note: z
			.string()
			.trim()
			.max(240, "Catatan maksimal 240 karakter")
			.nullable()
			.optional(),
	})
	.refine(
		(data) => data.status !== "perlu_dibicarakan" || Boolean(data.topic),
		{
			message: "Pilih hal yang ingin dibicarakan bersama",
			path: ["topic"],
		},
	);

export type MonthlyPlanInput = z.infer<typeof monthlyPlanSchema>;
export type MonthlyResetInput = z.infer<typeof monthlyResetSchema>;
export type DecisionRuleInput = z.infer<typeof decisionRuleSchema>;
export type PartnerInviteInput = z.infer<typeof partnerInviteSchema>;
export type PurchaseDecisionInput = z.infer<typeof purchaseDecisionSchema>;
export type WeeklyCheckinInput = z.infer<typeof weeklyCheckinSchema>;
