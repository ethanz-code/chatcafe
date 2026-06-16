import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.allDialog.findMany({
    select: {
      id: true,
      updatedAt: true,
      title: true,
      uuid: true,
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
