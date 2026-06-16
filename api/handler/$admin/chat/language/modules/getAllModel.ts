import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.languageModel.findMany({
    select: {
      id: true,
      name: true,
      cost: true,
      model: true,
      updatedAt: true,
      relatedUrl: true,
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
