import prisma from "@/plugin/prismaClient";
import { calcBalance } from "@/plugin/balance";
import { getPunchRelatedData } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const userWhere = {
    phoneNumber: payload.phoneNumber,
    password: payload.password,
  };

  const { continuousPunch } = await getPunchRelatedData(userWhere);

  // 生成一个10~30的随机整数，连续签到次数越多，赚取对话次数越高
  let randomNum = Math.min(
    30,
    Math.floor(Math.random() * 31) + continuousPunch,
  );
  randomNum = Math.max(10, randomNum);
  await calcBalance(payload, randomNum, "dialogue");
  const detail = await prisma.user.update({
    where: userWhere,
    data: {
      punchInDaily: {
        create: {
          rewardDialogue: randomNum,
        },
      },
    },
    select: {
      punchInDaily: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });

  return {
    status: 0,
    message: "success",
    punchInDaily: detail.punchInDaily[0],
    continuousPunch: continuousPunch + 1,
  };
}
