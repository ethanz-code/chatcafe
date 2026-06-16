import { Elysia, t } from "elysia";

import getAllModel from "./modules/getAllModel";
import postModel from "./modules/postModel";
import getAllHotIssues from "./modules/getAllHotIssues";
import createHotIssue from "./modules/createHotIssue";
import deleteHotIssue from "./modules/deleteHotIssue";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const LanguagePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/getAllModel`, getAllModel)
    .post(`${prefix}/postModel`, postModel, {
      body: t.Object({
        id: t.Number(),
        name: t.String(),
        cost: t.Number(),
        relatedUrl: t.Optional(t.String()),
      }),
    })
    .get(`${prefix}/getAllHotIssues`, getAllHotIssues)
    .post(`${prefix}/createHotIssue`, createHotIssue, {
      body: t.Object({
        description: t.String(),
      }),
    })
    .delete(`${prefix}/deleteHotIssue`, deleteHotIssue, {
      body: t.Object({
        id: t.Number(),
      }),
    });
