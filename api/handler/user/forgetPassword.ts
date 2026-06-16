import prisma from "@/plugin/prismaClient";
import { verifyCodeBuffer } from "@/plugin/verifyCode";
import CryptoJS from "crypto-js";
import moment from "moment";

export default async function ({ body: { verifyCode, newPassword } }: any) {
  // 检测verifyCode是否在verifyCodeBuffer中
  if (!verifyCodeBuffer.has(verifyCode)) {
    return {
      status: -1,
      message: "验证码错误",
    };
  } else {
    // 将所有过期的验证码删除掉
    verifyCodeBuffer.forEach((value, key) => {
      if (
        moment(moment().toISOString()).diff(
          moment(value.createdAt),
          "seconds",
        ) > value.expireTime
      ) {
        verifyCodeBuffer.delete(key);
      }
    });

    // 检测verifyCode是否在verifyCodeBuffer中
    if (!verifyCodeBuffer.has(verifyCode)) {
      return {
        status: -1,
        message: "验证码失效",
      };
    }

    // 拿到verifyCodeBuffer中密码值
    const verifyCodeValue = verifyCodeBuffer.get(verifyCode)!.password;
    // 删除verifyCodeBuffer中的verifyCode
    verifyCodeBuffer.delete(verifyCode);

    // 前端将密码加密，后端需解密后再存入数据库
    const decodedPassword = CryptoJS.AES.decrypt(newPassword, "ydai").toString(
      CryptoJS.enc.Utf8,
    );

    // 更新用户密码
    await prisma.user.update({
      where: {
        phoneNumber: verifyCodeValue,
      },
      data: {
        password: decodedPassword,
      },
    });

    return {
      status: 0,
      message: "注册成功",
    };
  }
}
