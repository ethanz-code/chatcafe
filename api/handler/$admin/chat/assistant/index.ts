import { Elysia, t } from "elysia";

import getAllCategory from "./modules/getAllCategory";
import postCategory from "./modules/postCategory";
import getAllViews from "./modules/getAllViews";
import postView from "./modules/postView";
import deleteView from "./modules/deleteView";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const AssistantPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/getAllCategory`, getAllCategory)
    .post(`${prefix}/postCategory`, postCategory, {
      body: t.Object({
        id: t.Number(),
        name: t.String(),
      }),
    })
    .get(`${prefix}/getAllViews`, getAllViews)
    .post(`${prefix}/postView`, postView, {
      body: t.Object({
        id: t.String(),
        name: t.String(),
        imgBlob: t.Optional(t.File()),
        content_zh_CN: t.String(),
        categoryId: t.String(),
      }),
    })
    .delete(`${prefix}/deleteView`, deleteView, {
      body: t.Object({
        id: t.Number(),
      }),
    });
