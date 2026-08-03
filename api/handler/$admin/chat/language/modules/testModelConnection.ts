import { createOpenAI } from "@ai-sdk/openai";
import { generateText } from "ai";
import { lookup as dnsLookup } from "node:dns/promises";
import { isIP } from "node:net";

const testPrompt = "Reply with OK.";
const timeoutMs = 15_000;

function isHttpsUrl(value: string) {
  try {
    const url = new URL(value);
    return url.protocol === "https:";
  } catch {
    return false;
  }
}

function isPrivateIp(address: string) {
  if (isIP(address) === 4) {
    const [first, second] = address.split(".").map(Number);
    return (
      first === 0 ||
      first === 10 ||
      first === 127 ||
      (first === 169 && second === 254) ||
      (first === 172 && second >= 16 && second <= 31) ||
      (first === 192 && second === 168)
    );
  }

  const normalized = address.toLowerCase();
  if (normalized.startsWith("::ffff:")) {
    return isPrivateIp(normalized.slice(7));
  }

  return (
    normalized === "::1" ||
    normalized.startsWith("fc") ||
    normalized.startsWith("fd") ||
    normalized.startsWith("fe80:")
  );
}

async function isPublicEndpoint(value: string, lookup: any) {
  try {
    const { hostname } = new URL(value);
    const addresses = await lookup(hostname, { all: true });
    return (
      addresses.length > 0 &&
      addresses.every((entry: any) => !isPrivateIp(entry.address))
    );
  } catch {
    return false;
  }
}

export default async function testModelConnection({
  body: { model, apiKey, baseUrl },
  fetch = globalThis.fetch,
  lookup = dnsLookup,
}: any) {
  if (!model || !apiKey || !baseUrl) {
    return {
      data: {
        connected: false,
        durationMs: 0,
        message: "模型型号、API Key 和 API 端点不能为空",
      },
      code: "0000",
    };
  }

  if (!isHttpsUrl(baseUrl)) {
    return {
      data: {
        connected: false,
        durationMs: 0,
        message: "API 端点必须使用 HTTPS 地址",
      },
      code: "0000",
    };
  }

  if (!(await isPublicEndpoint(baseUrl, lookup))) {
    return {
      data: {
        connected: false,
        durationMs: 0,
        message: "API 端点必须使用公网地址",
      },
      code: "0000",
    };
  }

  const startedAt = performance.now();

  try {
    const openai = createOpenAI({ apiKey, baseURL: baseUrl, fetch });
    const result = await generateText({
      model: openai.chat(model),
      prompt: testPrompt,
      maxOutputTokens: 8,
      abortSignal: AbortSignal.timeout(timeoutMs),
    });

    if (!result.text.trim()) {
      return {
        data: {
          connected: false,
          durationMs: Math.round(performance.now() - startedAt),
          message: "模型未返回有效内容",
        },
        code: "0000",
      };
    }

    return {
      data: {
        connected: true,
        durationMs: Math.round(performance.now() - startedAt),
      },
      code: "0000",
    };
  } catch (error: any) {
    const timedOut =
      error?.name === "TimeoutError" || error?.name === "AbortError";

    return {
      data: {
        connected: false,
        durationMs: Math.round(performance.now() - startedAt),
        message: timedOut ? "请求超时" : "模型服务返回错误",
      },
      code: "0000",
    };
  }
}
