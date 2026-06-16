import { Elysia, t } from "elysia";

import get from "./modules/get";
import _process from "./modules/process";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const FeedbackPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia().get(`${prefix}`, get).post(`${prefix}/process`, _process, {
    body: t.Object({
      id: t.Number(),
    }),
  });
