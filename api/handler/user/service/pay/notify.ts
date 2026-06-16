import prisma from "@/plugin/prismaClient";
import { wxPaySign } from "./sign";
import { setUserTaskValue } from "@/plugin/taskReward";

function verificationSign(body: any) {
  const key = Bun.env.LTZF_MCH_SECRET || "";
  const { code, timestamp, mch_id, order_no, out_trade_no, pay_no, total_fee } =
    body;
  const params = {
    code,
    timestamp,
    mch_id,
    order_no,
    out_trade_no,
    pay_no,
    total_fee,
  };
  const sign = wxPaySign(params, key);
  // console.log(sign, body.sign);

  return sign === body.sign;
}

export default async function ({ body }: any) {
  // console.log(body);
  const { code, out_trade_no } = body;
  if (code === "0") {
    // 支付成功，查询订单状态
    const order = await prisma.order.findMany({
      where: {
        orderNo: out_trade_no,
        status: "未付款",
      },
    });
    // console.log(order, out_trade_no);
    // 如果订单不存在，不予处理
    if (order.length === 0) return "SUCCESS";
    // 如果签名不正确，不予处理
    if (!verificationSign(body)) return "SUCCESS";

    // 修改为已付款
    await prisma.order.update({
      where: {
        id: order[0].id,
      },
      data: {
        status: "已付款",
      },
    });

    // 根据商品ID为用户颁发奖励
    const goods = await prisma.goods.findUnique({
      where: {
        id: order[0].goodsId,
      },
      select: {
        dialogueCount: true,
        paintingCount: true,
        price: true,
      },
    });
    if (!goods) return "SUCCESS";
    // 获取用户数据
    const user = await prisma.user.findUnique({
      where: {
        id: order[0].userId,
      },
      select: {
        id: true,
        dialogueBalance: true,
        paintingBalance: true,
      },
    });
    if (!user) return "SUCCESS";
    // 修改用户对话以及绘画次数
    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        dialogueBalance: (user.dialogueBalance || 0) + goods.dialogueCount,
        paintingBalance: (user.paintingBalance || 0) + goods.paintingCount,
      },
    });

    // 设置任务奖励值
    const task = await prisma.taskReward.findMany({
      where: {
        name: "first-charge",
      },
      select: {
        taskRewardReceived: {
          where: {
            userId: user.id,
          },
        },
      },
    });
    if (task.length > 0 && task[0].taskRewardReceived.length > 0)
      await setUserTaskValue(task[0].taskRewardReceived[0].id, 1);

    const task2 = await prisma.taskReward.findMany({
      where: {
        name: "charge-up-to-50",
      },
      select: {
        taskRewardReceived: {
          where: {
            userId: user.id,
          },
        },
      },
    });
    if (task2.length > 0 && task2[0].taskRewardReceived.length > 0)
      await setUserTaskValue(task2[0].taskRewardReceived[0].id, goods.price);
  }

  return "SUCCESS";
}
