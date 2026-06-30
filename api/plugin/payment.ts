import prisma from "@/plugin/prismaClient";
import { setUserTaskValue } from "@/plugin/taskReward";

export async function processPaymentOrder(outTradeNo: string, payNo?: string) {
  let userId = 0;
  let price = 0;

  await prisma.$transaction(async (tx) => {
    const result = await tx.order.updateMany({
      where: { orderNo: outTradeNo, status: "未付款" },
      data: { status: "已付款", transactionNo: payNo },
    });
    if (result.count === 0) return;

    const order = await tx.order.findUnique({
      where: { orderNo: outTradeNo },
    });
    if (!order) return;
    userId = order.userId;

    const goods = await tx.goods.findUnique({
      where: { id: order.goodsId },
      select: { dialogueCount: true, paintingCount: true, price: true },
    });
    if (!goods) return;
    price = goods.price;

    const user = await tx.user.findUnique({
      where: { id: order.userId },
      select: { id: true, dialogueBalance: true, paintingBalance: true },
    });
    if (!user) return;

    await tx.user.update({
      where: { id: user.id },
      data: {
        dialogueBalance: (user.dialogueBalance || 0) + goods.dialogueCount,
        paintingBalance: (user.paintingBalance || 0) + goods.paintingCount,
      },
    });
  });

  if (userId === 0) return;

  const task = await prisma.taskReward.findFirst({
    where: { name: "first-charge" },
    select: {
      taskRewardReceived: { where: { userId } },
    },
  });
  if (task?.taskRewardReceived.length)
    await setUserTaskValue(task.taskRewardReceived[0].id, 1);

  const task2 = await prisma.taskReward.findFirst({
    where: { name: "charge-up-to-50" },
    select: {
      taskRewardReceived: { where: { userId } },
    },
  });
  if (task2?.taskRewardReceived.length)
    await setUserTaskValue(task2.taskRewardReceived[0].id, price);
}
