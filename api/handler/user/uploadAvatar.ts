import prisma from "@/plugin/prismaClient";
import moment from "moment";
import { resolve } from "path";
import { unlink, writeFile as writeFilePromise } from "node:fs/promises";
import { setUserTaskValue } from "@/plugin/taskReward";

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;

export default async function ({ jwt, set, headers, body: { blob } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 校验上传内容：非空、大小限制、图片魔数（webp/png/jpeg）
  if (!blob || Buffer.byteLength(blob) === 0) {
    set.status = 400;
    return { status: -1, error: "Empty image" };
  }
  if (Buffer.byteLength(blob) > MAX_AVATAR_SIZE) {
    set.status = 400;
    return { status: -1, error: "Image is too large (max 5MB)" };
  }
  const head = Buffer.from(blob).subarray(0, 12);
  const isImage =
    head.toString("ascii", 0, 4).includes("RIFF") || // webp
    head.toString("ascii", 1, 4) === "PNG" ||
    (head[0] === 0xff && head[1] === 0xd8); // jpeg
  if (!isImage) {
    set.status = 400;
    return { status: -1, error: "Invalid image format" };
  }

  // 查找数据库中的头像是否在本地就保存，有的话先将保存的图片删除，最大节省磁盘空间
  const avatarUrl = await prisma.user.findUnique({
    where: {
      id: payload.id,
    },
    select: {
      avatar: true,
      id: true,
    },
  });
  const avatarSplit = avatarUrl?.avatar!.split("/") || [];
  // 检测是否真正需要被删除，如果是默认头像不再删除
  if (avatarSplit[avatarSplit.length - 1] !== "default.webp") {
    const path = resolve("./", ...avatarSplit);
    try { await unlink(path); } catch {}
  }

  // 将上传的文件保存到本地目录中
  // 六位随机数字
  const code = Math.floor(Math.random() * 900000) + 100000;
  // 生成图片文件名
  const filename = `${moment().unix()}_${code}.webp`;
  const fileUrl = resolve("./", "media", "avatar", filename);
  await writeFilePromise(fileUrl, blob);

  const relativePath = `/media/avatar/${filename}`;

  // 修改数据库中用户头像
  await prisma.user.update({
    where: {
      id: payload.id,
    },
    data: {
      avatar: relativePath,
    },
  });

  // 设置任务奖励值
  const task = await prisma.taskReward.findMany({
    where: {
      name: "first-upload-avatar",
    },
    select: {
      taskRewardReceived: {
        where: {
          userId: avatarUrl!.id,
        },
      },
    },
  });
  if (task.length > 0 && task[0].taskRewardReceived.length > 0)
    await setUserTaskValue(task[0].taskRewardReceived[0].id, 1);

  return { status: 0, avatarUrl: relativePath };
}
