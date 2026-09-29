export interface EnvironmentCheck {
	ok: boolean;
	errors: string[];
	warnings: string[];
}

function isHttpsUrl(value: string): boolean {
	try {
		return new URL(value).protocol === "https:";
	} catch {
		return false;
	}
}

export function validateEnvironment(): EnvironmentCheck {
	const errors: string[] = [];
	const warnings: string[] = [];
	const isProduction = process.env.NODE_ENV === "production";

	if (!isProduction) {
		return { ok: true, errors, warnings };
	}

	if (process.env.DB_CONNECTION !== "production") {
		errors.push("DB_CONNECTION must be 'production' when NODE_ENV=production");
	}

	const appUrl = process.env.APP_URL || "";
	if (!appUrl) {
		errors.push("APP_URL is required in production");
	} else if (!isHttpsUrl(appUrl)) {
		errors.push("APP_URL must use https:// in production");
	}

	if (!process.env.DB_PATH) {
		warnings.push("DB_PATH is not set; defaulting to ./data/production.sqlite3");
	}

	if (!process.env.LOCAL_STORAGE_PATH) {
		warnings.push("LOCAL_STORAGE_PATH is not set; defaulting to ./storage");
	}

	if (!process.env.RESEND_API_KEY) {
		warnings.push("RESEND_API_KEY is not set; email delivery features remain disabled");
	}

	const port = Number(process.env.PORT || 5555);
	if (!Number.isInteger(port) || port <= 0 || port > 65535) {
		errors.push("PORT must be a valid TCP port");
	}

	return {
		ok: errors.length === 0,
		errors,
		warnings,
	};
}

export function assertEnvironment(): EnvironmentCheck {
	const result = validateEnvironment();
	if (!result.ok) {
		throw new Error(`Invalid production environment: ${result.errors.join("; ")}`);
	}
	return result;
}
