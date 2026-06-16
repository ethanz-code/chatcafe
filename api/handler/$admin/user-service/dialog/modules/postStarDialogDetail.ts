import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id, userMsg, assistantMsg } }: any) {
  await prisma.starDialogDetail.update({
    where: {
      id,
    },
    data: {
      userMsg,
      assistantMsg,
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
