import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers, body: { id } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 查询公开发布作品是否存在
  const getLikes = await prisma.imageCommunity.findUnique({
    where: { id },
  });
  if (!getLikes) return { status: -1, error: "未找到公开发布的作品！" };

  // 获取用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
  });
  if (!getUserId) return { status: -1, error: "未找到用户！" };

  // 检测是否被当前用户点赞过
  if (getLikes.likes.includes(getUserId.id))
    return { status: -1, error: "您已点赞过该作品！" };

  // 添加点赞
  await prisma.imageCommunity.update({
    where: { id },
    data: {
      likes: {
        push: getUserId.id,
      },
    },
  });

  // 设置任务奖励值
  const task = await prisma.taskReward.findMany({
    where: {
      name: "first-thumb-up",
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

  return { status: 0, message: "SUCCESS" };
}
