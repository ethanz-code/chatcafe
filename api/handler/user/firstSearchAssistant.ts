import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取用户id
  const userId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });
  if (!userId) return { status: -1, error: "User not found" };

  // 设置任务奖励值
  const task = await prisma.taskReward.findMany({
    where: {
      name: "first-search-assistant",
    },
    select: {
      taskRewardReceived: {
        where: {
          userId: userId.id,
        },
      },
    },
  });
  if (task.length > 0 && task[0].taskRewardReceived.length > 0)
    await setUserTaskValue(task[0].taskRewardReceived[0].id, 1);

  return { status: 0, message: "success" };
}
