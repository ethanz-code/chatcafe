import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.genImageList.findMany({
    select: {
      id: true,
      imgUrl: true,
      model: true,
      time: true,
      status: true,
      prompt: true,
      user: true,
    },
  });
  result = result.map((item) => {
    return {
      ...item,
      username: item.user.name,
    };
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
