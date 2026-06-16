import { Elysia, t } from "elysia";
import get from "./modules/get";
import set from "./modules/set";

import type { IAuthPluginParams } from "../types";

export const ConfigPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia().get(`${prefix}`, get).post(`${prefix}`, set, {
    body: t.Object({
      id: t.Number(),
      name: t.String(),
      value: t.String(),
    }),
  });
