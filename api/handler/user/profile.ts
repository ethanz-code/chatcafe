import prisma from "@/plugin/prismaClient";

export default async function ({ jwt, set, headers }: any) {
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const result = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
      phoneNumber: true,
      dialogueBalance: true,
      paintingBalance: true,
      vip: true,
      name: true,
      avatar: true,
    },
  });

  return { status: 0, data: result };
}
