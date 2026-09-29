/**
 * Database Service
 * Provides a configured better-sqlite3 database connection.
 * Supports multiple database connections for different environments.
 */

import "dotenv/config";
import Database from "better-sqlite3";
import { mkdirSync } from "fs";
import path from "path";
import type { RunResult } from "../../type/db-types";

function databaseFilename(stage: string): string {
	if (stage === "production") {
		return process.env.DB_PATH || "./data/production.sqlite3";
	}
	if (stage === "test") {
		return process.env.TEST_DB_PATH || "./data/test.sqlite3";
	}
	return process.env.DEV_DB_PATH || "./data/dev.sqlite3";
}

function ensureDatabaseDirectory(filename: string): void {
	if (filename === ":memory:") return;
	const directory = path.dirname(path.resolve(filename));
	mkdirSync(directory, { recursive: true });
}

function openDatabase(filename: string): Database.Database {
	ensureDatabaseDirectory(filename);
	const db = new Database(filename);
	db.pragma("journal_mode = WAL");
	db.pragma("synchronous = NORMAL");
	db.pragma("foreign_keys = ON");
	db.pragma("busy_timeout = 5000");
	return db;
}

const currentStage = process.env.DB_CONNECTION || "development";
if (!["development", "production", "test"].includes(currentStage)) {
	throw new Error(`Invalid database configuration for connection: ${currentStage}`);
}

const filename = databaseFilename(currentStage);
const nativeDb = openDatabase(filename);

/**
 * Statement cache for prepared statement reuse
 */
const statementCache = new Map<string, Database.Statement>();

/**
 * Get or create a prepared statement
 */
function prepare(sql: string): Database.Statement {
	let stmt = statementCache.get(sql);
	if (!stmt) {
		stmt = nativeDb.prepare(sql);
		statementCache.set(sql, stmt);
	}
	return stmt;
}

/**
 * Database Service interface
 */
interface DBService {
	/** Get a single row */
	get<T = Record<string, unknown>>(
		sql: string,
		params?: unknown[],
	): T | undefined;
	/** Get multiple rows */
	all<T = Record<string, unknown>>(sql: string, params?: unknown[]): T[];
	/** Execute a write query */
	run(sql: string, params?: unknown[]): RunResult;
	/** Execute a transaction */
	transaction<T>(fn: () => T): T;
	/** Get the native database instance */
	getNativeDb(): Database.Database;
	/** Get the active database filename */
	getFilename(): string;
	/** Create a new connection for a specific stage */
	getConnection(stage: string): DBService;
}

/**
 * DB Service with cached prepared statements
 */
const DB: DBService = {
	get<T>(sql: string, params: unknown[] = []): T | undefined {
		try {
			const stmt = prepare(sql);
			return stmt.get(...params) as T | undefined;
		} catch (error) {
			console.error("DB get error:", error);
			throw error;
		}
	},

	all<T>(sql: string, params: unknown[] = []): T[] {
		try {
			const stmt = prepare(sql);
			return stmt.all(...params) as T[];
		} catch (error) {
			console.error("DB all error:", error);
			throw error;
		}
	},

	run(sql: string, params: unknown[] = []): RunResult {
		try {
			const stmt = prepare(sql);
			const result = stmt.run(...params);
			return {
				changes: result.changes,
				lastInsertRowid: Number(result.lastInsertRowid),
			};
		} catch (error) {
			console.error("DB run error:", error);
			throw error;
		}
	},

	transaction<T>(fn: () => T): T {
		return nativeDb.transaction(fn)();
	},

	getNativeDb(): Database.Database {
		return nativeDb;
	},

	getFilename(): string {
		return filename;
	},

	getConnection(stage: string): DBService {
		if (!["development", "production", "test"].includes(stage)) {
			throw new Error(`Unknown database connection: ${stage}`);
		}

		const connFilename = databaseFilename(stage);
		const db = openDatabase(connFilename);
		const connStmtCache = new Map<string, Database.Statement>();

		return {
			get<T>(sql: string, params: unknown[] = []): T | undefined {
				let stmt = connStmtCache.get(sql);
				if (!stmt) {
					stmt = db.prepare(sql);
					connStmtCache.set(sql, stmt);
				}
				return stmt.get(...params) as T | undefined;
			},
			all<T>(sql: string, params: unknown[] = []): T[] {
				let stmt = connStmtCache.get(sql);
				if (!stmt) {
					stmt = db.prepare(sql);
					connStmtCache.set(sql, stmt);
				}
				return stmt.all(...params) as T[];
			},
			run(sql: string, params: unknown[] = []): RunResult {
				let stmt = connStmtCache.get(sql);
				if (!stmt) {
					stmt = db.prepare(sql);
					connStmtCache.set(sql, stmt);
				}
				const result = stmt.run(...params);
				return {
					changes: result.changes,
					lastInsertRowid: Number(result.lastInsertRowid),
				};
			},
			transaction<T>(fn: () => T): T {
				return db.transaction(fn)();
			},
			getNativeDb(): Database.Database {
				return db;
			},
			getFilename(): string {
				return connFilename;
			},
			getConnection(_stage: string): DBService {
				throw new Error("Nested getConnection not supported");
			},
		};
	},
};

export default DB;

/**
 * Get current timestamp in milliseconds
 */
export function now(): number {
	return Date.now();
}
