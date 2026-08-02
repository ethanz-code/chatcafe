import { Elysia } from "elysia";
import { node } from "@elysiajs/node";
import { jwt } from "@elysiajs/jwt";
import { cors } from "@elysiajs/cors";
import { cron } from "@elysiajs/cron";
import { ChatPlugin } from "./handler/chat";
import { FilePlugin } from "./handler/file";
import { UserPlugin } from "./handler/user";
import { AssistantPlugin } from "./handler/assistant";
import { AppCenterPlugin } from "./handler/app-center";
import { CommunityPlugin } from "./handler/community";
import { $AdminPlugin } from "./handler/$admin";
import getSiteConfig from "./handler/config/getSiteConfig";

import { cleanupOldData } from "./plugin/cleanup";
import { initLtzf } from "./plugin/ltzf";

const jwtSecret = process.env.JWT_SECRET;

if (!jwtSecret) {
  console.error(
    "[chatcafe-api] FATAL: JWT_SECRET is not set. Please configure it in .env.production before starting the service.",
  );
  process.exit(1);
}

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
  .use(UserPlugin({ prefix: rootPrefix + "user" }))
  .use(AssistantPlugin({ prefix: rootPrefix + "assistant" }))
  .use(AppCenterPlugin({ prefix: rootPrefix + "app-center" }))
  .use(CommunityPlugin({ prefix: rootPrefix + "community" }))
  .use($AdminPlugin({ prefix: rootPrefix + "admin" }))
  .get(rootPrefix + "config/site", getSiteConfig)
  .use(
    cron({
      name: "cleanup-old-data",
      pattern: "0 3 * * *",
      run() {
        cleanupOldData();
      },
    }),
  )
  .onError(({ code, error, set }) => {
    if (code === "NOT_FOUND") {
      set.status = 404;
      return { status: -1, error: "Not found" };
    }
    if (code === "VALIDATION") {
      set.status = 400;
      return { status: -1, error: "Invalid request parameters" };
    }
    console.error(`[chatcafe-api] unhandled error (${code}):`, error);
    set.status = 500;
    return { status: -1, error: "Internal server error" };
  })
  .listen(9091);
