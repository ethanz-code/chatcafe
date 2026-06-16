import prisma from "@/plugin/prismaClient";
import moment from "moment";
import { resolve } from "path";
import { readdir } from "fs/promises";
import axios from "axios";

interface singleUrl {
  url: string;
  imgId: number;
}
export const urlDatas: singleUrl[] = [];

interface CompressImageStruct {
  status: number;
  message?: string;
  data?: Buffer;
}
async function compressImage(filePath: string): Promise<CompressImageStruct> {
  const file = Bun.file(filePath);
  const formData = new FormData();
  formData.append("file", file);
  formData.append("quality", "[0.5, 0.8]");
  // http://61.183.42.177:9093/compress  https://imagemin.aidesign.org.cn/compress
  const response = await axios.request({
    url: "http://61.183.42.177:9093/compress",
    method: "post",
    data: formData,
  });
  if (response.status === 200) {
    // 压缩成功，请求返回压缩后的图片
    const gzUrl = response.data.data.compressed.url;
    const compressRes = await axios.request({
      url: gzUrl,
      responseType: "arraybuffer",
    });
    if (response.status !== 200)
      return {
        status: -1,
        message:
          "图片压缩成功，但是没有请求到压缩后的图片，压缩图片地址：" + gzUrl,
      };

    return {
      status: 0,
      message: "图片压缩成功",
      data: Buffer.from(compressRes.data, "binary"),
    };
  } else return { status: -1, message: "图片压缩失败" };
}

async function readDirectoryContents(directoryPath: string): Promise<string[]> {
  try {
    const files = await readdir(directoryPath);
    return files.filter((file) => file.endsWith(".jpg")).sort();
  } catch (error) {
    console.error("Error reading directory contents:", error);
  }

  return [];
}

// 处理未压缩的图片
async function processUncompressedImages() {
  // 查询指定目录中所有文件名称
  const allFilesName = await readDirectoryContents(
    resolve("./", "media", "genImg"),
  );
  // 循环遍历allFilesName
  const index = 0;
  while (index < allFilesName.length) {
    // 将文件修改结尾gz.png
    const f = allFilesName[index].split(".")[0] + "gz.png";
    const gzPath = resolve("./", "media", "genImg", f);
    const path = resolve("./", "media", "genImg", allFilesName[index]);
    const file = Bun.file(gzPath);
    // 检测是否存在压缩的图片
    if (await file.exists()) {
      allFilesName.shift();
      continue;
    }

    // 压缩图片
    const compressData = await compressImage(path);
    if (compressData.status === -1 || !compressData.data) {
      console.error(compressData.message);
      continue;
    }
    Bun.write(gzPath, compressData.data);

    allFilesName.shift();
  }
}
processUncompressedImages();

export const inspect = async function () {
  if (urlDatas.length !== 0) {
    // 遍历urlBuffer中的url数据
    let index = 0;
    while (index < urlDatas.length) {
      const d = urlDatas[index];
      // 查询数据库图片列表中指定url
      const getImg = await prisma.genImageList.findUnique({
        where: {
          id: d.imgId,
          imgUrl: d.url,
        },
      });
      // 如果获取到了图片相关数据则继续往下处理
      if (!getImg) {
        urlDatas.shift();
        continue;
      }

      // 将网络url请求到本地
      let response = new Response();
      try {
        response = await fetch(d.url, { keepalive: false });
      } catch (error: any) {
        console.error("Fetch failed to pull image data: ", error.message);
        continue;
      }

      // 六位随机数字
      const code = Math.floor(Math.random() * 900000) + 100000;
      // 生成图片文件名
      const filename = `${moment().unix()}_${code}.jpg`;
      const gzFileName = filename.split(".")[0] + "gz.png";
      const fileUrl = resolve("./", "media", "genImg", filename);
      const gzFileUrl = resolve("./", "media", "genImg", gzFileName);
      await Bun.write(fileUrl, response);

      const relativePath = `/media/genImg/${filename}`;

      // 压缩图片
      const compressData = await compressImage(fileUrl);
      if (compressData.status === -1 || !compressData.data) {
        console.error(compressData.message);
        continue;
      }
      Bun.write(gzFileUrl, compressData.data);

      // 更新数据库图片列表中指定url
      await prisma.genImageList.update({
        where: {
          id: d.imgId,
          imgUrl: d.url,
        },
        data: {
          imgUrl: relativePath,
        },
      });

      // 删除第一个数据
      urlDatas.shift();
    }
  }
};
