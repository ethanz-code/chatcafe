import prisma from "@/plugin/prismaClient";

export default async function ({
  query: { days, page, pageSize },
}: any) {
  const dayCount = parseInt(days || "30");
  const p = parseInt(page || "1");
  const ps = parseInt(pageSize || "20");
  const since = new Date();
  since.setDate(since.getDate() - dayCount);

  const [result, total] = await Promise.all([
    prisma.usageLog.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since }, userId: { not: null } },
      _count: true,
      _sum: { totalTokens: true, cost: true },
      _max: { createdAt: true },
      orderBy: { _sum: { totalTokens: "desc" } },
      skip: (p - 1) * ps,
      take: ps,
    }),
    prisma.usageLog.groupBy({
      by: ["userId"],
      where: { createdAt: { gte: since }, userId: { not: null } },
    }),
  ]);

  const userIds = result.map((r) => r.userId).filter(Boolean) as number[];
  const users = await prisma.user.findMany({
    where: { id: { in: userIds } },
    select: { id: true, phoneNumber: true, name: true },
  });
  const userMap = new Map(users.map((u) => [u.id, u]));

  return {
    data: {
      list: result.map((r) => ({
        userId: r.userId,
        phoneNumber: userMap.get(r.userId!)?.phoneNumber || "-",
        name: userMap.get(r.userId!)?.name || "-",
        calls: r._count,
        totalTokens: r._sum.totalTokens || 0,
        cost: r._sum.cost || 0,
        lastUsed: r._max.createdAt,
      })),
      total: total.length,
      page: p,
      pageSize: ps,
    },
    code: "0000",
    msg: "请求成功",
  };
}
