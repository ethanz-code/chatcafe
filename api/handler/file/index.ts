import { Elysia } from "elysia";
import { resolve } from "path";

interface Config {
  prefix: string;
}

// 使用别名名称作为根目录，资源层级映射
const rootAlias = "media";

export const FilePlugin = (config: Config) =>
  new Elysia()
    .get(`${config.prefix}${rootAlias}/llm/:name`, ({ params: { name } }) =>
      Bun.file(resolve(rootAlias, "llm", name)),
    )
    .get(`${config.prefix}${rootAlias}/avatar/:name`, ({ params: { name } }) =>
      Bun.file(resolve(rootAlias, "avatar", name)),
    )
    .get(
      `${config.prefix}${rootAlias}/assistant/:name`,
      ({ params: { name } }) => Bun.file(resolve(rootAlias, "assistant", name)),
    )
    .get(
      `${config.prefix}${rootAlias}/app-center/:name`,
      ({ params: { name } }) =>
        Bun.file(resolve(rootAlias, "app-center", name)),
    )
    .get(`${config.prefix}${rootAlias}/genImg/:name`, ({ params: { name } }) =>
      Bun.file(resolve(rootAlias, "genImg", name)),
    )
    .get(`${config.prefix}${rootAlias}/pay/:name`, ({ params: { name } }) =>
      Bun.file(resolve(rootAlias, "pay", name)),
    )
    .get(
      `${config.prefix}compress/:format/:name`,
      ({ params: { format, name } }) =>
        Bun.file(resolve("media", "compress", format, name)),
    );
