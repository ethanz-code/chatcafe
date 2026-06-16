import prisma from "@/plugin/prismaClient";

export default async function ({ body: { description } }: any) {
  const result = await prisma.languageHotIssues.create({
    data: {
      description,
    },
  });

  return {
    data: {
      id: result.id,
    },
    code: "0000",
    msg: "请求成功",
  };
}
