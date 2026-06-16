import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.dialogDetail.findMany({
    select: {
      id: true,
      role: true,
      content: true,
      time: true,
      dialogId: true,
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
