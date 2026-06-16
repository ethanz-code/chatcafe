import { Elysia, t } from "elysia";
import get from "./modules/get";
import dData from "./modules/delete";
import set from "./modules/set";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const ActivationCodePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}`, get)
    .delete(`${prefix}`, dData, {
      body: t.Object({
        id: t.Number(),
      }),
    })
    .post(`${prefix}`, set, {
      body: t.Object({
        password: t.String(),
        dialogueCount: t.Number(),
        paintingCount: t.Number(),
      }),
    });
