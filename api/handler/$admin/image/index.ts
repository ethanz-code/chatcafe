import { Elysia, t } from "elysia";

import getAllCommunity from "./modules/getAllCommunity";
import getAllList from "./modules/getAllList";

import type { IAuthPluginParams } from "../types";

export const ImagePlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia()
    .get(`${prefix}/getAllCommunity`, getAllCommunity)
    .get(`${prefix}/getAllList`, getAllList);
