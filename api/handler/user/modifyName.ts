import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers, body: { name } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 修改用户名
  const modifyUserName = await prisma.user.update({
    where: {
      id: payload.id,
    },
    select: {
      id: true,
    },
    data: {
      name: name,
    },
  });

  // 设置任务奖励值
  const task = await prisma.taskReward.findMany({
    where: {
      name: "first-edit-username",
    },
    select: {
      taskRewardReceived: {
        where: {
          userId: modifyUserName!.id,
        },
      },
    },
  });
  if (task.length > 0 && task[0].taskRewardReceived.length > 0)
    await setUserTaskValue(task[0].taskRewardReceived[0].id, 1);

  return { status: 0, msg: "Modify success" };
}
