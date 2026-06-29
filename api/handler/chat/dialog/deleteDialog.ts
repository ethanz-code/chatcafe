import prisma from "@/plugin/prismaClient";

export default async function ({ body: { uuid }, jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 级联删除，两个数据表存在必须关系
  // 通过事务中的两个单独查询删除对话中的所有信息以及对话
  const getDialogId = await prisma.user.findUnique({
    where: {
      id: payload.id,
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
  const deleteMessages = prisma.dialogDetail.deleteMany({
    where: {
      dialogId: getDialogId?.allDialog[0].id,
    },
  });
  const deleteDialog = prisma.allDialog.delete({
    where: {
      id: getDialogId?.allDialog[0].id,
    },
    select: {
      updatedAt: true,
      title: true,
      uuid: true,
      imgUrl: true,
    },
  });

  const transaction = await prisma.$transaction([deleteMessages, deleteDialog]);

  return { status: 0, data: transaction };
}
