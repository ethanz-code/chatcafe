import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id, name, cost, relatedUrl, imgUrl, apiKey, baseUrl } }: any) {
  await prisma.languageModel.update({
    where: { id },
    data: {
      name,
      cost,
      relatedUrl,
      imgUrl: imgUrl || '',
      apiKey: apiKey || '',
      baseUrl: baseUrl || '',
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
