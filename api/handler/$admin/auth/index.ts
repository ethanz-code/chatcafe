import { Elysia, t } from "elysia";
import login from "./modules/login";
import getUserInfo from "./modules/getUserInfo";

import type { IAuthPluginParams } from "../types";

export const AuthPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .post(`${prefix}/login`, login, {
      body: t.Object({
        userName: t.String(),
        password: t.String(),
      }),
    })
    .get(`${prefix}/getUserInfo`, getUserInfo, {});
