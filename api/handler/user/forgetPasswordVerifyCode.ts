import { verifyCodeBuffer } from "@/plugin/verifyCode";
import moment from "moment";
import prisma from "@/plugin/prismaClient";
import { sendSmsWithOptions } from "@/plugin/dysmsapi2024";
import { getClientIp, rateLimit } from "@/plugin/rateLimit";

// 写一个递归生成随机6位验证码的函数，如果生成的验证码已经存在，则递归调用该函数，直到生成一个不重复的验证码
const generateVerifyCode = (): number => {
  const code = Math.floor(Math.random() * 900000) + 100000;
  if (verifyCodeBuffer.has(code.toString())) {
    return generateVerifyCode();
  }
  return code;
};

export default async function ({ body: { phoneNumber }, set, headers }: any) {
  // 限流：防止短信轰炸（同一 IP 每分钟最多 3 条验证码）
  const ip = getClientIp(headers);
  if (!rateLimit(ip, 3, 60_000)) {
    set.status = 429;
    return { status: -1, error: "请求过于频繁，请稍后再试" };
  }

  // 先检测数据表中是否存在该用户
  const getUser = await prisma.user.findUnique({
    where: {
      phoneNumber: phoneNumber,
    },
  });
  if (!getUser) return { status: -1, message: "用户不存在" };

  // 生成随机6位验证码，存入verifyCodeBuffer中，如果验证码存在将不断递归重新生成
  const code = generateVerifyCode();
  verifyCodeBuffer.set(code.toString(), {
    password: phoneNumber,
    expireTime: 60 * 5,
    createdAt: moment().toISOString(),
  });

  // 发送验证码到用户手机
  // ...
  sendSmsWithOptions(phoneNumber, code);

  return {
    status: 0,
    message: "生成成功",
  };
}
