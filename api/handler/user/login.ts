import prisma from "@/plugin/prismaClient";
import CryptoJS from "crypto-js";

export default async function ({ body, jwt, cookie: { ydai_auth }, set }: any) {
  const decodedPassword = CryptoJS.AES.decrypt(body.password, "ydai").toString(
    CryptoJS.enc.Utf8,
  );

  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: body.phoneNumber,
      password: decodedPassword,
    },
    select: {
      id: true,
      phoneNumber: true,
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

  const option = {
    value: await jwt.sign(user),
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
      ...user,
    },
  };
}
