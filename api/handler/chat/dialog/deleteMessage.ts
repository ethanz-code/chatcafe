import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { uuid, time },
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

  const getDialogId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      // id: true,
      allDialog: {
        select: {
          id: true,
        },
        where: {
          uuid: uuid,
        },
      },
    },
  });
  if (getDialogId?.allDialog.length === 0)
    return {
      status: -1,
      error: `The current account does not have a dialog whose uuid is ${uuid}`,
    };
  const getMsgId = await prisma.dialogDetail.findFirst({
    where: {
      dialogId: getDialogId?.allDialog[0].id,
      time,
    },
  });
  if (getMsgId === null)
    return { status: -1, error: "The message does not exist" };
  const deleteMsg = await prisma.dialogDetail.delete({
    where: {
      id: getMsgId?.id,
      dialogId: getDialogId?.allDialog[0].id,
      time,
    },
    select: {
      updatedAt: true,
      role: true,
      content: true,
      imgUrl: true,
      time: true,
    },
  });

  return { status: 0, data: deleteMsg };
}
