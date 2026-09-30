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

function isValidTimeZone(value: string): boolean {
	try {
		new Intl.DateTimeFormat("en-US", { timeZone: value }).format();
		return true;
	} catch {
		return false;
	}
}

export function validateEnvironment(): EnvironmentCheck {
	const errors: string[] = [];
	const warnings: string[] = [];
	const certificateEnabled = process.env.HAS_CERTIFICATE === "true";

	if (certificateEnabled) {
		if (!process.env.TLS_KEY_PATH) errors.push("TLS_KEY_PATH is required when HAS_CERTIFICATE=true");
		if (!process.env.TLS_CERT_PATH) errors.push("TLS_CERT_PATH is required when HAS_CERTIFICATE=true");
	}

	const isProduction = process.env.NODE_ENV === "production";
	if (!isProduction) return { ok: errors.length === 0, errors, warnings };

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
		errors.push("DB_PATH is required in production and must point to persistent storage");
	}

	if (!process.env.LOCAL_STORAGE_PATH) {
		errors.push("LOCAL_STORAGE_PATH is required in production and must point to persistent storage");
	}

	if (!process.env.BACKUP_DIR) {
		warnings.push("BACKUP_DIR is not set; scheduled production backups are not configured");
	}

	const timeZone = process.env.APP_TIMEZONE || "Asia/Jakarta";
	if (!isValidTimeZone(timeZone)) {
		errors.push("APP_TIMEZONE must be a valid IANA timezone, for example Asia/Jakarta");
	}

	const googleEnabled = process.env.ENABLE_GOOGLE_OAUTH === "true";
	if (googleEnabled) {
		if (!process.env.GOOGLE_CLIENT_ID) errors.push("GOOGLE_CLIENT_ID is required when Google OAuth is enabled");
		if (!process.env.GOOGLE_CLIENT_SECRET) errors.push("GOOGLE_CLIENT_SECRET is required when Google OAuth is enabled");
		if (!process.env.GOOGLE_REDIRECT_URI) errors.push("GOOGLE_REDIRECT_URI is required when Google OAuth is enabled");
	}

	if (process.env.RESEND_API_KEY && !process.env.MAIL_FROM_ADDRESS) {
		errors.push("MAIL_FROM_ADDRESS is required when RESEND_API_KEY is configured");
	}
	if (!process.env.RESEND_API_KEY && !process.env.DRIPSENDER_API_KEY) {
		warnings.push("No password-recovery delivery provider is configured");
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
		throw new Error(`Invalid environment: ${result.errors.join("; ")}`);
	}
	return result;
}
