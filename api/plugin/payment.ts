import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export async function processPaymentOrder(outTradeNo: string, payNo?: string) {
  const order = await prisma.order.findFirst({
    where: { orderNo: outTradeNo, status: "未付款" },
  });
  if (!order) return;

  await prisma.order.update({
    where: { id: order.id },
    data: { status: "已付款", transactionNo: payNo },
  });

  const goods = await prisma.goods.findUnique({
    where: { id: order.goodsId },
    select: { dialogueCount: true, paintingCount: true, price: true },
  });
  if (!goods) return;

  const user = await prisma.user.findUnique({
    where: { id: order.userId },
    select: { id: true, dialogueBalance: true, paintingBalance: true },
  });
  if (!user) return;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      dialogueBalance: (user.dialogueBalance || 0) + goods.dialogueCount,
      paintingBalance: (user.paintingBalance || 0) + goods.paintingCount,
    },
  });

  const task = await prisma.taskReward.findFirst({
    where: { name: "first-charge" },
    select: {
      taskRewardReceived: { where: { userId: user.id } },
    },
  });
  if (task?.taskRewardReceived.length)
    await setUserTaskValue(task.taskRewardReceived[0].id, 1);

  const task2 = await prisma.taskReward.findFirst({
    where: { name: "charge-up-to-50" },
    select: {
      taskRewardReceived: { where: { userId: user.id } },
    },
  });
  if (task2?.taskRewardReceived.length)
    await setUserTaskValue(task2.taskRewardReceived[0].id, goods.price);
}
