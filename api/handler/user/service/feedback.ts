import prisma from "@/plugin/prismaClient";

export default async function ({
  jwt,
  set,
  headers,
  body: { type, content, contact },
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

  if (!getUserId) return { status: -1, error: "User not found" };

  // 将数据插入到表中
  const insertData = await prisma.feedback.create({
    data: {
      type,
      content,
      contact,
      userId: getUserId?.id,
    },
  });

  return { status: 0, data: insertData };
}
