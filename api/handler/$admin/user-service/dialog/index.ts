import { Elysia, t } from "elysia";
import getDialog from "./modules/getDialog";
import deleteDialog from "./modules/deleteDialog";
import getDetail from "./modules/getDetail";
import deleteDetail from "./modules/deleteDetail";
import postDetail from "./modules/postDetail";
import getStarDialogDetail from "./modules/getStarDialogDetail";
import deleteStarDialogDetail from "./modules/deleteStarDialogDetail";
import postStarDialogDetail from "./modules/postStarDialogDetail";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const DialogPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/allDialog`, getDialog)
    .delete(`${prefix}/deleteDialog`, deleteDialog, {
      body: t.Object({
        id: t.Number(),
      }),
    })
    .get(`${prefix}/allDetail`, getDetail)
    .delete(`${prefix}/deleteDetail`, deleteDetail, {
      body: t.Object({
        id: t.Number(),
      }),
    })
    .post(`${prefix}/postDetail`, postDetail, {
      body: t.Object({
        id: t.Number(),
        role: t.String(),
        content: t.String(),
      }),
    })
    .get(`${prefix}/allStarDialogDetail`, getStarDialogDetail)
    .delete(`${prefix}/deleteStarDialogDetail`, deleteStarDialogDetail, {
      body: t.Object({
        id: t.Number(),
      }),
    })
    .post(`${prefix}/postStarDialogDetail`, postStarDialogDetail, {
      body: t.Object({
        id: t.Number(),
        userMsg: t.String(),
        assistantMsg: t.String(),
      }),
    });
