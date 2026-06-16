import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.promotion.findMany({
    select: {
      id: true,
      createdAt: true,
      inviteeUserId: true,
      inviteUserId: true,
    },
    orderBy: {
      id: "asc",
    },
  });

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
