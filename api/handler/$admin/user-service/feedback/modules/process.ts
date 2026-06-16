import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id } }: any) {
  await prisma.feedback.update({
    where: { id },
    data: { status: "已处理" },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
