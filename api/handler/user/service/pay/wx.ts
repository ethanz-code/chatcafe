import prisma from "@/plugin/prismaClient";
import { ltzf } from "@ethan-utils/pay-gateway";
import moment from "moment";

export default async function ({ jwt, set, headers, body: { goodId } }: any) {
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const goods = await prisma.goods.findUnique({
    where: { id: goodId },
    select: { id: true, price: true, title: true },
  });
  if (!goods) return { status: -1, error: "Goods is not found" };

  const user = await prisma.user.findUnique({
    where: { id: payload.id },
    select: { id: true },
  });
  if (!user) return { status: -1, error: "User is not found" };

  const stamp = moment().unix();
  const outTradeNo = `LTZF${stamp}${Math.floor(Math.random() * 900000) + 100000}`;

  await prisma.order.create({
    data: {
      orderNo: outTradeNo,
      goodsId: goods.id,
      userId: user.id,
    },
  });

  const result = await ltzf.h5JumpPay({
    out_trade_no: outTradeNo,
    total_fee: String(goods.price),
    body: `ChatCafe-${goods.title}`,
    quit_url: process.env.LTZF_QUIT_URL,
    return_url: process.env.LTZF_RETURN_URL,
    notify_url: process.env.LTZF_NOTIFY_URL || "",
    timestamp: String(stamp),
    time_expire: "10m",
  });

  if (result.code === 0) {
    return { status: 0, data: { data: result.data }, orderNo: outTradeNo };
  }

  return { status: -1, data: result };
}
