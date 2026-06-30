import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { uuid, role, content, imgUrl = "", time },
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
      id: payload.id,
    },
    select: {
      id: true,
    },
  });
  if (!user) return { status: -1, error: "The user cannot be found" };

  const dialog = await prisma.allDialog.findFirst({
    where: { userId: user.id, uuid },
    select: { id: true },
  });

  if (!dialog) {
    const newDialog = await prisma.allDialog.create({
      data: {
        uuid,
        title: content.slice(0, 50) || "New Chat",
        imgUrl: imgUrl || "",
        userId: user.id,
        delta: { create: { role, content, imgUrl, time } },
      },
      include: { delta: true },
    });
    return { status: 0, data: newDialog.delta[newDialog.delta.length - 1] };
  }

  const result = await prisma.allDialog.update({
    where: { id: dialog.id },
    data: {
      delta: { create: { role, content, imgUrl, time } },
    },
    include: { delta: true },
  });

  return { status: 0, data: result.delta[result.delta.length - 1] };
}
