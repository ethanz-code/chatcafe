import prisma from "@/plugin/prismaClient";
import { receiveAReward } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers, body: { taskName } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({ where: { id: payload.id } });
  if (!user) return { status: -1, error: "User not found" };

  const task = await prisma.taskReward.findMany({
    where: {
      name: taskName,
    },
    select: {
      name: true,
      condition: true,
    },
  });

  await receiveAReward(payload, {
    name: task[0].name,
    condition: task[0].condition,
  });

  return { status: 0, message: "success" };
}
