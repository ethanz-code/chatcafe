import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.taskReward.findMany({
    select: {
      id: true,
      updatedAt: true,
      condition: true,
      description: true,
      rewardDialogue: true,
      rewardPainting: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  result = result.map((item) => {
    return {
      ...item,
      description: item.description.split("】")[0].slice(1),
    };
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
