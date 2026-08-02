import prisma from "@/plugin/prismaClient";
import { verifyCodeBuffer } from "@/plugin/verifyCode";
import { hashPassword } from "@/plugin/password";
import { getClientIp, rateLimit } from "@/plugin/rateLimit";
import CryptoJS from "crypto-js";
import moment from "moment";
import { getNewInviteCode } from "@/plugin/userInvite";
import { calcBalance } from "@/plugin/balance";

export default async function ({
  body: { verifyCode, password, inviteCode },
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
    const decodedPassword = CryptoJS.AES.decrypt(password, "ydai").toString(
      CryptoJS.enc.Utf8,
    );

    // 创建用户（使用自增id，避免竞态条件）
    const newUser = await prisma.user.create({
      data: {
        phoneNumber: verifyCodeValue,
        password: hashPassword(decodedPassword),
        inviteCode: getNewInviteCode(),
      },
    });

    // 如果传入了邀请码参数，则将新用户id存入原邀请码用户的Relation分销推广列表中
    if (inviteCode) {
      // 先获取邀请用户
      const inviter = await prisma.user.findFirst({
        where: {
          inviteCode: inviteCode,
        },
        select: {
          id: true,
          phoneNumber: true,
        },
      });

      if (inviter) {
        // 颁发奖励：50次对话
        await calcBalance(
          { id: inviter.id },
          50,
          "dialogue",
        );

        await prisma.user.update({
          where: {
            id: inviter.id,
          },
          data: {
            promotion: {
              create: {
                inviteeUserId: newUser.id,
              },
            },
          },
        });
      }
    }

    return {
      status: 0,
      message: "注册成功",
    };
  }
}
