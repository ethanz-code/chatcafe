import prisma from "@/plugin/prismaClient";
import { getConfig } from "@/plugin/writeConfig";
import Stream from "@elysiajs/stream";
import axios from "axios";

const config = await getConfig();
const oneApiUrl = config["one-api-url"];
const oneApiKey = config["one-api-key"];
const chatMaxTokens = config["chat-max-tokens"];

export default async function ({ body: { model, prompt, token } }: any) {
  const stringfyData = JSON.stringify({
    model: model || "gpt-3.5-turbo",
    messages: [{ role: "user", content: prompt }],
    stream: true,
    max_tokens: Number(token || chatMaxTokens),
  });

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
          console.log(err);
          stream.close();
        });
    } catch (error) {
      console.log(error);
      stream.close();
    }
  });
}
