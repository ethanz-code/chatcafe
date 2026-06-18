import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import type { IAuthPluginParams } from "./types";

const jwtSecret = Bun.env.JWT_SECRET;

import { AuthPlugin } from "./auth";
import { UserServicePlugin } from "./user-service";
import { RechargePlugin } from "./recharge";
import { ChatPlugin } from "./chat";
import { ImagePlugin } from "./image";

// 忽略身份验证的路径
const rootPrefix = Bun.env.ROOT_PREFIX || "/";
const ignoreAuthPath = [`${rootPrefix}admin/auth/login`];

export const $AdminPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .use(
      jwt({
        name: "adminJWT",
        secret: jwtSecret,
      }),
    )
    .onBeforeHandle(async ({ path, adminJWT, set, headers }: any) => {
      if (!ignoreAuthPath.includes(path)) {
        if (!headers["authorization"])
          return {
            data: null,
            error: "请传入自定义header -> authorization: Bearer { token }",
          };
        if (headers["authorization"]) {
          // 验证token
          const payload = await adminJWT.verify(
            headers["authorization"].split(" ")[1],
          );
          if (!payload) {
            set.status = 401;
            return { status: -1, error: "Unauthorized" };
          }
        }
      }
    })
    .use(AuthPlugin({ prefix: `${prefix}/auth` }))
    .use(UserServicePlugin({ prefix: `${prefix}/user-service` }))
    .use(RechargePlugin({ prefix: `${prefix}/recharge` }))
    .use(ChatPlugin({ prefix: `${prefix}/chat` }))
    .use(ImagePlugin({ prefix: `${prefix}/image` }));
