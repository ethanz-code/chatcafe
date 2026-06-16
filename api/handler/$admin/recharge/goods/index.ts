import { Elysia, t } from "elysia";

import getAllGoods from "./modules/getAllGoods";
import postGoods from "./modules/postGoods";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const GoodsPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/getAllGoods`, getAllGoods)
    .post(`${prefix}/postGoods`, postGoods, {
      body: t.Object({
        id: t.Number(),
        title: t.String(),
        dialogueCount: t.Number(),
        paintingCount: t.Number(),
        imgUrl: t.String(),
        price: t.Number(),
      }),
    });
