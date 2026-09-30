/**
 * Asset Handler
 * Handles static asset serving (dist assets, public assets)
 */

import { Response, Request } from "../../type";
import fs from "fs";
import path from "path";

const cache: Record<string, Buffer> = {};
const distRoot = path.resolve(process.cwd(), "dist/assets");
const publicRoot = path.resolve(process.cwd(), "public");

function isInside(root: string, candidate: string): boolean {
  return candidate === root || candidate.startsWith(root + path.sep);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const AssetHandler = {
  /** Serve compiled Vite assets from dist/assets. */
  async distFolder(request: Request, response: Response) {
    const file = safeDecode(request.params.file || "");
    const filePath = path.resolve(distRoot, file);

    if (!file || !isInside(distRoot, filePath)) {
      return response.status(403).send("Invalid asset path");
    }

    try {
      if (file.endsWith(".css")) {
        response.setHeader("Content-Type", "text/css; charset=utf-8");
      } else if (file.endsWith(".js")) {
        response.setHeader("Content-Type", "application/javascript; charset=utf-8");
      } else {
        response.setHeader("Content-Type", "application/octet-stream");
      }

      response.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      if (cache[file]) return response.send(cache[file]);

      const exists = await fs.promises
        .stat(filePath)
        .then((stat) => stat.isFile())
        .catch(() => false);

      if (!exists) return response.status(404).send("File not found");

      const fileContent = await fs.promises.readFile(filePath);
      cache[file] = fileContent;
      return response.send(fileContent);
    } catch (error) {
      console.error("Error serving dist file:", error);
      return response.status(500).send("Internal server error");
    }
  },

  /** Serve explicitly allowed files from the public folder. */
  async publicFolder(request: Request, response: Response) {
    const allowedExtensions = [
      ".ico", ".png", ".jpeg", ".jpg", ".gif", ".svg",
      ".txt", ".pdf", ".css", ".js",
      ".woff", ".woff2", ".ttf", ".eot", ".webp",
      ".mp4", ".webm", ".mp3", ".wav",
    ];

    const requestPath = safeDecode(request.path || "");
    const relativePath = requestPath.startsWith("/public/")
      ? requestPath.slice("/public/".length)
      : "";
    const fullPath = path.resolve(publicRoot, relativePath);

    if (!relativePath || !isInside(publicRoot, fullPath)) {
      return response.status(403).send("Invalid public path");
    }

    const ext = path.extname(fullPath).toLowerCase();
    if (!allowedExtensions.includes(ext)) {
      return response.status(403).send("File type not allowed");
    }

    const exists = await fs.promises
      .stat(fullPath)
      .then((stat) => stat.isFile())
      .catch(() => false);
    if (!exists) return response.status(404).send("File not found");

    response.setHeader("Cache-Control", "public, max-age=86400");
    return response.download(fullPath);
  },
};

export default AssetHandler;
