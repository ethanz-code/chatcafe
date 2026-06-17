import { getConfig } from "@/plugin/writeConfig";
import Stream from "@elysiajs/stream";
import prisma from "@/plugin/prismaClient";
import axios from "axios";
import { calcBalance } from "@/plugin/balance";

const config = await getConfig();
const oneApiUrl = config["one-api-url"];
const oneApiKey = config["one-api-key"];
const chatMaxTokens = config["chat-max-tokens"];

export default async ({
  body: { messages, model, loadDbData, uuid, isAssistant, assistantId },
  jwt,
  set,
  headers,
}: any) => {
  // 如果用户使用的是免费模型，则可以直接进行请求
  // 关于model前端传过来的只是一个名字，需要转换为实际的model型号，考虑存在一定盗用风险不在客户端上传真实model
  const modelResult = await prisma.languageModel.findUnique({
    where: {
      name: model,
    },
    select: {
      cost: true,
      model: true,
    },
  });

  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload && (modelResult?.cost || 0) > 0) {
    set.status = 401;
    return { error: "Unauthorized" };
  }

  // 扣除用户相应聊天费用
  if (modelResult && modelResult?.cost !== 0) {
    const result = await calcBalance(payload, -modelResult.cost, "dialogue");

    if (result.status === -1)
      return new Stream((stream) => {
        const info = JSON.stringify({
          status: -1,
          error: "Insufficient balance",
        });
        stream.send(info);

        // stream.wait(50);

        stream.close();
      });
  }

  let contents: any = [];
  loadDbData = JSON.parse(loadDbData);
  if (loadDbData) {
    // 加载数据库中的对话信息
    const result = await prisma.user.findUnique({
      where: {
        phoneNumber: payload.phoneNumber,
        password: payload.password,
      },
      select: {
        allDialog: {
          select: {
            uuid: true,
            delta: {
              select: {
                role: true,
                content: true,
              },
              orderBy: {
                time: "asc",
              },
            },
          },
        },
      },
    });
    contents = result?.allDialog.filter((item) => item.uuid === uuid)[0].delta;
  } else {
    contents = JSON.parse(messages);
    if (isAssistant && assistantId) {
      isAssistant = JSON.parse(isAssistant);
      assistantId = JSON.parse(assistantId);
    }

    // 如果用户正在使用助理来回答问题，这时候另外添加助力的特定system
    if (isAssistant && assistantId) {
      const getAssistant = await prisma.assistant.findUnique({
        where: {
          id: assistantId,
        },
        select: {
          content_zh_CN: true,
          content_en_US: true,
        },
      });

      if (getAssistant?.content_zh_CN)
        contents.unshift({
          role: "system",
          content: getAssistant?.content_zh_CN,
        });
      if (getAssistant?.content_en_US)
        contents.unshift({
          role: "system",
          content: getAssistant?.content_en_US,
        });
    }
  }

  // 设置超时，防止意外，同时后端程序一定要添加错误捕获，以防止程序意外崩溃。
  set.headers["keep-alive"] = "timeout=5, max=100";

  // 判断语言模型
  if (modelResult?.model === "")
    return new Stream((stream) => {
      const info = JSON.stringify({
        status: -1,
        error: "No model found",
      });
      stream.send(info);

      stream.close();
    });

  // 正式请求聊天接口
  const stringfyData = JSON.stringify({
    model: modelResult?.model,
    messages: contents,
    stream: true,
    max_tokens: Number(chatMaxTokens),
  });
  // console.log(JSON.parse(stringfyData))
  return new Stream((stream) => {
    try {
      axios
        .request({
          method: "POST",
          url: `${oneApiUrl}chat/completions`,
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${oneApiKey}`,
          },
          data: stringfyData,
          responseType: "stream",
        })
        .then((res) => {
          // 处理响应流
          res.data.on("data", (chunk: any) => {
            let data = chunk.toString();
            // console.log(data);
            if (data.startsWith("data: ")) {
              data = data.replace("data: ", "");
            }
            stream.send(data);
          });
          res.data.on("end", () => {
            // console.log("响应流结束");
            stream.close();
          });
        })
        .catch((err) => {
          // 上游请求失败，退回余额
          if (modelResult && modelResult?.cost !== 0)
            calcBalance(payload, modelResult.cost, "dialogue");
          // console.log(err);
          stream.close();
        });
    } catch (error) {
      // console.log(error);
      stream.close();
    }
  });
};
