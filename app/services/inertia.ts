import { Inertia } from "hyper-express-inertia";
import { SessionStore } from "../session/store";
import type { Request } from "../../type";
import { readFileSync, existsSync } from "fs";
import path from "path";

let pkg: { version?: string } = { version: "1.0.0" };
try {
	pkg = JSON.parse(
		readFileSync(path.join(process.cwd(), "package.json"), "utf8"),
	);
} catch {}

function getViteDevUrl(): string {
	try {
		const portFile = path.join(process.cwd(), ".vite-port");
		if (existsSync(portFile)) {
			return readFileSync(portFile, "utf8").trim();
		}
	} catch {}
	return `http://localhost:${process.env.VITE_PORT || "5173"}`;
}

let viteManifest: Record<string, { file: string; css?: string[] }> = {};
try {
	const manifestPath = path.join(process.cwd(), "dist/.vite/manifest.json");
	if (existsSync(manifestPath)) {
		viteManifest = JSON.parse(readFileSync(manifestPath, "utf8"));
	}
} catch {}

const isProduction = process.env.NODE_ENV === "production";

function productionAsset(entryKey: string, fallback: string): string {
	const entry = viteManifest[entryKey];
	if (entry?.file) return entry.file;
	return fallback;
}

export const inertia = new Inertia({
	version: pkg.version,
	title: "UANG KITA · Sedalam Ini.",
	favicon: "/public/sedalam-ini-mark.svg",
	csrf: true,
	devUrl: !isProduction ? getViteDevUrl() : undefined,
	manifest: isProduction ? viteManifest : undefined,
	script: "src/app.js",
	stylesheet: isProduction
		? productionAsset("src/index.css", "src/index.css")
		: "src/index.css",
});

inertia.shareFunc("user", (req) => {
	const session = SessionStore.get(req as unknown as Request);
	if (!session.user_id) return null;
	return {
		id: session.user_id,
		name: session.name,
		email: session.email,
		avatar: session.avatar,
		is_admin: session.is_admin,
		is_verified: session.email_verified,
	};
});

inertia.shareFunc("flash", (req) => {
	const flashMessages = SessionStore.getFlash(req as unknown as Request);
	return Object.keys(flashMessages).length > 0 ? flashMessages : null;
});

inertia.share("appName", "UANG KITA");
inertia.share("appVersion", pkg.version);

export default inertia;
