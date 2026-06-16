import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.activationCode.findMany({
    select: {
      id: true,
      code: true,
      updatedAt: true,
      description: true,
    },
    orderBy: {
      id: "asc",
    },
  });
  result = result.map((item) => {
    return {
      ...item,
      dialogueCount: Number(item.description?.split("对话次数")[0]) || 0,
      paintingCount:
        Number(item.description?.split("绘画次数")[0].split(",")[1]) || 0,
    };
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
