import { Elysia } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { ChatPlugin } from "./handler/chat";
import { FilePlugin } from "./handler/file";
import { CompressPlugin } from "./handler/compress";
import { UserPlugin } from "./handler/user";
import { AssistantPlugin } from "./handler/assistant";
import { AppCenterPlugin } from "./handler/app-center";
import { CommunityPlugin } from "./handler/community";
import { $AdminPlugin } from "./handler/$admin";

import { getConfig } from "./plugin/writeConfig";

const config = await getConfig();
const jwtSecret = config["jwt-secret"];

const rootPrefix = Bun.env.ROOT_PREFIX || "/";
const corsOrigin = Bun.env.CORS_ORIGIN || ".*";

new Elysia()
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
      exp: "3d",
    }),
  )
  .use(
    cors({
      origin: new RegExp(corsOrigin),
    }),
  )
  .use(ChatPlugin({ prefix: rootPrefix + "chat" }))
  .use(FilePlugin({ prefix: rootPrefix }))
  .use(CompressPlugin({ prefix: rootPrefix }))
  .use(UserPlugin({ prefix: rootPrefix + "user" }))
  .use(AssistantPlugin({ prefix: rootPrefix + "assistant" }))
  .use(AppCenterPlugin({ prefix: rootPrefix + "app-center" }))
  .use(CommunityPlugin({ prefix: rootPrefix + "community" }))
  .use($AdminPlugin({ prefix: rootPrefix + "admin" }))
  .onError(({ code, error }) => {
    if (code === "NOT_FOUND") return "Route not found :(";
    return new Response(error.toString());
  })
  .listen(9091);
