import { Elysia, t } from "elysia";

import get from "./modules/get";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const PromotionPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia().get(`${prefix}`, get);
