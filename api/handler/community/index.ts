import { Elysia, t } from "elysia";
import publishImg from "./publishImg";
import getAllPublishedImg from "./getAllPublishedImg";
import addPageView from "./addPageView";
import addLikes from "./addLikes";
import verifyLikesStatus from "./verifyLikesStatus";

interface Config {
  prefix: string;
}

export const CommunityPlugin = (config: Config) =>
  new Elysia()
    .post(`${config.prefix}/publishImg`, publishImg, {
      body: t.Object({
        imgId: t.Integer(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/getAllPublishedImg`, getAllPublishedImg)
    .post(`${config.prefix}/addPageView`, addPageView, {
      body: t.Object({
        id: t.Integer(),
      }),
    })
    .post(`${config.prefix}/addLikes`, addLikes, {
      body: t.Object({
        id: t.Integer(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/verifyLikesStatus`, verifyLikesStatus, {
      query: t.Object({
        id: t.String(),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    });
