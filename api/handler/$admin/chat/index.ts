import { Elysia } from "elysia";

import { AssistantPlugin } from "./assistant";
import { LanguagePlugin } from "./language";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const ChatPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .use(AssistantPlugin({ prefix: `${prefix}/assistant` }))
    .use(LanguagePlugin({ prefix: `${prefix}/language` }));
