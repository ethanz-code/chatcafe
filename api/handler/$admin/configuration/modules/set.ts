import prisma from "@/plugin/prismaClient";
import { writeConfig } from "@/plugin/writeConfig";

export default async function ({ body: { id, name, value } }: any) {
  await prisma.configuration.update({
    where: {
      id,
    },
    data: {
      name,
      value,
    },
  });
  writeConfig(name, value);

  return { data: null, code: "0000", msg: "请求成功" };
}
