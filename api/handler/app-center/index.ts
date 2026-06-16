import { Elysia } from "elysia";
import allApplication from "./allApplication";
import { GenImgPlugin } from "./genimg";

interface Config {
  prefix: string;
}

export const AppCenterPlugin = (config: Config) =>
  new Elysia()
    .use(GenImgPlugin({ prefix: `${config.prefix}/genimg` }))
    .get(`${config.prefix}/allApplication`, allApplication);
