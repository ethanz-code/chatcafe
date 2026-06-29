import prisma from "@/plugin/prismaClient";

export default async function ({
  query: { days },
}: any) {
  const dayCount = parseInt(days || "30");
  const since = new Date();
  since.setDate(since.getDate() - dayCount);

  const result = await prisma.usageLog.groupBy({
    by: ["model"],
    where: { createdAt: { gte: since } },
    _count: true,
    _sum: { totalTokens: true, promptTokens: true, completionTokens: true, cost: true },
    orderBy: { _sum: { totalTokens: "desc" } },
  });

  return {
    data: result.map((r) => ({
      model: r.model,
      calls: r._count,
      totalTokens: r._sum.totalTokens || 0,
      promptTokens: r._sum.promptTokens || 0,
      completionTokens: r._sum.completionTokens || 0,
      cost: r._sum.cost || 0,
    })),
    code: "0000",
    msg: "请求成功",
  };
}
