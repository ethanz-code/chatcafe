import prisma from "@/plugin/prismaClient";

export default async function () {
  // 获取版本号信息
  const version = await prisma.configuration.findUnique({
    where: {
      name: "version",
    },
    select: {
      name: true,
      value: true,
    },
  });

  return { status: 0, data: version };
}
