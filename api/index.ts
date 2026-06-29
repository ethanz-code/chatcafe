import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { cron } from "@elysiajs/cron";
import { ChatPlugin } from "./handler/chat";
import { FilePlugin } from "./handler/file";
import { CompressPlugin } from "./handler/compress";
import { UserPlugin } from "./handler/user";
import { AssistantPlugin } from "./handler/assistant";
import { AppCenterPlugin } from "./handler/app-center";
import { CommunityPlugin } from "./handler/community";
import { $AdminPlugin } from "./handler/$admin";

import { cleanupOldData } from "./plugin/cleanup";
import { initLtzf } from "./plugin/ltzf";

const jwtSecret = process.env.JWT_SECRET;

initLtzf();

const rootPrefix = process.env.ROOT_PREFIX || "/";
const corsOrigin = process.env.CORS_ORIGIN;

const corsConfig = corsOrigin
  ? cors({ origin: new RegExp(corsOrigin) })
  : cors({ origin: false });

new Elysia({ adapter: node() })
  .use(
    jwt({
      name: "jwt",
      secret: jwtSecret,
      exp: "3d",
    }),
  )
  .use(corsConfig)
  .use(ChatPlugin({ prefix: rootPrefix + "chat" }))
  .use(FilePlugin({ prefix: rootPrefix }))
  .use(CompressPlugin({ prefix: rootPrefix }))
  .use(UserPlugin({ prefix: rootPrefix + "user" }))
  .use(AssistantPlugin({ prefix: rootPrefix + "assistant" }))
  .use(AppCenterPlugin({ prefix: rootPrefix + "app-center" }))
  .use(CommunityPlugin({ prefix: rootPrefix + "community" }))
  .use($AdminPlugin({ prefix: rootPrefix + "admin" }))
  .use(
    cron({
      name: "cleanup-old-data",
      pattern: "0 3 * * *",
      run() {
        cleanupOldData();
      },
    })
  )
  .onError(({ code, error }) => {
    if (code === "NOT_FOUND") return "Route not found :(";
    return new Response(error.toString());
  })
  .listen(9091);
