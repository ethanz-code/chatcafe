import prisma from "@/plugin/prismaClient";
import { getConfig } from "@/plugin/writeConfig";
import axios from "axios";
import { urlDatas } from "./inspect";
import { calcBalance } from "@/plugin/balance";

const config = await getConfig();
const dalle3ProxyAddress = config["dalle3-proxy-address"];
const dalle3SecretKey = config["dalle3-secret-key"];
const mjImagineProxyAddress = config["mj-imagine-proxy-address"];
const mjSecretKey = config["mj-secret-key"];
// console.log(mjProxyAddress, mjSecretKey)

function isValidUrl(url: string) {
  // 正则表达式匹配URL格式（以http、https、ftp、ftps开头）
  const urlPattern = /^(http|https|ftp|ftps):\/\/[^\s/$.?#].[^\s]*$/;
  return urlPattern.test(url);
}

export async function saveAndEndWork(
  imgUrl: string,
  imgId: number,
  getUserId: { id: number },
) {
  // 检测imgUrl是否是一个url
  if (!isValidUrl(imgUrl)) {
    await prisma.genImageList.update({
      where: {
        id: imgId,
        userId: getUserId?.id,
      },
      data: {
        status: "绘画失败",
        imgUrl: "",
      },
    });
    return { status: -1, error: imgUrl };
  } else {
    // 将图片地址存到数据表
    await prisma.genImageList.update({
      where: {
        id: imgId,
        userId: getUserId?.id,
      },
      data: {
        imgUrl: imgUrl,
        status: "绘画完成",
      },
    });

    // 原本是在这里再去请求返回的imgUrl然后保存到服务器，
    // 但是这样太浪费时间，请求的url也带cdn只是有时效性3day，
    // 因此决定启用定时器，每1小时检测一次是否有新生成的图片，有的话拉到本地再去替换数据库中imgUrl
    urlDatas.push({ url: imgUrl, imgId: imgId });
  }
}

export default async function ({
  jwt,
  set,
  headers,
  body: { imgId, size },
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

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

  // 通过用户id和传过来的图片id结合查询添加的图像相关信息（可避免用户A创建的图像被用户B看到）
  const getImgData = await prisma.genImageList.findUnique({
    where: {
      id: Number(imgId),
      userId: getUserId?.id,
    },
    select: {
      model: true,
      prompt: true,
      referenceBase64: true,
    },
  });

  // 判断图像相关信息是否存在
  if (!getImgData)
    return {
      status: -1,
      error:
        "The image information does not exist, please make sure to add it correctly.",
    };

  let model = getImgData?.model || "DALLE-3";

  // 获取数据库生成图像模型需要花费的费用，需要先将模型相对应
  const transToAppCenterModel: Record<string, string> = {
    SD: "Stable Diffusion",
    "DALLE-3": "DALLE-3",
    MIDJOURNEY: "Midjourney",
  };
  const getCost = await prisma.applicationCenter.findMany({
    where: {
      type: "image",
      model: transToAppCenterModel[model],
    },
    select: {
      cost: true,
    },
  });

  // 扣除用户相应生成图像费用
  const result = await calcBalance(
    payload,
    -(getCost[0].cost || 1),
    "painting",
  );
  if (result.status === -1)
    return { status: -1, error: "Insufficient balance" };

  // 生成图像
  let imgUrl = "";
  if (model === "DALLE-3" || model === "SD") {
    let raw = JSON.stringify({
      model: "dall-e-3",
      prompt: getImgData?.prompt,
      n: 1,
      size: size || "1024x1024",
    });

    const config = {
      method: "post",
      url: dalle3ProxyAddress,
      headers: {
        Accept: "application/json",
        Authorization: "Bearer " + dalle3SecretKey,
        //  'User-Agent': 'Apifox/1.0.0 (https://apifox.com)',
        "Content-Type": "application/json",
      },
      data: raw,
    };

    try {
      const response = await axios.request(config);
      if (response.status === 200) {
        const parsedData = JSON.parse(JSON.stringify(response.data));
        // 这里.toString()也能解决问题，将object数据转换过来
        // console.log(parsedData);
        imgUrl = parsedData!.data[0].url;

        await saveAndEndWork(imgUrl, Number(imgId), getUserId);
        return { status: 0, data: imgUrl };
      } else {
        // 上游请求失败，退回余额
        calcBalance(payload, getCost[0].cost || 1, "painting");
        return { status: -1, data: "上游请求失败，请稍后再试" };
      }
    } catch (error) {
      calcBalance(payload, getCost[0].cost || 1, "painting");
      return { status: -1, data: "上游请求失败，请稍后再试" };
    }
  } else if (model === "MIDJOURNEY") {
    // mj不太一样，需要先提交任务，之后不断请求检测进度
    // 如果参考图base64存在则传入参数中，否则不传
    const base64Array = getImgData?.referenceBase64
      ? [getImgData?.referenceBase64]
      : [];
    const jsonData = JSON.stringify({
      base64Array,
      botType: "MID_JOURNEY",
      instanceId: "",
      modes: [],
      notifyHook: "",
      prompt: getImgData?.prompt,
      remix: true,
      remixAutoConsidered: true,
      state: "",
    });
    // console.log(jsonData)
    try {
      const response = await axios.request({
        url: mjImagineProxyAddress,
        method: "post",
        headers: {
          "mj-api-secret": mjSecretKey,
          "Content-Type": "application/json",
          Accept: "*/*",
          Connection: "keep-alive",
        },
        data: jsonData,
      });
      if (response.status === 200) {
        const parsedData = JSON.parse(JSON.stringify(response.data));
        // console.log(parsedData)

        // 便于前端做处理，status改为1
        return { status: 1, data: parsedData };
      } else {
        console.log("Midjourney绘画失败，请求失败状态码：", response.status);
        // 上游请求失败，退回余额
        calcBalance(payload, getCost[0].cost || 1, "painting");
        return { status: -1, data: "上游请求失败，请稍后再试" };
      }
    } catch (error) {
      calcBalance(payload, getCost[0].cost || 1, "painting");
      return { status: -1, data: "上游请求失败，请稍后再试" };
    }
  }

  return { status: -2, data: "未知错误，已到EndPoint" };
}
