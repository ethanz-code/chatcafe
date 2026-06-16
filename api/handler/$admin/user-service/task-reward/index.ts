import { Elysia, t } from "elysia";

import getAllTask from "./modules/get-all-task";
import postTask from "./modules/post-task";
import getAllTaskRewardReceive from "./modules/get-all-task-reward-receive";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const TaskRewardPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/get-all-task`, getAllTask)
    .post(`${prefix}/post-task`, postTask, {
      body: t.Object({
        id: t.Number(),
        condition: t.String(),
        description: t.String(),
        rewardDialogue: t.Number(),
        rewardPainting: t.Number(),
      }),
    })
    .get(`${prefix}/get-all-task-reward-receive`, getAllTaskRewardReceive);
