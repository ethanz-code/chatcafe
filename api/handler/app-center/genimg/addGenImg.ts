import prisma from "@/plugin/prismaClient";
import moment from "moment";

export default async function ({
  jwt,
  set,
  headers,
  body: { model, status, prompt, base64 },
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });

  if (!getUserId) return { status: -1, error: "User not found" };

  // 生成时间
  const time = moment().toISOString();

  // 添加数据
  const addData = await prisma.genImageList.create({
    data: {
      userId: getUserId.id,
      imgUrl: "",
      status,
      model,
      time,
      prompt,
      referenceBase64: base64,
    },
    select: {
      id: true,
      imgUrl: true,
      model: true,
      time: true,
      status: true,
      prompt: true,
    },
  });

  const splitD = addData.prompt.split("】")[1];
  return {
    status: 0,
    data: {
      ...addData,
      referenceBase64: "省略...",
      prompt: splitD !== undefined ? splitD : addData.prompt,
    },
  };
}
