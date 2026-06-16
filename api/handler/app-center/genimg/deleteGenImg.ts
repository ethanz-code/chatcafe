import prisma from "@/plugin/prismaClient";
import { resolve } from "path";
import { unlink } from "node:fs/promises";

export default async function ({ jwt, set, headers, query: { id } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取用户id，用户只能删除自己生成的图片
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });

  if (!getUserId) return { status: -1, error: "No user is queried" };

  // 先获取到图片相对url
  const getGenImg = await prisma.genImageList.findUnique({
    where: {
      id: Number.parseInt(id),
      userId: getUserId.id,
    },
    select: {
      imgUrl: true,
      imageCommunity: true,
    },
  });
  // 将相对图片url拆分
  const imgSplit = getGenImg?.imgUrl.split("/") || [];
  const gzImgSplit = imgSplit.slice(0, -1);
  gzImgSplit.push(imgSplit[imgSplit.length - 1].split(".")[0] + "gz.png");
  // 合成路径
  const path = resolve("./", ...imgSplit);
  const gzPath = resolve("./", ...gzImgSplit);
  // 检测文件是否存在，存在再去删除，以防止报错
  const file = Bun.file(path);
  if (await file.exists()) await unlink(path);
  if (await Bun.file(gzPath).exists()) await unlink(gzPath);

  // 删除图片之前先检测是否已将该图片公布，先删除公布的图片，外键关系
  if (getGenImg?.imageCommunity) {
    await prisma.imageCommunity.deleteMany({
      where: {
        imgId: Number.parseInt(id),
      },
    });
  }

  // 删除图片
  const deleteGenImg = await prisma.genImageList.delete({
    where: {
      id: Number.parseInt(id),
      userId: getUserId.id,
    },
  });

  return { status: 0, data: deleteGenImg };
}
