import prisma from "@/plugin/prismaClient";
import { hashPassword, verifyPassword } from "@/plugin/password";
import { getClientIp, rateLimit } from "@/plugin/rateLimit";
import CryptoJS from "crypto-js";

export default async function ({ body, jwt, cookie: { ydai_auth }, set, headers }: any) {
  const ip = getClientIp(headers);
  if (!rateLimit(ip, 10, 60_000)) {
    set.status = 429;
    return { status: -1, error: "请求过于频繁，请稍后再试" };
  }

  const decodedPassword = CryptoJS.AES.decrypt(body.password, "ydai").toString(
    CryptoJS.enc.Utf8,
  );

  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: body.phoneNumber,
    },
    select: {
      id: true,
      phoneNumber: true,
      password: true,
      dialogueBalance: true,
      paintingBalance: true,
      vip: true,
      name: true,
      avatar: true,
      createdAt: true,
      inviteCode: true,
    },
  });

  if (!user) return { status: -1, message: "用户不存在或密码错误！" };

  if (!verifyPassword(decodedPassword, user.password)) {
    return { status: -1, message: "用户不存在或密码错误！" };
  }

  // 历史明文密码首次登录时自动迁移为哈希
  if (!user.password.includes(":")) {
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashPassword(decodedPassword) },
    });
  }

  // 不要将密码签入 token
  const { password: _password, ...tokenPayload } = user;
  const option = {
    value: await jwt.sign(tokenPayload),
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  };
  ydai_auth.set(option);

  return {
    status: 0,
    message: "登录成功！",
    data: {
      token: ydai_auth.value,
      ...tokenPayload,
    },
  };
}
