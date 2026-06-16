import { PrismaClient } from "@prisma/client";

const datasourceUrl = Bun.env.DATABASE_URL;
const prisma = new PrismaClient({
  datasourceUrl,
});
if (Bun.argv[2] !== "--level") console.log("请使用 --level 参数");
const updateType = Bun.argv[3];
const updateMap: Record<string, number> = {
  release: 0,
  feat: 1,
  fix: 2,
};

if (Bun.argv[2] === "--level") {
  // 获取原有值
  const originVersion =
    (
      await prisma.configuration.findUnique({
        where: {
          name: "version",
        },
      })
    )?.value.split("v")[1] || "0.0.0";
  let splitOriginVersion: any[] = originVersion.split(".");
  splitOriginVersion = splitOriginVersion.map((item) => Number(item));

  splitOriginVersion[updateMap[updateType]] += 1;

  // 版本号更新，清空后位数
  let i = updateMap[updateType] + 1;
  while (i <= 2) {
    splitOriginVersion[i++] = 0;
  }

  const newVersion = "v" + splitOriginVersion.join(".");

  await prisma.configuration.update({
    where: {
      name: "version",
    },
    data: {
      value: newVersion,
    },
  });
}

prisma.$disconnect();
