import { Elysia } from "elysia";
import type { IAuthPluginParams } from "../types";

import { ActivationCodePlugin } from "./activation-code";
import { DialogPlugin } from "./dialog";
import { FeedbackPlugin } from "./feedback";
import { PromotionPlugin } from "./promotion";
import { PunchInDailyPlugin } from "./punchInDaily";
import { TaskRewardPlugin } from "./task-reward";
import { UsagePlugin } from "./usage";
import { UserPlugin } from "./user";

export const UserServicePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .use(ActivationCodePlugin({ prefix: `${prefix}/activation-code` }))
    .use(DialogPlugin({ prefix: `${prefix}/dialog` }))
    .use(FeedbackPlugin({ prefix: `${prefix}/feedback` }))
    .use(PromotionPlugin({ prefix: `${prefix}/promotion` }))
    .use(PunchInDailyPlugin({ prefix: `${prefix}/punch-in-daily` }))
    .use(TaskRewardPlugin({ prefix: `${prefix}/task-reward` }))
    .use(UsagePlugin({ prefix: `${prefix}/usage` }))
    .use(UserPlugin({ prefix: `${prefix}/user` }));
