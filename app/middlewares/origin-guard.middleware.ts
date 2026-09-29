import type { Request, Response } from "../../type";

const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"]);

function header(request: Request, name: string): string {
	const value = request.headers[name.toLowerCase()];
	if (Array.isArray(value)) return value[0] || "";
	return typeof value === "string" ? value : "";
}

function originOf(value: string): string | null {
	if (!value) return null;
	try {
		return new URL(value).origin;
	} catch {
		return null;
	}
}

export async function sameOriginGuard(request: Request, response: Response) {
	if (process.env.NODE_ENV !== "production") return;
	if (SAFE_METHODS.has(request.method.toUpperCase())) return;

	const appOrigin = originOf(process.env.APP_URL || "");
	if (!appOrigin) {
		return response.status(500).json({ error: "Invalid server origin configuration" });
	}

	const origin = originOf(header(request, "origin"));
	const referer = originOf(header(request, "referer"));
	const fetchSite = header(request, "sec-fetch-site").toLowerCase();

	// Modern browsers send Origin on state-changing requests. Referer is a safe
	// fallback for user agents that omit it. Reject requests with neither signal.
	const requestOrigin = origin || referer;
	if (!requestOrigin || requestOrigin !== appOrigin) {
		return response.status(403).json({
			success: false,
			error: { message: "Cross-origin request rejected", code: "ORIGIN_REJECTED" },
		});
	}

	// When Fetch Metadata is present, require an actual same-origin navigation/request.
	if (fetchSite && fetchSite !== "same-origin" && fetchSite !== "none") {
		return response.status(403).json({
			success: false,
			error: { message: "Cross-site request rejected", code: "FETCH_SITE_REJECTED" },
		});
	}
}

export default sameOriginGuard;
