import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id } }: any) {
  // 删除数据
  await prisma.activationCode.delete({ where: { id } });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
