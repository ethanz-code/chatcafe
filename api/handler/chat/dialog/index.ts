import { Elysia, t } from "elysia";
import newDialog from "./newDialog";
import getAllDialog from "./getAllDialog";
import syncDialogImg from "./syncDialogImg";
import newMessage from "./newMessage";
import editDialog from "./editDialog";
import deleteDialog from "./deleteDialog";
import deleteMessage from "./deleteMessage";

interface Config {
  prefix: string;
}

export const DialogPlugin = (config: Config) =>
  new Elysia()
    .post(`${config.prefix}/newDialog`, newDialog, {
      body: t.Object({
        title: t.String(),
        imgUrl: t.Optional(t.String()),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/getAllDialog`, getAllDialog, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/syncDialogImg`, syncDialogImg, {
      body: t.Object({
        uuid: t.String(),
        imgUrl: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/newMessage`, newMessage, {
      body: t.Object({
        uuid: t.String(),
        role: t.String(),
        content: t.String(),
        imgUrl: t.Optional(t.String()),
        time: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/editDialog`, editDialog, {
      body: t.Object({
        uuid: t.String(),
        title: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/deleteDialog`, deleteDialog, {
      body: t.Object({
        uuid: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/deleteMessage`, deleteMessage, {
      body: t.Object({
        uuid: t.String(),
        time: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    });
