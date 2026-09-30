/**
 * Test Setup File
 * Runs before each test file to configure the testing environment.
 *
 * Environment values must be assigned at module load time, not inside
 * beforeAll(), because application modules may open the SQLite connection
 * as soon as they are imported.
 */

import { afterAll } from "vitest";

process.env.NODE_ENV = "test";
process.env.DB_CONNECTION = "test";
process.env.APP_URL = "http://localhost:5555";

afterAll(() => {
	// Cleanup if needed
});
