import { createRequire } from "node:module";
import * as $OpenApi from "@alicloud/openapi-client";
import * as $Util from "@alicloud/tea-util";

const require = createRequire(import.meta.url);
const { default: Dysmsapi2024, SendSmsRequest } = require("@alicloud/dysmsapi20170525");

const createClient = () => {
  let config = new $OpenApi.Config({
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  });
  config.endpoint = "dysmsapi.aliyuncs.com";
  return new Dysmsapi2024(config);
};

export const sendSmsWithOptions = async (
  phoneNumber: string,
  code: number | string,
) => {
  const client = createClient();
  const sendSmsRequest = new SendSmsRequest({
    phoneNumbers: phoneNumber,
    signName: "上海宏途数创科技",
    templateCode: "SMS_505325083",
    templateParam: `{"code": "${code}"}`,
  });
  const runtime = new $Util.RuntimeOptions({});

  try {
    await client.sendSmsWithOptions(sendSmsRequest, runtime);
  } catch (error: any) {
    console.error(error.message);
    console.error(error.data.Recommend);
  }
};
