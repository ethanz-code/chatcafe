import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.feedback.findMany({
    where: {
      status: "待处理",
    },
    select: {
      id: true,
      createdAt: true,
      content: true,
      type: true,
      contact: true,
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
