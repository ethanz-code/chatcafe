import prisma from "@/plugin/prismaClient";

export const llmList = async (app: any) => {
  const result = await prisma.languageModel.findMany({
    select: {
      name: true,
      cost: true,
      relatedUrl: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return result.map((item: any) => ({
    model: item.name,
    cost: item.cost,
    relatedUrl: item.relatedUrl,
  }));
};
