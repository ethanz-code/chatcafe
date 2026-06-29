import { Elysia, t } from "elysia";

const disabledResponse = {
  status: -1,
  error: "AI 绘画功能暂未开放",
};

interface Config {
  prefix: string;
}

export const GenImgPlugin = (config: Config) =>
  new Elysia()
    .get(`${config.prefix}/getAllGenImg`, () => disabledResponse, {
      headers: t.Object({ authorization: t.String() }),
    })
    .delete(`${config.prefix}/deleteGenImg`, () => disabledResponse, {
      query: t.Object({ id: t.String() }),
      headers: t.Object({ authorization: t.String() }),
    })
    .post(`${config.prefix}/generate`, () => disabledResponse, {
      headers: t.Object({ authorization: t.String() }),
    })
    .post(`${config.prefix}/addGenImg`, () => disabledResponse, {
      headers: t.Object({ authorization: t.String() }),
    })
    .post(`${config.prefix}/modifyGenImg`, () => disabledResponse, {
      headers: t.Object({ authorization: t.String() }),
    })
    .post(`${config.prefix}/mjCheckStatus`, () => disabledResponse, {
      headers: t.Object({ authorization: t.String() }),
    });
