import { Elysia, t } from "elysia";
import feedback from "./feedback";
import notify from "./pay/notify";
import wx from "./pay/wx";
import getAllGoods from "./pay/getAllGoods";

import generate from "./activationCode/generate";
import verify from "./activationCode/verify";

import getAllInviteeUser from "./promotion/getAllInviteeUser";

import getVersion from "./about/getVersion";

import starMsg from "./star/starMsg";
import getAllStar from "./star/getAllStar";

import punchDaily from "./task/punchDaily";
import getPunchDaily from "./task/getPunchDaily";
import getAllTaskReward from "./task/getAllTaskReward";
import receiveAReward from "./task/receiveAReward";

interface Config {
  prefix: string;
}

export const UserServicePlugin = (config: Config) =>
  new Elysia()
    .post(`${config.prefix}/feedback`, feedback, {
      body: t.Object({
        type: t.String(),
        content: t.String(),
        contact: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/pay/notify`, notify, {
      body: t.Object({
        code: t.String(),
        timestamp: t.String(),
        mch_id: t.String(),
        order_no: t.String(),
        out_trade_no: t.String(),
        pay_no: t.String(),
        total_fee: t.String(),
        sign: t.String(),
        pay_channel: t.Optional(t.String()),
        trade_type: t.Optional(t.String()),
        success_time: t.Optional(t.String()),
        attach: t.Optional(t.String()),
        openid: t.Optional(t.String()),
      }),
    })
    .post(`${config.prefix}/pay/wx`, wx, {
      body: t.Object({
        goodId: t.Integer(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/pay/getAllGoods`, getAllGoods, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/activationCode/generate`, generate, {
      body: t.Object({
        password: t.String(),
        dialogueCount: t.Optional(t.Integer()),
        paintingCount: t.Optional(t.Integer()),
      }),
    })
    .get(`${config.prefix}/activationCode/verify`, verify, {
      headers: t.Object({
        authorization: t.String(),
      }),
      query: t.Object({
        code: t.String(),
      }),
    })
    .get(`${config.prefix}/promotion/getAllInviteeUser`, getAllInviteeUser, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/about/getVersion`, getVersion)
    .post(`${config.prefix}/star/starMsg`, starMsg, {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        userMsgTime: t.String(),
        userMsg: t.String(),
        assistantMsgTime: t.String(),
        assistantMsg: t.String(),
        dialogUUID: t.String(),
      }),
    })
    .get(`${config.prefix}/star/getAllStar`, getAllStar, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/task/punchDaily`, punchDaily, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/task/getPunchDaily`, getPunchDaily, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/task/getAllTaskReward`, getAllTaskReward, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/task/receiveAReward`, receiveAReward, {
      headers: t.Object({
        authorization: t.String(),
      }),
      body: t.Object({
        taskName: t.String(),
      }),
    });
