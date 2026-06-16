import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  // 查询所有助理分类，同时要包括分类里的所有助理
  const category = await prisma.assistantCategory.findMany({
    select: {
      id: true,
      name: true,
      assistants: {
        select: {
          id: true,
          name: true,
          imgUrl: true,
          description: true,
          categoryId: true,
        },
        orderBy: {
          id: "asc",
        },
      },
    },
    orderBy: {
      id: "asc",
    },
  });

  if (category.length === 0)
    return { status: -1, message: "The category list is empty" };
  const filterRes = category.filter((item: any) => item.assistants.length > 0);

  return { status: 0, message: "Success", data: filterRes };
}
