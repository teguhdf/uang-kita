/**
 * Public Handler
 * Handles the public entry point and health checks.
 */

import { Response, Request } from "../../type";
import DB from "../services/DB";

export const PublicHandler = {
  async index(_request: Request, response: Response) {
    return response.status(303).setHeader("Location", "/login").send();
  },

  async health(_request: Request, response: Response) {
    try {
      const probe = DB.get<{ ok: number }>("SELECT 1 AS ok");
      if (!probe || probe.ok !== 1) {
        return response.status(503).json({ status: "unhealthy" });
      }

      return response.json({
        status: "ok",
        uptime: Math.floor(process.uptime()),
        timestamp: new Date().toISOString(),
      });
    } catch {
      return response.status(503).json({ status: "unhealthy" });
    }
  },
};

export default PublicHandler;
