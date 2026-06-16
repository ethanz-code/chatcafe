import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers, query: { id } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  id = Number(id);

  // 获取用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
  });
  if (!getUserId) return { status: -1, error: "未找到用户！" };

  // 获取点赞状态
  const getLikesStatus = await prisma.imageCommunity.findUnique({
    where: { id },
  });
  if (getLikesStatus?.likes.includes(getUserId.id))
    return { status: 0, data: true };
  else return { status: 0, data: false };
}
