import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 判断用户Id是否存在
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      promotion: true,
    },
  });
  if (!user) return { status: -1, error: "User not found" };

  // 获取所有被邀请人信息
  const inviteeUserInfo = [];
  for (const invitee of user.promotion) {
    const inviteeUser = await prisma.user.findUnique({
      where: {
        id: invitee.inviteeUserId,
      },
      select: {
        phoneNumber: true,
        name: true,
        id: true,
        createdAt: true,
        avatar: true,
      },
    });
    if (inviteeUser) inviteeUserInfo.push(inviteeUser);
  }
  return { status: 0, data: inviteeUserInfo };
}
