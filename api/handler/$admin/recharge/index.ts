import { Elysia, t } from "elysia";

import { GoodsPlugin } from "./goods";
import { OrderPlugin } from "./order";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const RechargePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .use(GoodsPlugin({ prefix: `${prefix}/goods` }))
    .use(OrderPlugin({ prefix: `${prefix}/order` }));
