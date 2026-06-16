import prisma from "@/plugin/prismaClient";

export default async function ({
  body: { id, condition, description, rewardDialogue, rewardPainting },
}: any) {
  const joinStr = [];
  joinStr.push(rewardDialogue ? `对话余额+${rewardDialogue}` : "");
  joinStr.push(rewardPainting ? `绘画余额+${rewardPainting}` : "");
  await prisma.taskReward.update({
    where: { id },
    data: {
      condition,
      description: `【${description}】` + joinStr.join("，"),
      rewardDialogue,
      rewardPainting,
    },
  });

  return {
    data: null,
    code: "0000",
    msg: "请求成功",
  };
}
