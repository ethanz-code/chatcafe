import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const query = await prisma.imageCommunity.findMany({
    select: {
      id: true,
      updatedAt: true,
      img: true,
      user: true,
      pageView: true,
      likes: true,
    },
  });
  const result = query.map((item: any) => {
    return {
      ...item,
      imgUrl: item.img.imgUrl,
      username: item.user.name,
      likes: item.likes.length,
    };
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
