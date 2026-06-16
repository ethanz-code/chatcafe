import { Elysia, t } from "elysia";

import getAllOrders from "./modules/getAllOrders";

import type { IAuthPluginParams } from "@/handler/$admin/types";

export const OrderPlugin = ({ prefix }: IAuthPluginParams) =>
  new Elysia().get(`${prefix}/getAllOrders`, getAllOrders);
