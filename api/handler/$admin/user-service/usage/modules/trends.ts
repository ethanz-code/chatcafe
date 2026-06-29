import prisma from "@/plugin/prismaClient";

export default async function ({
  query: { days },
}: any) {
  const dayCount = parseInt(days || "30");
  const since = new Date();
  since.setDate(since.getDate() - dayCount);
  since.setHours(0, 0, 0, 0);

  const logs = await prisma.usageLog.findMany({
    where: { createdAt: { gte: since } },
    select: { createdAt: true, totalTokens: true, cost: true },
    orderBy: { createdAt: "asc" },
  });

  const dailyMap = new Map<string, { calls: number; tokens: number; cost: number }>();

  for (let i = 0; i < dayCount; i++) {
    const d = new Date(since);
    d.setDate(d.getDate() + i);
    const key = d.toISOString().split("T")[0];
    dailyMap.set(key, { calls: 0, tokens: 0, cost: 0 });
  }

  for (const log of logs) {
    const key = log.createdAt.toISOString().split("T")[0];
    const entry = dailyMap.get(key);
    if (entry) {
      entry.calls++;
      entry.tokens += log.totalTokens;
      entry.cost += log.cost;
    }
  }

  const data = Array.from(dailyMap.entries()).map(([date, stats]) => ({
    date,
    ...stats,
  }));

  return {
    data,
    code: "0000",
    msg: "请求成功",
  };
}
