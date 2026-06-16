import prisma from "@/plugin/prismaClient";
import { verifyCodeBuffer } from "@/plugin/verifyCode";
import CryptoJS from "crypto-js";
import moment from "moment";
import { getNewInviteCode } from "@/plugin/userInvite";
import { calcBalance } from "@/plugin/balance";

export default async function ({
  body: { verifyCode, password, inviteCode },
}: any) {
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
    const decodedPassword = CryptoJS.AES.decrypt(password, "ydai").toString(
      CryptoJS.enc.Utf8,
    );

    // 获取最大的用户id号码
    const userId = await prisma.user.findMany({
      orderBy: {
        id: "desc",
      },
    });
    const maxIdNumber = userId.length === 0 ? 10000 : userId[0].id + 1;

    // 随机迭代数，生成百位整数
    // 随机生成一个两位整数
    const randomIterate = Math.floor(Math.random() * 100);
    const newUserId = maxIdNumber + randomIterate;

    // 创建用户
    await prisma.user.create({
      data: {
        id: newUserId,
        phoneNumber: verifyCodeValue,
        password: decodedPassword,
        inviteCode: getNewInviteCode(),
      },
    });
    // 如果传入了邀请码参数，则将新用户id存入原邀请码用户的Relation分销推广列表中
    if (inviteCode) {
      // 先获取用户唯一主键id
      const userId = await prisma.user.findMany({
        where: {
          inviteCode: inviteCode,
        },
        select: {
          id: true,
          phoneNumber: true,
          password: true,
        },
      });
      // 颁发奖励：50次对话
      await calcBalance(
        { phoneNumber: userId[0].phoneNumber, password: userId[0].password },
        50,
        "dialogue",
      );

      if (userId.length !== 0)
        await prisma.user.update({
          where: {
            id: userId[0].id,
            inviteCode: inviteCode,
          },
          data: {
            promotion: {
              create: {
                inviteeUserId: newUserId, // 被邀请用户的id
              },
            },
          },
        });
    }

    return {
      status: 0,
      message: "注册成功",
    };
  }
}
