import prisma from "@/plugin/prismaClient";

export default async function ({ body: { name, model, cost, relatedUrl, imgUrl, apiKey, baseUrl } }: any) {
  const result = await prisma.languageModel.create({
    data: {
      name,
      model,
      cost,
      relatedUrl: relatedUrl || '',
      imgUrl: imgUrl || '',
      apiKey: apiKey || '',
      baseUrl: baseUrl || '',
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
