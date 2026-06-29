import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 查询用户id
  const user = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      starDialogDetail: {
        orderBy: {
          id: "desc",
        },
      },
    },
  });
  if (!user) return { status: -1, message: "用户不存在" };

  return { status: 0, message: "success", data: user.starDialogDetail };
}
