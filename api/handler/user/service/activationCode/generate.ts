import prisma from "@/plugin/prismaClient";
import CryptoJS from "crypto-js";

const verifyPassword = Bun.env.ACTIVATION_CODE_PASSWORD || "admin123";

export default async function ({
  body: { password, dialogueCount, paintingCount },
}: any) {
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
