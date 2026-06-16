import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.configuration.findMany({
    select: {
      id: true,
      name: true,
      value: true,
      updatedAt: true,
      description: true,
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
