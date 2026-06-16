import Dysmsapi2024, * as $Dysmsapi2024 from "@alicloud/dysmsapi20170525";
import OpenApi, * as $OpenApi from "@alicloud/openapi-client";
import Util, * as $Util from "@alicloud/tea-util";

const createClient = (): Dysmsapi2024 => {
  // 工程代码泄露可能会导致 AccessKey 泄露，并威胁账号下所有资源的安全性。以下代码示例仅供参考。
  // 建议使用更安全的 STS 方式，更多鉴权访问方式请参见：https://help.aliyun.com/document_detail/378664.html。
  let config = new $OpenApi.Config({
    // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_ID。
    accessKeyId: process.env.ALIBABA_CLOUD_ACCESS_KEY_ID,
    // 必填，请确保代码运行环境设置了环境变量 ALIBABA_CLOUD_ACCESS_KEY_SECRET。
    accessKeySecret: process.env.ALIBABA_CLOUD_ACCESS_KEY_SECRET,
  });
  // Endpoint 请参考 https://api.aliyun.com/product/Dysmsapi
  config.endpoint = "dysmsapi.aliyuncs.com";
  return new Dysmsapi2024(config);
};

export const sendSmsWithOptions = async (
  phoneNumber: string,
  code: number | string,
) => {
  const client = createClient();
  const sendSmsRequest = new $Dysmsapi2024.SendSmsRequest({
    phoneNumbers: phoneNumber,
    signName: "济宁市若森计算机软件开发",
    templateCode: "SMS_301580453",
    templateParam: `{"code": "${code}"}`,
  });
  const runtime = new $Util.RuntimeOptions({});

  try {
    // 复制代码运行请自行打印 API 的返回值
    await client.sendSmsWithOptions(sendSmsRequest, runtime);
  } catch (error: any) {
    // 此处仅做打印展示，请谨慎对待异常处理，在工程项目中切勿直接忽略异常。
    // 错误 message
    console.log(error.message);
    // 诊断地址
    console.log(error.data.Recommend);
  }
};
