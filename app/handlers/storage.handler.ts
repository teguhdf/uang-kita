/**
 * Storage Handler
 * Handles local storage file serving
 */

import { Response, Request } from "../../type";
import fs from "fs";
import path from "path";
import "dotenv/config";

const storageRoot = path.resolve(process.env.LOCAL_STORAGE_PATH || "./storage");

function isInsideStorage(candidate: string): boolean {
  return candidate === storageRoot || candidate.startsWith(storageRoot + path.sep);
}

function safeDecode(value: string): string {
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export const StorageHandler = {
  async serveFile(request: Request, response: Response) {
    const requestPath = safeDecode(request.path || "");
    const relativePath = requestPath.startsWith("/storage/")
      ? requestPath.slice("/storage/".length)
      : "";
    const fullPath = path.resolve(storageRoot, relativePath);

    try {
      if (!relativePath || !isInsideStorage(fullPath)) {
        return response.status(403).send("Invalid storage path");
      }

      const allowedExtensions = [
        ".ico", ".png", ".jpeg", ".jpg", ".gif", ".svg", ".webp",
        ".txt", ".pdf", ".css", ".js",
        ".woff", ".woff2", ".ttf", ".eot",
        ".mp4", ".webm", ".mp3", ".wav",
      ];

      const ext = path.extname(fullPath).toLowerCase();
      if (!allowedExtensions.includes(ext)) {
        return response.status(403).send("File type not allowed");
      }

      const exists = await fs.promises
        .stat(fullPath)
        .then((stat) => stat.isFile())
        .catch(() => false);
      if (!exists) return response.status(404).send("File not found");

      response.setHeader("Cache-Control", "public, max-age=31536000, immutable");

      const mimeTypes: Record<string, string> = {
        ".jpg": "image/jpeg",
        ".jpeg": "image/jpeg",
        ".png": "image/png",
        ".gif": "image/gif",
        ".svg": "image/svg+xml",
        ".webp": "image/webp",
        ".css": "text/css; charset=utf-8",
        ".js": "application/javascript; charset=utf-8",
        ".woff": "font/woff",
        ".woff2": "font/woff2",
        ".ttf": "font/ttf",
        ".eot": "application/vnd.ms-fontobject",
        ".pdf": "application/pdf",
        ".mp4": "video/mp4",
        ".webm": "video/webm",
        ".mp3": "audio/mpeg",
        ".wav": "audio/wav",
        ".txt": "text/plain; charset=utf-8",
        ".ico": "image/x-icon",
      };

      if (mimeTypes[ext]) response.setHeader("Content-Type", mimeTypes[ext]);
      return response.download(fullPath);
    } catch (error) {
      console.error("Error serving storage file:", error);
      return response.status(500).send("Internal server error");
    }
  },
};

export default StorageHandler;
