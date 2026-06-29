import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const now = new Date();
  const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const startOfWeek = new Date(now);
  startOfWeek.setDate(now.getDate() - now.getDay());
  startOfWeek.setHours(0, 0, 0, 0);
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const [totalStats, todayStats, weekStats, monthStats] = await Promise.all([
    prisma.usageLog.aggregate({
      _count: true,
      _sum: { totalTokens: true, promptTokens: true, completionTokens: true, cost: true },
    }),
    prisma.usageLog.aggregate({
      where: { createdAt: { gte: startOfToday } },
      _count: true,
      _sum: { totalTokens: true, cost: true },
    }),
    prisma.usageLog.aggregate({
      where: { createdAt: { gte: startOfWeek } },
      _count: true,
      _sum: { totalTokens: true, cost: true },
    }),
    prisma.usageLog.aggregate({
      where: { createdAt: { gte: startOfMonth } },
      _count: true,
      _sum: { totalTokens: true, cost: true },
    }),
  ]);

  const activeUsersToday = await prisma.usageLog.groupBy({
    by: ["userId"],
    where: { createdAt: { gte: startOfToday }, userId: { not: null } },
  });

  return {
    data: {
      total: {
        calls: totalStats._count,
        tokens: totalStats._sum.totalTokens || 0,
        promptTokens: totalStats._sum.promptTokens || 0,
        completionTokens: totalStats._sum.completionTokens || 0,
        cost: totalStats._sum.cost || 0,
      },
      today: {
        calls: todayStats._count,
        tokens: todayStats._sum.totalTokens || 0,
        cost: todayStats._sum.cost || 0,
        activeUsers: activeUsersToday.length,
      },
      week: {
        calls: weekStats._count,
        tokens: weekStats._sum.totalTokens || 0,
        cost: weekStats._sum.cost || 0,
      },
      month: {
        calls: monthStats._count,
        tokens: monthStats._sum.totalTokens || 0,
        cost: monthStats._sum.cost || 0,
      },
    },
    code: "0000",
    msg: "请求成功",
  };
}
