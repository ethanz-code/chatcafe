import prisma from "@/plugin/prismaClient";

export default async function ({ body: { id, role, content } }: any) {
  await prisma.dialogDetail.update({
    where: {
      id,
    },
    data: {
      role,
      content,
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
