import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.assistant.findMany({
    select: {
      id: true,
      updatedAt: true,
      name: true,
      imgUrl: true,
      content_zh_CN: true,
      categoryId: true,
    },
    orderBy: {
      updatedAt: "desc", // 按更新时间倒序排序
    },
  });
  result = result.map((item) => {
    return {
      ...item,
      content_zh_CN: item.content_zh_CN.split("：")[1],
    };
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
