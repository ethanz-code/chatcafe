import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { uuid, role, content, imgUrl, time },
  jwt,
  set,
  headers,
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });
  if (!user) return { status: -1, error: "The user cannot be found" };

  const result = await prisma.allDialog.update({
    where: {
      userId: user?.id,
      uuid: uuid,
    },
    data: {
      delta: {
        create: {
          role,
          content,
          imgUrl,
          time,
        },
      },
    },
    include: {
      delta: true,
    },
  });

  return { status: 0, data: result.delta[result.delta.length - 1] };
}
