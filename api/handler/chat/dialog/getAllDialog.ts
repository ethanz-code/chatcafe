import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const dialogs = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    include: {
      allDialog: {
        orderBy: {
          updatedAt: "desc",
        },
        select: {
          createdAt: true,
          updatedAt: true,
          title: true,
          uuid: true,
          imgUrl: true,
          delta: {
            select: {
              role: true,
              content: true,
              imgUrl: true,
              time: true,
            },
            orderBy: {
              time: "asc",
            },
          },
        },
      },
    },
  });

  return { status: 0, data: dialogs?.allDialog };
}
