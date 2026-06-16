import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取所有商品
  const goods = await prisma.goods.findMany({
    orderBy: {
      id: "asc",
    },
  });

  // remap
  const remapGoods = goods.map((good: any) => {
    return {
      id: good.id,
      title: good.title,
      price: good.price,
      description: good.description,
      imgUrl: good.imgUrl,
      dialogueCount: good.dialogueCount,
      paintingCount: good.paintingCount,
    };
  });

  return { status: 0, data: remapGoods };
}
