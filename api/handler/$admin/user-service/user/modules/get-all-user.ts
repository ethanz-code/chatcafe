import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  let result = await prisma.user.findMany({
    select: {
      id: true,
      phoneNumber: true,
      password: true,
      updatedAt: true,
      name: true,
      avatar: true,
      dialogueBalance: true,
      paintingBalance: true,
      inviteCode: true,
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
