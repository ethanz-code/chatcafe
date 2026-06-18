import prisma from "@/plugin/prismaClient";
import Stream from "@elysiajs/stream";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const chatMaxTokens = Number(Bun.env.CHAT_MAX_TOKENS) || 8192;

export default async function ({ body: { model, prompt, token } }: any) {
  const modelResult = model
    ? await prisma.languageModel.findUnique({
        where: { name: model },
        select: { model: true, apiKey: true, baseUrl: true },
      })
    : null;

  const modelName = modelResult?.model || model || "deepseek-chat";
  const apiKey = modelResult?.apiKey || "";
  const baseURL = modelResult?.baseUrl || "https://api.deepseek.com";

  const openai = createOpenAI({ apiKey, baseURL });

  return new Stream(async (stream) => {
    try {
      const result = streamText({
        model: openai(modelName),
        messages: [{ role: "user", content: prompt }],
        maxOutputTokens: Number(token || chatMaxTokens),
      });

      const id = "chatcmpl-" + crypto.randomUUID();
      const created = Math.floor(Date.now() / 1000);

      for await (const part of result.fullStream) {
        if (part.type === "text-delta") {
          stream.send(
            JSON.stringify({
              id,
              object: "chat.completion.chunk",
              created,
              model: modelName,
              choices: [{ index: 0, delta: { content: part.text }, finish_reason: null }],
            })
          );
        } else if (part.type === "finish") {
          stream.send(
            JSON.stringify({
              id,
              object: "chat.completion.chunk",
              created,
              model: modelName,
              choices: [{ index: 0, delta: {}, finish_reason: part.finishReason || "stop" }],
            })
          );
        }
      }
      stream.send("[DONE]");
      stream.close();
    } catch (error) {
      console.log(error);
      stream.close();
    }
  });
}
