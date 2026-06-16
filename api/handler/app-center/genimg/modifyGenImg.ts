import prisma from "@/plugin/prismaClient";

export default async function ({
  jwt,
  set,
  headers,
  body: { imgId, status, imgUrl },
}: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  // 获取用户id
  const getUserId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });

  if (!getUserId?.id) return { status: -1, error: "User not found" };

  status = status ? status : "绘画失败";
  imgUrl = imgUrl ? imgUrl : "";

  // 修改图片数据
  await prisma.genImageList.update({
    where: {
      id: Number(imgId),
      userId: getUserId?.id,
    },
    data: {
      status,
      imgUrl,
    },
  });

  return { status: 0, msg: "success" };
}
