import prisma from "@/plugin/prismaClient";

async function updateBalance(
  whereOpt: any,
  dialogueBalance: number,
  paintingBalance: number,
) {
  // 更新余额
  const result = await prisma.user.update({
    where: whereOpt,
    data: {
      dialogueBalance,
      paintingBalance,
    },
    select: {
      id: true,
      dialogueBalance: true,
      paintingBalance: true,
    },
  });
  return result;
}

interface UserAuthPayload {
  id: number;
}

export const calcBalance = async (
  payload: UserAuthPayload,
  increment: number,
  type: string,
) => {
  // 将用户余额读取出来
  const whereOpt = {
    id: payload.id,
  };
  const raw = await prisma.user.findUnique({
    where: whereOpt,
    select: {
      dialogueBalance: true,
      paintingBalance: true,
    },
  });

  const db =
    type === "dialogue"
      ? (raw?.dialogueBalance || 0) + increment
      : raw?.dialogueBalance || 0;
  const pb =
    type === "painting"
      ? (raw?.paintingBalance || 0) + increment
      : raw?.paintingBalance || 0;

  // 检测是否还能够被减去，不能被减去则返回错误
  if (db < 0 || pb < 0) return { status: -1, error: "Insufficient balance" };

  return { status: 0, data: await updateBalance(whereOpt, db, pb) };
};
