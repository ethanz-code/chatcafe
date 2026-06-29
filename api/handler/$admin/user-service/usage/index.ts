import { Elysia } from "elysia";

import overview from "./modules/overview";
import byModel from "./modules/by-model";
import byUser from "./modules/by-user";
import trends from "./modules/trends";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const UsagePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/overview`, overview)
    .get(`${prefix}/by-model`, byModel)
    .get(`${prefix}/by-user`, byUser)
    .get(`${prefix}/trends`, trends);
