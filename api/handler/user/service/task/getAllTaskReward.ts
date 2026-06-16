import prisma from "@/plugin/prismaClient";
import { getUserTaskStatus } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const result = await prisma.taskReward.findMany({
    orderBy: {
      id: "asc",
    },
    select: {
      name: true,
      description: true,
      rewardDialogue: true,
      rewardPainting: true,
      fluentIconName: true,
      condition: true,
    },
  });

  // remap方式遍历每个item通过taskReward插件计算出任务状态并返回给客户端
  const remaps: any[] = [];
  for (const item of result) {
    const taskResult = await getUserTaskStatus(payload, item);
    remaps.push({
      ...item,
      status: taskResult.taskStatus,
    });
  }

  return { status: 0, message: "success", data: remaps };
}
