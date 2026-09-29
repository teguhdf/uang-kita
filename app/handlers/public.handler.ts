/**
 * Public Handler
 * Handles public pages and health checks.
 */

import { Response, Request } from "../../type";
import { view } from "../services/View";
import DB from "../services/DB";

export const PublicHandler = {
  async index(_request: Request, response: Response) {
    try {
      const html = view("index.html");
      return response.type("html").send(html);
    } catch (error) {
      console.error("Error in public handler:", error);
      return response.status(500).send("Internal Server Error");
    }
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

  async test(_request: Request, response: Response) {
    return response.send("test");
  },

  async test2(_request: Request, response: Response) {
    return response.type("html").send(view("test.html"));
  },
};

export default PublicHandler;
