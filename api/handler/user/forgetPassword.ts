import prisma from "@/plugin/prismaClient";
import { verifyCodeBuffer } from "@/plugin/verifyCode";
import { hashPassword } from "@/plugin/password";
import { getClientIp, rateLimit } from "@/plugin/rateLimit";
import CryptoJS from "crypto-js";
import moment from "moment";

export default async function ({
  body: { verifyCode, newPassword },
  set,
  headers,
}: any) {
  const ip = getClientIp(headers);
  if (!rateLimit(ip, 10, 60_000)) {
    set.status = 429;
    return { status: -1, error: "请求过于频繁，请稍后再试" };
  }

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

    // 前端将密码加密，后端需解密后再哈希存储
    const decodedPassword = CryptoJS.AES.decrypt(newPassword, "ydai").toString(
      CryptoJS.enc.Utf8,
    );

    // 更新用户密码
    await prisma.user.update({
      where: {
        phoneNumber: verifyCodeValue,
      },
      data: {
        password: hashPassword(decodedPassword),
      },
    });

    return {
      status: 0,
      message: "注册成功",
    };
  }
}
