import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.taskRewardReceived.findMany({
    select: {
      id: true,
      createdAt: true,
      userId: true,
      taskRewardId: true,
      value: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
