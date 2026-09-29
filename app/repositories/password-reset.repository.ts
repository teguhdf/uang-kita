/**
 * Password Reset Token Repository
 */

import DB from "../services/DB";

export interface PasswordResetTokenRow {
	id: number;
	email: string;
	token: string;
	created_at: string;
	expires_at: string;
}

export const PasswordResetRepository = {
	findByToken(token: string): PasswordResetTokenRow | undefined {
		const now = new Date().toISOString();
		return DB.get<PasswordResetTokenRow>(
			"SELECT * FROM password_reset_tokens WHERE token = ? AND expires_at > ?",
			[token, now],
		);
	},

	create(email: string, token: string, expiresAt: string): void {
		DB.run(
			"INSERT INTO password_reset_tokens (email, token, expires_at) VALUES (?, ?, ?)",
			[email, token, expiresAt],
		);
	},

	delete(token: string): void {
		DB.run("DELETE FROM password_reset_tokens WHERE token = ?", [token]);
	},

	deleteByEmail(email: string): void {
		DB.run("DELETE FROM password_reset_tokens WHERE LOWER(email) = LOWER(?)", [email]);
	},

	deleteExpired(): void {
		DB.run("DELETE FROM password_reset_tokens WHERE expires_at < ?", [
			new Date().toISOString(),
		]);
	},
};

export default PasswordResetRepository;
