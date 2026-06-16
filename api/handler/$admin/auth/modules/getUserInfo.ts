const SUPER_USERNAME = Bun.env.SUPER_USERNAME;

export default async function () {
  return {
    data: {
      userId: "10001",
      userName: SUPER_USERNAME,
      roles: ["R_SUPER"],
      buttons: ["B_CODE1", "B_CODE2", "B_CODE3"],
    },
    code: "0000",
    msg: "请求成功",
  };
}
