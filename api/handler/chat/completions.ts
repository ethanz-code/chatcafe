import Stream from "@elysiajs/stream";
import prisma from "@/plugin/prismaClient";
import { calcBalance } from "@/plugin/balance";
import { createOpenAI } from "@ai-sdk/openai";
import { streamText } from "ai";

const chatMaxTokens = Number(Bun.env.CHAT_MAX_TOKENS) || 8192;

async function logUsage(params: {
  userId: number | null;
  model: string;
  cost: number;
  promptTokens: number;
  completionTokens: number;
  ip: string | null;
}) {
  try {
    await prisma.usageLog.create({
      data: {
        userId: params.userId,
        model: params.model,
        cost: params.cost,
        promptTokens: params.promptTokens,
        completionTokens: params.completionTokens,
        totalTokens: params.promptTokens + params.completionTokens,
        ip: params.ip,
      },
    });
  } catch {
    // silently fail logging - don't affect user experience
  }
}

export default async ({
  body: { messages, model, loadDbData, uuid, isAssistant, assistantId },
  jwt,
  set,
  headers,
}: any) => {
  const modelResult = await prisma.languageModel.findUnique({
    where: { name: model },
    select: { cost: true, model: true, apiKey: true, baseUrl: true },
  });

  let payload: any = null;
  try {
    payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  } catch {
    // payload stays null
  }

  if (!payload && (modelResult?.cost || 0) > 0) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  if (modelResult && modelResult?.cost !== 0) {
    const result = await calcBalance(payload, -modelResult.cost, "dialogue");
    if (result.status === -1)
      return new Stream((stream) => {
        stream.send(JSON.stringify({ status: -1, error: "Insufficient balance" }));
        stream.close();
      });
  }

  let contents: any = [];
  loadDbData = JSON.parse(loadDbData);
  if (loadDbData) {
    const result = await prisma.user.findUnique({
      where: { id: payload.id },
      select: {
        allDialog: {
          select: {
            uuid: true,
            delta: {
              select: { role: true, content: true },
              orderBy: { time: "asc" },
            },
          },
        },
      },
    });
    contents = result?.allDialog.filter((item: any) => item.uuid === uuid)[0].delta;
  } else {
    contents = JSON.parse(messages);
    if (isAssistant && assistantId) {
      isAssistant = JSON.parse(isAssistant);
      assistantId = JSON.parse(assistantId);
    }
    if (isAssistant && assistantId) {
      const getAssistant = await prisma.assistant.findUnique({
        where: { id: assistantId },
        select: { content_zh_CN: true, content_en_US: true },
      });
      if (getAssistant?.content_zh_CN)
        contents.unshift({ role: "system", content: getAssistant.content_zh_CN });
      if (getAssistant?.content_en_US)
        contents.unshift({ role: "system", content: getAssistant.content_en_US });
    }
  }

  set.headers["keep-alive"] = "timeout=5, max=100";

  if (modelResult?.model === "")
    return new Stream((stream) => {
      stream.send(JSON.stringify({ status: -1, error: "No model found" }));
      stream.close();
    });

  const modelName = modelResult?.model || "deepseek-chat";
  const apiKey = modelResult?.apiKey || "";
  const baseURL = modelResult?.baseUrl || "https://api.deepseek.com";
  const modelCost = modelResult?.cost || 0;
  const userId = payload?.id || null;
  const clientIp = headers["x-forwarded-for"] || headers["x-real-ip"] || null;

  const openai = createOpenAI({ apiKey, baseURL });

  return new Stream(async (stream) => {
    try {
      const result = streamText({
        model: openai(modelName),
        messages: contents,
        maxOutputTokens: Number(chatMaxTokens),
      });

      const id = "chatcmpl-" + crypto.randomUUID();
      const created = Math.floor(Date.now() / 1000);
      let finished = false;

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
          finished = true;
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

      // log usage after stream completes
      if (finished) {
        const usage = await result.usage;
        logUsage({
          userId,
          model: modelName,
          cost: modelCost,
          promptTokens: usage?.promptTokens || 0,
          completionTokens: usage?.completionTokens || 0,
          ip: clientIp,
        });
      }

      stream.send("[DONE]");
      stream.close();
    } catch (error) {
      if (modelResult && modelCost !== 0)
        calcBalance(payload, modelCost, "dialogue");
      stream.close();
    }
  });
};
