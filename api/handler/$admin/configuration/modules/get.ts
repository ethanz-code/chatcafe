import prisma from "@/plugin/prismaClient";

export default async function () {
  const result = await prisma.configuration.findMany({
    select: {
      id: true,
      name: true,
      value: true,
      description: true,
      updatedAt: true,
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
