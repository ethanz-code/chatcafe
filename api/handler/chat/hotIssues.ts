import prisma from "@/plugin/prismaClient";

const getHotIssuesMax = 5;

export const hotIssues = async (app: any) => {
  const issues = await prisma.languageHotIssues.findMany({
    select: {
      description: true,
    },
  });

  const result = [];
  const index: number[] = [];
  // 写一个for循环随机获取索引
  for (let i = 0; i < getHotIssuesMax; i++) {
    let randomIndex = Math.floor(Math.random() * issues.length);
    if (!index.includes(randomIndex)) {
      index.push(randomIndex);
      result.push(issues[randomIndex]);
    }
  }

  return result.map((issue) => issue.description);
};
