import prisma from "@/plugin/prismaClient";

export default async function ({ body: { name, model, cost, relatedUrl } }: any) {
  const result = await prisma.languageModel.create({
    data: {
      name,
      model,
      cost,
      relatedUrl: relatedUrl || '',
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
