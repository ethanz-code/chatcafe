import prisma from "@/plugin/prismaClient";
import { wxPaySign } from "./sign";
import moment from "moment";
import axios from "axios";

interface ReturnGoodsType {
  id: number;
  price: number;
  title: string;
}
async function requestFormData(goods: ReturnGoodsType, userId: number) {
  const stamp = moment().unix();
  const mch_key = Bun.env.LTZF_MCH_SECRET || "";

  const mch_id = Bun.env.LTZF_MCH_ID;
  const out_trade_no = `LTZF${stamp}${Math.floor(Math.random() * 900000) + 100000}`;
  const total_fee = goods.price;
  const body = `爱设计AIGC平台-${goods.title}`;
  const timestamp = stamp;
  const notify_url = Bun.env.LTZF_NOTIFY_URL;
  const quit_url = Bun.env.LTZF_QUIT_URL;
  const return_url = Bun.env.LTZF_RETURN_URL;
  const time_expire = "10m";

  const params = {
    mch_id,
    out_trade_no,
    total_fee,
    body,
    timestamp,
    notify_url,
  };

  const sign = wxPaySign(params, mch_key);

  // 新增订单
  await prisma.order.create({
    data: {
      orderNo: out_trade_no,
      goodsId: goods.id,
      userId: userId,
    },
  });

  const formData = new FormData();
  formData.append("mch_id", mch_id);
  formData.append("out_trade_no", out_trade_no);
  formData.append("total_fee", total_fee);
  formData.append("body", body);
  formData.append("timestamp", timestamp);
  formData.append("notify_url", notify_url);
  formData.append("quit_url", quit_url);
  formData.append("return_url", return_url);
  formData.append("time_expire", time_expire);
  formData.append("sign", sign);

  return formData;
}

export default async function ({ jwt, set, headers, body: { goodId } }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取商品价格，名称，
  const goods = await prisma.goods.findUnique({
    where: {
      id: goodId,
    },
    select: {
      id: true,
      price: true,
      title: true,
    },
  });

  // 商品不存在时直接退出
  if (!goods) return { status: -1, error: "Goods is not found" };

  // 查询用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });
  if (!getUserId) return { status: -1, error: "User is not found" };

  const formData = await requestFormData(goods, getUserId.id);

  // https://api.ltzf.cn/api/wxpay/jump_h5
  const response = await axios.request({
    url: "https://api.ltzf.cn/api/wxpay/jump_h5",
    method: "POST",
    data: formData,
  });
  if (response.status === 200) {
    const parsedData = response.data;
    if (parsedData.code === 0) {
      return { status: 0, data: parsedData };
    }

    return { status: -1, data: parsedData };
  } else return { status: -1, message: "fail" };
}
