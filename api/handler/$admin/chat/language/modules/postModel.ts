import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id, name, cost, relatedUrl } }: any) {
  await prisma.languageModel.update({
    where: {
      id: id,
    },
    data: {
      name: name,
      cost: cost,
      relatedUrl: relatedUrl,
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
