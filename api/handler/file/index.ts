import { Elysia } from "elysia";
import { basename, resolve } from "path";
import { serveFile } from "@/utils/serveFile";

interface Config {
  prefix: string;
}

// 使用别名名称作为根目录，资源层级映射
const rootAlias = "media";

export const FilePlugin = (config: Config) =>
  new Elysia()
    .get(`${config.prefix}${rootAlias}/llm/:name`, ({ params: { name } }) =>
      serveFile(resolve(rootAlias, "llm", basename(name))),
    )
    .get(`${config.prefix}${rootAlias}/avatar/:name`, ({ params: { name } }) =>
      serveFile(resolve(rootAlias, "avatar", basename(name))),
    )
    .get(
      `${config.prefix}${rootAlias}/assistant/:name`,
      ({ params: { name } }) =>
        serveFile(resolve(rootAlias, "assistant", basename(name))),
    )
    .get(
      `${config.prefix}${rootAlias}/app-center/:name`,
      ({ params: { name } }) =>
        serveFile(resolve(rootAlias, "app-center", basename(name))),
    )
    .get(`${config.prefix}${rootAlias}/genImg/:name`, ({ params: { name } }) =>
      serveFile(resolve(rootAlias, "genImg", basename(name))),
    )
    .get(`${config.prefix}${rootAlias}/pay/:name`, ({ params: { name } }) =>
      serveFile(resolve(rootAlias, "pay", basename(name))),
    );
