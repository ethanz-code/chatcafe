import prisma from "@/plugin/prismaClient";

export default async function ({
  jwt,
  set,
  headers,
  body: { userMsgTime, userMsg, assistantMsgTime, assistantMsg, dialogUUID },
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 查询用户id
  const user = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
  });
  if (!user) return { status: -1, message: "用户不存在" };
  const userId = user.id;

  // 先查询已收藏的消息，看是否当前这条已经收藏
  const starHistory = await prisma.starDialogDetail.findMany({
    where: {
      userId,
      dialogUUID,
      userMsgTime,
      assistantMsgTime,
    },
  });
  const runCommand = ["收藏", "取消收藏"];
  let runCmdIndex = 0;
  if (starHistory.length > 0) runCmdIndex = 1;

  let result;
  if (runCommand[runCmdIndex] === "收藏") {
    result = await prisma.starDialogDetail.create({
      data: {
        userId,
        dialogUUID,
        userMsgTime,
        userMsg,
        assistantMsgTime,
        assistantMsg,
      },
    });
  } else if (runCommand[runCmdIndex] === "取消收藏") {
    result = await prisma.starDialogDetail.delete({
      where: {
        id: starHistory[0].id,
        userId,
        dialogUUID,
        userMsgTime,
        userMsg,
        assistantMsgTime,
        assistantMsg,
      },
    });
  }

  return { status: runCmdIndex, message: "success", data: result };
}
