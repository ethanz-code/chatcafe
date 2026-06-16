import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.goods.findMany({
    select: {
      id: true,
      updatedAt: true,
      title: true,
      description: true,
      dialogueCount: true,
      paintingCount: true,
      imgUrl: true,
      price: true,
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
