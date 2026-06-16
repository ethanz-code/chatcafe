import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id } }: any) {
  await prisma.dialogDetail.deleteMany({ where: { id } });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
