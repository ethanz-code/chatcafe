import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id } }: any) {
  // 更新浏览量不需要检测登录状态
  const getCurrentPageView = await prisma.imageCommunity.findUnique({
    where: {
      id,
    },
  });
  if (!getCurrentPageView)
    return { status: -1, error: "当前发布的图片未找到！" };
  const updatePageView = await prisma.imageCommunity.update({
    where: {
      id,
    },
    data: {
      pageView: getCurrentPageView.pageView + 1,
    },
  });

  return { status: 0, message: "SUCCESS" };
}
