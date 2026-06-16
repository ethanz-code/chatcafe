import { Elysia, t } from "elysia";

import getAllUser from "./modules/get-all-user";
import postBalance from "./modules/post-balance";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const UserPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/get-all-user`, getAllUser)
    .post(`${prefix}/post-balance`, postBalance, {
      body: t.Object({
        id: t.Number(),
        dialogueBalance: t.Number(),
        paintingBalance: t.Number(),
      }),
    });
