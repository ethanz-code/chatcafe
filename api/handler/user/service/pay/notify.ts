import { ltzf } from "@ethan-utils/pay-gateway";
import { processPaymentOrder } from "@/plugin/payment";

export default async function ({ body }: any) {
  if (!ltzf.notify.verifyPayParams(body)) return "SUCCESS";

  const { code, out_trade_no, pay_no } = body;
  if (code !== "0") return "SUCCESS";

  await processPaymentOrder(out_trade_no, pay_no);

  return "SUCCESS";
}
