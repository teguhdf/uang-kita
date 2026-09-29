import { Resend } from "resend";

let resend: Resend | null = null;

if (process.env.RESEND_API_KEY) {
	resend = new Resend(process.env.RESEND_API_KEY);
}

interface MailOptions {
	to: string;
	subject: string;
	text: string;
}

export async function MailTo({ to, subject, text }: MailOptions) {
	if (!resend) {
		throw new Error("Email delivery is not configured");
	}

	const fromAddress = process.env.MAIL_FROM_ADDRESS?.trim();
	if (!fromAddress) {
		throw new Error("MAIL_FROM_ADDRESS is required when Resend is enabled");
	}

	const fromName = process.env.MAIL_FROM_NAME?.trim() || "Sedalam Ini.";
	const data = await resend.emails.send({
		from: `${fromName} <${fromAddress}>`,
		to,
		subject,
		replyTo: fromAddress,
		text,
	});

	if (data.error) {
		throw new Error(data.error.message || "Resend failed to send email");
	}

	return data;
}
