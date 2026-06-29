import { ltzf } from "@ethan-utils/pay-gateway";

export function initLtzf() {
  ltzf.setLtzfApiConfig({
    baseURL: "https://api.ltzf.cn",
    key: process.env.LTZF_MCH_SECRET || "",
    mch_id: process.env.LTZF_MCH_ID || "",
    notifyUrl: process.env.LTZF_NOTIFY_URL || "",
    timeout: 10000,
    log: false,
  });
}
