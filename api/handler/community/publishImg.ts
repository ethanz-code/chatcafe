import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers, body: { imgId } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 校验Img是否存在
  const img = await prisma.genImageList.findUnique({
    where: {
      id: imgId,
    },
  });
  if (!img) return { status: -1, error: "Img not found" };

  // 获取UserID
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

  // 确保当前图片在社区数据表中不存在
  const curImgIdNotExists = await prisma.imageCommunity.findMany({
    where: {
      imgId: imgId,
    },
  });
  if (curImgIdNotExists.length > 0)
    return { status: -1, error: "Img already exists in community" };

  // 将图片id和UserID存到社区数据表中
  const insertCommunityData = await prisma.imageCommunity.create({
    data: {
      userId: getUserId.id,
      imgId: imgId,
    },
  });

  // 设置任务奖励值
  const task = await prisma.taskReward.findMany({
    where: {
      name: "first-publish",
    },
    select: {
      taskRewardReceived: {
        where: {
          userId: getUserId.id,
        },
      },
    },
  });
  if (task.length > 0 && task[0].taskRewardReceived.length > 0)
    await setUserTaskValue(task[0].taskRewardReceived[0].id, 1);

  return { status: 0, data: insertCommunityData };
}
