import prisma from "@/plugin/prismaClient";

const getHotIssuesMax = 5;

export const hotIssues = async (app: any) => {
  const issues = await prisma.languageHotIssues.findMany({
    select: {
      description: true,
    },
  });

  if (issues.length === 0) return [];

  const count = Math.min(getHotIssuesMax, issues.length);
  const indices = new Set<number>();
  while (indices.size < count) {
    indices.add(Math.floor(Math.random() * issues.length));
  }

  return [...indices].map((i) => issues[i].description);
};
