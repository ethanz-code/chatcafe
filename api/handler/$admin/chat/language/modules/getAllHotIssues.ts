import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const result = await prisma.languageHotIssues.findMany({
    select: {
      id: true,
      description: true,
      updatedAt: true,
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
