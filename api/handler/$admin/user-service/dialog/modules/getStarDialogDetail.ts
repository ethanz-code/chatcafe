import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.starDialogDetail.findMany({
    select: {
      id: true,
      dialogUUID: true,
      userId: true,
      userMsg: true,
      userMsgTime: true,
      assistantMsg: true,
      assistantMsgTime: true,
      createdAt: true,
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
