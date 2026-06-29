const username = process.env.SUPER_USERNAME;
const password = process.env.SUPER_PASSWORD;

export default async function ({ body, adminJWT, cookie: { adminAuth } }: any) {
  // 验证账号密码是否正确
  if (username !== body.userName || password !== body.password)
    return {
      data: null,
      code: "1000",
      msg: "用户名或密码错误",
    };

  // 用户存在，生成jwt，返回jwt给客户端
  const option = {
    value: await adminJWT.sign(body),
    httpOnly: true,
    path: "/admin",
  };
  adminAuth.set(option);

  return {
    data: {
      tokenAdmin: adminAuth.value,
      refreshToken: adminAuth.value,
    },
    code: "0000",
    msg: "请求成功",
  };
}
