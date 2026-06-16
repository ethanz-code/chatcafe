import prisma from "@/plugin/prismaClient";
import { saveAndEndWork } from "./generate";
import axios from "axios";
import { getConfig } from "@/plugin/writeConfig";

const config = await getConfig();
const mjStatusProxyAddress = config["mj-status-proxy-address"];
const mjSecretKey = config["mj-secret-key"];

export default async function ({
  jwt,
  set,
  headers,
  body: { taskId, imgId },
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const jsonData = JSON.stringify({
    ids: [taskId],
  });
  const response = await axios.request({
    url: mjStatusProxyAddress,
    method: "POST",
    headers: {
      "mj-api-secret": mjSecretKey,
    },
    data: jsonData,
  });
  if (response.status === 200) {
    const parsedData = JSON.parse(JSON.stringify(response.data));
    if (parsedData[0].status === "SUCCESS") {
      // 更新数据库
      // 先获取用户id
      const getUserId = await prisma.user.findUnique({
        where: {
          phoneNumber: payload.phoneNumber,
          password: payload.password,
        },
        select: {
          id: true,
        },
      });
      // 判断用户ID是否存在
      if (!getUserId) return { status: -1, error: "User not found" };

      // 检查未被替换的图片在数据库中是否是空字符串
      const imgIsEmpty = await prisma.genImageList.findUnique({
        where: {
          id: Number(imgId),
          imgUrl: "",
        },
      });

      // 防止多次提交保存工作
      if (imgIsEmpty)
        saveAndEndWork(parsedData[0].imageUrl, Number(imgId), getUserId);
      return { status: 0, data: parsedData[0].imageUrl };
    } else {
      return { status: 1, data: parsedData[0] };
    }
  } else {
    console.log("Midjourney绘画查询失败，失败状态码：", response.status);
    return { status: -1, data: "上游请求失败，请稍后再试" };
  }

  return { status: -1, data: "未知错误，已到EndPoint" };
}
