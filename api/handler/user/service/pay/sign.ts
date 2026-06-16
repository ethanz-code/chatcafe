import { MD5 } from "crypto-js";

// 微信支付签名计算
export const wxPaySign = (params: any, key: string) => {
  const paramsArr = Object.keys(params);
  paramsArr.sort();

  const stringArr = [];
  paramsArr.map((key) => {
    stringArr.push(key + "=" + params[key]);
  });
  // 最后加上商户Key
  stringArr.push("key=" + key);

  const string = stringArr.join("&");
  return MD5(string).toString().toUpperCase();
};
