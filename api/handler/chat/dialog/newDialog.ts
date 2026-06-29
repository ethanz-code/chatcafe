import prisma from "@/plugin/prismaClient";
import { v4 as uuidv4 } from "uuid";

export default async function ({
  body: { title, imgUrl = '' },
  jwt,
  set,
  headers,
}: any) {
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const uuid = uuidv4();

  const dialog = await prisma.user.update({
    where: {
      id: payload.id,
    },
    include: {
      allDialog: {
        select: {
          createdAt: true,
          updatedAt: true,
          title: true,
          uuid: true,
          imgUrl: true,
          delta: true,
        },
        orderBy: {
          updatedAt: "desc",
        },
      },
    },
    data: {
      allDialog: {
        create: [
          {
            title,
            uuid,
            imgUrl,
          },
        ],
      },
    },
  });

  return { status: 0, data: dialog.allDialog[0] };
}
