/**
 * User Repository
 * Handles all database operations for users table using raw SQL.
 */

import DB from "../services/DB";

export interface UserRow {
	id: string;
	name: string | null;
	email: string;
	phone: string | null;
	avatar: string | null;
	is_verified: number;
	membership_date: number | null;
	is_admin: number;
	password: string;
	remember_me_token: string | null;
	created_at: number;
	updated_at: number;
}

export interface CreateUserData {
	id: string;
	email: string;
	password: string;
	name: string | null;
	phone?: string | null;
	avatar?: string | null;
	is_verified?: number;
	is_admin?: number;
}

export interface UpdateProfileData {
	name?: string;
	email?: string;
	phone?: string | null;
	avatar?: string | null;
	is_verified?: number;
}

export const UserRepository = {
	async findById(id: string): Promise<UserRow | undefined> {
		return DB.get<UserRow>("SELECT * FROM users WHERE id = ?", [id]);
	},

	async findByEmail(email: string): Promise<UserRow | undefined> {
		return DB.get<UserRow>(
			"SELECT * FROM users WHERE LOWER(email) = LOWER(?)",
			[email],
		);
	},

	async findByPhone(phone: string): Promise<UserRow | undefined> {
		return DB.get<UserRow>("SELECT * FROM users WHERE phone = ?", [phone]);
	},

	async create(data: CreateUserData): Promise<UserRow> {
		const now = Date.now();

		DB.run(
			`INSERT INTO users (id, email, password, name, phone, avatar, is_verified, is_admin,
        membership_date, remember_me_token, created_at, updated_at)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, NULL, NULL, ?, ?)`,
			[
				data.id,
				data.email,
				data.password,
				data.name,
				data.phone || null,
				data.avatar || null,
				data.is_verified ?? 0,
				data.is_admin ?? 0,
				now,
				now,
			],
		);

		const user = await this.findById(data.id);
		if (!user) throw new Error("Failed to create user");
		return user;
	},

	async updateProfile(id: string, data: UpdateProfileData): Promise<void> {
		const sets: string[] = [];
		const params: unknown[] = [];

		if (data.name !== undefined) {
			sets.push("name = ?");
			params.push(data.name);
		}
		if (data.email !== undefined) {
			sets.push("email = ?");
			params.push(data.email);
		}
		if (data.phone !== undefined) {
			sets.push("phone = ?");
			params.push(data.phone);
		}
		if (data.avatar !== undefined) {
			sets.push("avatar = ?");
			params.push(data.avatar);
		}
		if (data.is_verified !== undefined) {
			sets.push("is_verified = ?");
			params.push(data.is_verified);
		}

		sets.push("updated_at = ?");
		params.push(Date.now());
		params.push(id);

		DB.run(`UPDATE users SET ${sets.join(", ")} WHERE id = ?`, params);
	},

	async updatePassword(id: string, hashedPassword: string): Promise<void> {
		DB.run("UPDATE users SET password = ?, updated_at = ? WHERE id = ?", [
			hashedPassword,
			Date.now(),
			id,
		]);
	},

	async delete(id: string): Promise<void> {
		DB.run("DELETE FROM users WHERE id = ?", [id]);
	},

	async deleteMany(ids: string[]): Promise<void> {
		if (ids.length === 0) return;
		const placeholders = ids.map(() => "?").join(",");
		const sql = "DELETE FROM users WHERE id IN (" + placeholders + ")";
		DB.run(sql, ids);
	},

	async emailExists(email: string): Promise<boolean> {
		const user = await this.findByEmail(email);
		return !!user;
	},

	async getAll(limit: number = 100, offset: number = 0): Promise<UserRow[]> {
		return DB.all<UserRow>("SELECT * FROM users LIMIT ? OFFSET ?", [
			limit,
			offset,
		]);
	},
};

export default UserRepository;
