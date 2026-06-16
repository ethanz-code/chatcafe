import prisma from "@/plugin/prismaClient";
import moment from "moment";
import { resolve } from "path";
import { unlink } from "node:fs/promises";

export default async function ({
  body: { id, name, imgBlob, content_zh_CN, categoryId },
}: any) {
  const description = content_zh_CN;
  const content_zh_CN_s = `你要做的是解答这些问题（如果用户问的是话题外的问题你坚决不要回复）：${content_zh_CN}`;

  let relativePath;

  if (Number(id) !== -1) {
    const assistant = await prisma.assistant.findUnique({
      where: { id: Number(id) },
      select: { imgUrl: true },
    });

    if (imgBlob) {
      const path = resolve("./", ...(assistant?.imgUrl.split("/") || []));
      const file = Bun.file(path);
      if (await file.exists()) await unlink(path);

      // 将上传的文件保存到本地目录中
      // 六位随机数字
      const code = Math.floor(Math.random() * 900000) + 100000;
      // 生成图片文件名
      const filename = `${moment().unix()}_${code}.png`;
      const fileUrl = resolve("./", "media", "assistant", filename);
      await Bun.write(fileUrl, imgBlob);

      relativePath = `/media/assistant/${filename}`;
    }

    await prisma.assistant.update({
      where: { id: Number(id) },
      data: {
        name,
        content_zh_CN: content_zh_CN_s,
        description,
        imgUrl: imgBlob ? relativePath : assistant?.imgUrl,
        categoryId: Number(categoryId),
      },
    });
  } else {
    // 将上传的文件保存到本地目录中
    // 六位随机数字
    const code = Math.floor(Math.random() * 900000) + 100000;
    // 生成图片文件名
    const filename = `${moment().unix()}_${code}.png`;
    const fileUrl = resolve("./", "media", "assistant", filename);
    await Bun.write(fileUrl, imgBlob);

    relativePath = `/media/assistant/${filename}`;

    const result = await prisma.assistant.create({
      data: {
        name,
        content_zh_CN: content_zh_CN_s,
        content_en_US: "",
        description,
        imgUrl: imgBlob ? relativePath : "",
        categoryId: Number(categoryId),
      },
    });

    return {
      data: {
        id: result.id,
        relativePath,
      },
      code: "0000",
      msg: "请求成功",
    };
  }

  return {
    data: relativePath,
    code: "0000",
    msg: "请求成功",
  };
}
