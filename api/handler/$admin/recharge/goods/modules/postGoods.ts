import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { id, title, dialogueCount, paintingCount, imgUrl, price },
}: any) {
  await prisma.goods.update({
    where: { id },
    data: {
      title,
      dialogueCount,
      paintingCount,
      imgUrl,
      price,
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
