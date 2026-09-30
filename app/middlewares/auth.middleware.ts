/**
 * Auth middleware backed by SessionStore.
 */

import { SessionStore } from "../session/store";
import type { Request, Response } from "../../type";

export async function authRequired(req: Request, res: Response): Promise<void> {
	if (req.method === "OPTIONS") return;

	const session = SessionStore.get(req);
	if (!session.user_id) {
		if (req.header("X-Inertia") === "true") {
			SessionStore.destroy(req, res);
			res.setHeader("X-Inertia-Location", "/login");
			res.status(409).send();
			return;
		}

		SessionStore.destroy(req, res);
		safeRedirect(res, "/login");
		return;
	}

	req.user = {
		id: session.user_id,
		name: session.name || null,
		email: session.email,
		phone: null,
		avatar: session.avatar || null,
		is_admin: session.is_admin ? 1 : 0,
		is_verified: session.email_verified ? 1 : 0,
	};
}

export async function guest(req: Request, res: Response): Promise<void> {
	const session = SessionStore.get(req);
	if (session.user_id) {
		safeRedirect(res, "/home");
		return;
	}
}

export async function adminRequired(req: Request, res: Response): Promise<void> {
	const session = SessionStore.get(req);
	if (!session.user_id) {
		res.status(401).json({ error: "Unauthorized" });
		return;
	}
	if (!session.is_admin) {
		res.status(403).json({ error: "Admin access required" });
		return;
	}
}

function safeRedirect(res: Response, url: string): void {
	if (!url.startsWith("/")) url = "/login";
	res.status(303).setHeader("Location", url).send();
}

export default authRequired;
