import { Elysia, t } from "elysia";
import login from "./login";
import verify from "./verify";
import profile from "./profile";
import modifyName from "./modifyName";
import registerVerifyCode from "./registerVerifyCode";
import register from "./register";
import changePassword from "./changePassword";
import forgetPasswordVerifyCode from "./forgetPasswordVerifyCode";
import forgetPassword from "./forgetPassword";
import uploadAvatar from "./uploadAvatar";
import { UserServicePlugin } from "./service";
import "@/plugin/userInvite";

import firstSearchAssistant from "./firstSearchAssistant";
import firstSavePainting from "./firstSavePainting";

interface Config {
  prefix: string;
}

export const UserPlugin = (config: Config) =>
  new Elysia()
    .use(UserServicePlugin({ prefix: `${config.prefix}/service` }))
    .post(`${config.prefix}/login`, login, {
      body: t.Object({
        phoneNumber: t.String(),
        password: t.String(),
      }),
    })
    .get(`${config.prefix}/verify`, verify, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/profile`, profile, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/modifyName`, modifyName, {
      body: t.Object({
        name: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/registerVerifyCode`, registerVerifyCode, {
      body: t.Object({
        phoneNumber: t.String(),
      }),
    })
    .post(`${config.prefix}/register`, register, {
      body: t.Object({
        verifyCode: t.String(),
        password: t.String(),
        inviteCode: t.Optional(t.String()),
      }),
    })
    .post(`${config.prefix}/changePassword`, changePassword, {
      body: t.Object({
        originPassword: t.String(),
        newPassword: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(
      `${config.prefix}/forgetPasswordVerifyCode`,
      forgetPasswordVerifyCode,
      {
        body: t.Object({
          phoneNumber: t.String(),
        }),
      },
    )
    .post(`${config.prefix}/forgetPassword`, forgetPassword, {
      body: t.Object({
        verifyCode: t.String(),
        newPassword: t.String(),
      }),
    })
    .post(`${config.prefix}/uploadAvatar`, uploadAvatar, {
      body: t.Object({
        blob: t.File(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/firstSearchAssistant`, firstSearchAssistant, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/firstSavePainting`, firstSavePainting, {
      headers: t.Object({
        authorization: t.String(),
      }),
    });
