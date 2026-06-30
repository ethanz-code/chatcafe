import { ltzf } from "@ethan-utils/pay-gateway";
import { processPaymentOrder } from "@/plugin/payment";

export default async function ({ body }: any) {
  if (!ltzf.notify.verifyPayParams(body)) {
    console.error("[PayNotify] 签名验证失败", body?.out_trade_no);
    return "FAIL";
  }

  const { code, out_trade_no, pay_no } = body;
  if (code !== "0") {
    console.log("[PayNotify] 非成功通知", out_trade_no, code);
    return "SUCCESS";
  }

  console.log("[PayNotify] 收到支付成功通知", out_trade_no, pay_no);
  await processPaymentOrder(out_trade_no, pay_no);

  return "SUCCESS";
}
