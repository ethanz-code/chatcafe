import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });

  if (getUserId === null) return { status: -1, error: "No user is queried" };

  // 获取用户所有生成的图片
  let getAllGenImg = await prisma.genImageList.findMany({
    where: {
      userId: getUserId.id,
    },
    select: {
      id: true,
      imgUrl: true,
      model: true,
      time: true,
      status: true,
      prompt: true,
    },
    orderBy: {
      time: "desc",
    },
  });
  getAllGenImg = getAllGenImg.map((item) => {
    const splitD = item.prompt.split("】")[1];
    return {
      ...item,
      prompt: splitD !== undefined ? splitD : item.prompt,
    };
  });

  return { status: 0, data: getAllGenImg };
}
