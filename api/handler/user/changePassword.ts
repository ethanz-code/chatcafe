import prisma from "@/plugin/prismaClient";
import CryptoJS from "crypto-js";

export default async function ({
  body: { originPassword, newPassword },
  jwt,
  set,
  headers,
}: any) {
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  // 先获取数据库中的密码
  const dbUser = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { password: true },
  });
  if (!dbUser) return { status: -1, error: "User not found" };

  // 前端将密码加密，后端需解密后再存入数据库
  const decodedOriginPassword = CryptoJS.AES.decrypt(
    originPassword,
    "ydai",
  ).toString(CryptoJS.enc.Utf8);
  const decodedPassword = CryptoJS.AES.decrypt(newPassword, "ydai").toString(
    CryptoJS.enc.Utf8,
  );

  // 比对原密码是否正确
  const diffPassword = decodedOriginPassword === dbUser.password;
  if (!diffPassword) return { status: -1, message: "原密码错误" };

  // 修改数据库中用户密码
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      password: decodedPassword,
    },
  });

  return { status: 0, message: "修改成功" };
}
