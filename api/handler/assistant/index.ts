import { Elysia, t } from "elysia";
import getAll from "./getAll";
import getOneById from "./getOneById";

interface Config {
  prefix: string;
}

// 使用别名名称作为根目录，资源层级映射
const rootAlias = "media";

export const AssistantPlugin = (config: Config) =>
  new Elysia()
    .get(`${config.prefix}/getAll`, getAll)
    .get(`${config.prefix}/get`, getOneById, {
      query: t.Object({
        id: t.String(),
      }),
    });
