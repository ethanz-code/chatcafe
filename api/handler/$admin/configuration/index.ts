import { Elysia, t } from "elysia";

import getAll from "./modules/get";
import postAll from "./modules/post";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const ConfigurationPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}`, getAll)
    .post(`${prefix}`, postAll, {
      body: t.Object({
        id: t.Number(),
        name: t.String(),
        value: t.String(),
      }),
    });
