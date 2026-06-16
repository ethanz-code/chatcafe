import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { id, dialogueBalance, paintingBalance },
}: any) {
  let result = await prisma.user.update({
    where: { id },
    data: {
      dialogueBalance,
      paintingBalance,
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
