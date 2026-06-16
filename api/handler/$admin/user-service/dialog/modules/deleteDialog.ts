import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id } }: any) {
  // 先删除对话框内部所有数据
  await prisma.dialogDetail.deleteMany({ where: { dialogId: id } });

  // 最后删除对话框
  await prisma.allDialog.delete({ where: { id } });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
