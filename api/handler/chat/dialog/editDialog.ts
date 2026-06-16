import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { uuid, title },
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

  const result = await prisma.user.update({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      allDialog: {
        select: {
          updatedAt: true,
          title: true,
          uuid: true,
          imgUrl: true,
        },
      },
    },
    data: {
      allDialog: {
        update: {
          where: {
            uuid,
          },
          data: {
            title,
          },
        },
      },
    },
  });

  return { status: 0, data: result.allDialog[0] };
}
