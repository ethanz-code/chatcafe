import { Elysia } from "elysia";

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
      headers: (t: any) => ({ authorization: t.String() }),
    })
    .delete(`${config.prefix}/deleteGenImg`, () => disabledResponse, {
      query: (t: any) => ({ id: t.String() }),
      headers: (t: any) => ({ authorization: t.String() }),
    })
    .post(`${config.prefix}/generate`, () => disabledResponse, {
      headers: (t: any) => ({ authorization: t.String() }),
    })
    .post(`${config.prefix}/addGenImg`, () => disabledResponse, {
      headers: (t: any) => ({ authorization: t.String() }),
    })
    .post(`${config.prefix}/modifyGenImg`, () => disabledResponse, {
      headers: (t: any) => ({ authorization: t.String() }),
    })
    .post(`${config.prefix}/mjCheckStatus`, () => disabledResponse, {
      headers: (t: any) => ({ authorization: t.String() }),
    });
