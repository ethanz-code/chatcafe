import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.punchInDaily.findMany({
    select: {
      id: true,
      createdAt: true,
      rewardDialogue: true,
      userId: true,
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
