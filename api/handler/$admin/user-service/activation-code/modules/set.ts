import prisma from "@/plugin/prismaClient";
import { getConfig } from "@/plugin/writeConfig";
import CryptoJS from "crypto-js";

const config = await getConfig();
const verifyPassword = config["gen-activation-code-password"];

export default async function ({
  body: { password, dialogueCount, paintingCount },
}: any) {
  // 验证密码
  if (password !== verifyPassword)
    return {
      data: null,
      code: "1000",
      msg: "验证卡密生成密码错误",
    };

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
      description: `${dialogueCount || 0}对话次数, ${paintingCount || 0}绘画次数`,
    },
    select: {
      id: true,
      code: true,
      updatedAt: true,
      description: true,
    },
  });
  const result = { ...insertActivationCode, dialogueCount, paintingCount };

  return { data: result, code: "0000", msg: "生成成功" };
}
