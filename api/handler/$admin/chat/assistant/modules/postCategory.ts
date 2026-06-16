import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id, name } }: any) {
  let result = await prisma.assistantCategory.update({
    where: { id },
    data: {
      name,
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
