import { readFileSync } from "fs";
import { extname } from "path";

const MIME_TYPES: Record<string, string> = {
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".gif": "image/gif",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".json": "application/json",
  ".js": "application/javascript",
  ".css": "text/css",
  ".html": "text/html",
  ".txt": "text/plain",
  ".md": "text/markdown",
  ".mp4": "video/mp4",
  ".pdf": "application/pdf",
};

export function serveFile(path: string) {
  const ext = extname(path).toLowerCase();
  const contentType = MIME_TYPES[ext] || "application/octet-stream";
  const file = readFileSync(path);
  return new Response(file, { headers: { "Content-Type": contentType } });
}
