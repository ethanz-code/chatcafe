import { Elysia, t } from "elysia";

interface Config {
  prefix: string;
}

const disabledResponse = { status: -1, error: "AI 绘画功能暂未开放，敬请期待" };

export const GenImgPlugin = (config: Config) =>
  new Elysia()
    .get(`${config.prefix}/getAllGenImg`, () => disabledResponse, {
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .delete(`${config.prefix}/deleteGenImg`, () => disabledResponse, {
      query: t.Object({
        id: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/addGenImg`, () => disabledResponse, {
      body: t.Object({
        model: t.String(),
        status: t.String(),
        prompt: t.String(),
        base64: t.Optional(t.String()),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/modifyGenImg`, () => disabledResponse, {
      body: t.Object({
        imgId: t.String(),
        status: t.Optional(t.String()),
        imgUrl: t.Optional(t.String()),
      }),
    })
    .post(`${config.prefix}/generate`, () => disabledResponse, {
      body: t.Object({
        imgId: t.String(),
        size: t.Optional(t.String()),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .post(`${config.prefix}/mjCheckStatus`, () => disabledResponse, {
      body: t.Object({
        taskId: t.String(),
        imgId: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    });
