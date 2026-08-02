import { randomBytes, scryptSync, timingSafeEqual } from "node:crypto";

const KEY_LEN = 64;

export function hashPassword(password: string): string {
  const salt = randomBytes(16).toString("hex");
  const hash = scryptSync(password, salt, KEY_LEN).toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, stored: string): boolean {
  const [salt, hash] = stored.split(":");
  // 兼容历史明文密码：匹配则返回 true，调用方负责迁移为哈希
  if (!salt || !hash) return password === stored;
  const candidate = new Uint8Array(scryptSync(password, salt, KEY_LEN));
  const expected = new Uint8Array(Buffer.from(hash, "hex"));
  return (
    candidate.length === expected.length &&
    timingSafeEqual(candidate, expected)
  );
}
