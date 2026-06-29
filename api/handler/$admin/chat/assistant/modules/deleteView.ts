import prisma from "@/plugin/prismaClient";
import { resolve } from "path";
import { unlink } from "node:fs/promises";

export default async function ({ body: { id } }: any) {
  let result = await prisma.assistant.delete({
    where: { id },
    select: { imgUrl: true },
  });
  const imgSplit = result.imgUrl.split("/");
  if (imgSplit[imgSplit.length - 1].length > 6) {
    const path = resolve("./", ...(imgSplit || []));
    try { await unlink(path); } catch {}
  }

  return {
    data: result,
    code: "0000",
    msg: "请求成功",
  };
}
