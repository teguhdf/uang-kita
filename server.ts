// UANG KITA server entrypoint
// Boots HTTP, validates production configuration, and wires security + routes.

import "dotenv/config";

import Web from "./routes/web";
import HyperExpress from "hyper-express";
import path from "path";
import type { Response, Request } from "./type";
import { logError, logInfo } from "./app/services/Logger";
import { assertEnvironment } from "./app/services/Env";
import { securityHeaders } from "./app/middlewares/security-headers.middleware";

const environment = assertEnvironment();
for (const warning of environment.warnings) {
	logInfo(`Environment warning: ${warning}`);
}

const option = {
	max_body_length: 10 * 1024 * 1024,
	key_file_name: "",
	cert_file_name: "",
};

if (process.env.HAS_CERTIFICATE === "true") {
	option.key_file_name = path.resolve(process.env.TLS_KEY_PATH || "");
	option.cert_file_name = path.resolve(process.env.TLS_CERT_PATH || "");
}

const webserver = new HyperExpress.Server(option);

import "app/services/View";

const isProduction = process.env.NODE_ENV === "production";
webserver.use(
	securityHeaders({
		contentSecurityPolicy: isProduction
			? "default-src 'self'; base-uri 'self'; form-action 'self'; object-src 'none'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'none';"
			: false,
		strictTransportSecurity: isProduction
			? "max-age=31536000; includeSubDomains"
			: false,
		xFrameOptions: "DENY",
		xContentTypeOptions: true,
		referrerPolicy: "strict-origin-when-cross-origin",
		permissionsPolicy: "camera=(), microphone=(), geolocation=()",
	}),
);

// State-changing product requests use JSON/Inertia plus a host-only SameSite session cookie.
// Keep a future full CSRF-token rollout as a separate tested change instead of enabling
// middleware globally without client token injection.
webserver.use(Web);

const PORT = parseInt(process.env.PORT || "", 10) || 5555;

webserver.set_error_handler(
	(request: Request, response: Response, error: any) => {
		logError("Unhandled request error", error, {
			method: request.method,
			url: request.url,
			ip: request.ip,
		});

		const isDevelopment = process.env.NODE_ENV !== "production";
		response.status(500).json({
			error: isDevelopment ? error.message : "Internal server error",
			...(isDevelopment && { stack: error.stack, code: error.code }),
		});
	},
);

webserver
	.listen(PORT)
	.then(() => {
		const protocol = process.env.HAS_CERTIFICATE === "true" ? "https" : "http";
		logInfo(`Server is running at ${protocol}://localhost:${PORT}`, {
			port: PORT,
			protocol,
			environment: process.env.NODE_ENV || "development",
		});
	})
	.catch((err: any) => {
		logError("Failed to start server", err);
		process.exit(1);
	});

process.on("SIGTERM", () => {
	logInfo("SIGTERM signal received, shutting down");
	process.exit(0);
});

process.on("SIGINT", () => {
	logInfo("SIGINT signal received, shutting down");
	process.exit(0);
});
