import prisma from "@/plugin/prismaClient";
import { ltzf } from "@ethan-utils/pay-gateway";
import { processPaymentOrder } from "@/plugin/payment";

export default async function ({ jwt, set, headers, params: { orderNo } }: any) {
  const payload = await jwt.verify(headers["authorization"]?.split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const order = await prisma.order.findFirst({
    where: { orderNo, userId: payload.id },
  });
  if (!order) return { status: -1, error: "Order not found" };

  if (order.status === "已付款") {
    return { status: 0, data: { paymentStatus: "paid" } };
  }

  try {
    const result = await ltzf.getPayOrder({ out_trade_no: orderNo });
    if (result.code === 0 && result.data?.pay_status === "1") {
      await processPaymentOrder(orderNo, result.data.pay_no);
      return { status: 0, data: { paymentStatus: "paid" } };
    }
  } catch {}

  return { status: 0, data: { paymentStatus: "unpaid" } };
}
