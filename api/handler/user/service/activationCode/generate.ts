import prisma from "@/plugin/prismaClient";
import { getClientIp, rateLimit } from "@/plugin/rateLimit";
import CryptoJS from "crypto-js";

const verifyPassword = process.env.ACTIVATION_CODE_PASSWORD;

export default async function ({
  body: { password, dialogueCount, paintingCount },
  set,
  headers,
}: any) {
  // 未配置口令时直接拒绝，避免使用内置默认口令
  if (!verifyPassword) {
    console.error("[activationCode] ACTIVATION_CODE_PASSWORD is not set");
    return { status: -1, error: "验证卡密生成功能未配置" };
  }

  const ip = getClientIp(headers);
  if (!rateLimit(ip, 5, 60_000)) {
    set.status = 429;
    return { status: -1, error: "请求过于频繁，请稍后再试" };
  }

  // 验证密码
  if (password !== verifyPassword)
    return { status: -1, error: "验证卡密生成密码错误" };

  // 生成激活码（如果未传入某一参数undefined会被忽略）
  const data = JSON.stringify({
    dialogueCount,
    paintingCount,
  });
  // 加密
  const encrypted = CryptoJS.AES.encrypt(data, verifyPassword).toString();

  // 存入数据库
  const insertActivationCode = await prisma.activationCode.create({
    data: {
      code: encrypted,
      description: `${dialogueCount}对话次数, ${paintingCount}绘画次数`,
    },
    select: {
      code: true,
    },
  });

  return { status: 0, data: insertActivationCode };
}
