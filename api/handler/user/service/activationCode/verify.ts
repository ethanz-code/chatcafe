import prisma from "@/plugin/prismaClient";
import CryptoJS from "crypto-js";
import { calcBalance } from "@/plugin/balance";

const verifyPassword = Bun.env.ACTIVATION_CODE_PASSWORD || "admin123";

export default async function ({ jwt, set, headers, query: { code } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 检测数据库中是否存在
  const checkIsExists = await prisma.activationCode.findMany({
    where: {
      code,
    },
  });
  if (checkIsExists.length === 0)
    return { status: -1, error: "Invalid activation code" };

  // 数据解密
  const decrypt = CryptoJS.AES.decrypt(
    checkIsExists[0].code,
    verifyPassword,
  ).toString(CryptoJS.enc.Utf8);
  // 将解密的数据解析出来
  const data = JSON.parse(decrypt);

  if (data.dialogueCount)
    await calcBalance(payload, data.dialogueCount, "dialogue");
  if (data.paintingCount)
    await calcBalance(payload, data.paintingCount, "painting");

  // 删除卡密
  const deleteActivationCode = await prisma.activationCode.deleteMany({
    where: {
      code,
    },
  });

  return { status: 0, data: deleteActivationCode };
}
