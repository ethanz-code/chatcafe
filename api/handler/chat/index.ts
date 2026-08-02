import { Elysia, t } from "elysia";
import completions from "./completions";
import { hotIssues } from "./hotIssues";
import { llmList } from "./llmList";
import { DialogPlugin } from "./dialog";

interface Config {
  prefix: string;
}

export const ChatPlugin = (config: Config) =>
  new Elysia()
    .use(DialogPlugin({ prefix: `${config.prefix}/dialog` }))
    .post(`${config.prefix}/completions`, completions, {
      body: t.Object({
        model: t.String(),
        loadDbData: t.String(),
        messages: t.Optional(t.String()),
        uuid: t.Optional(t.String()),
        isAssistant: t.Optional(t.String()),
        assistantId: t.Optional(t.String()),
      }),
      headers: t.Object({
        authorization: t.String(),
      }),
    })
    .get(`${config.prefix}/hotIssues`, hotIssues)
    .get(`${config.prefix}/llmList`, llmList);
