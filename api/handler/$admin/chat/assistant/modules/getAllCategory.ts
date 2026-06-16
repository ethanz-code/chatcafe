import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.assistantCategory.findMany({
    select: {
      id: true,
      updatedAt: true,
      name: true,
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
