const attempts = new Map<string, number[]>();

export function rateLimit(ip: string, max = 5, windowMs = 60_000): boolean {
  const now = Date.now();
  const list = (attempts.get(ip) || []).filter((t) => now - t < windowMs);
  if (list.length >= max) {
    attempts.set(ip, list);
    return false;
  }
  list.push(now);
  attempts.set(ip, list);
  return true;
}

export function getClientIp(headers: any): string {
  const forwarded = headers?.["x-forwarded-for"];
  if (forwarded) return String(forwarded).split(",")[0].trim();
  return headers?.["x-real-ip"] || "unknown";
}
