import prisma from "@/plugin/prismaClient";
import { type PunchInDaily } from "@prisma/client";
import moment from "moment";
import safeEval from "safe-eval";
import { calcBalance } from "./balance";

// 比对两个时间，并任意指定比对单位
export function diffTimeOffset(
  lastISOTime: string,
  secondISOTime: string,
  format: any,
) {
  return moment(lastISOTime).diff(moment(secondISOTime), format);
}

interface JWTAuthPayload {
  phoneNumber: string;
  password: string;
}
interface PunchDataReturnType {
  punchInDaily: PunchInDaily[];
  continuousPunch: number;
  status?: number;
  error?: string;
}
// 获取用户过往打卡信息以及连续打卡次数
export const getPunchRelatedData = async (
  payload: JWTAuthPayload,
): Promise<PunchDataReturnType> => {
  const detail = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      punchInDaily: {
        orderBy: {
          createdAt: "desc",
        },
      },
    },
  });
  if (!detail)
    return {
      punchInDaily: [],
      continuousPunch: 0,
      status: -1,
      error: "User not found",
    };

  let continuousPunch = 0;
  const punchInDaily = detail.punchInDaily;
  for (let i = 0; i < punchInDaily.length; i++) {
    if (i + 1 >= punchInDaily.length) break;
    const minutesDiff = diffTimeOffset(
      punchInDaily[i].createdAt.toISOString(),
      punchInDaily[i + 1].createdAt.toISOString(),
      "minutes",
    );
    if (minutesDiff >= 1440 && minutesDiff < 2880) continuousPunch++;
    else break;
  }
  continuousPunch += continuousPunch === 0 ? 0 : 1;

  // 检测最新一次签到距离今日多久
  if (punchInDaily.length !== 0) {
    const diffToday = diffTimeOffset(
      moment().toISOString(),
      punchInDaily[0].createdAt.toISOString(),
      "minutes",
    );
    if (diffToday > 2880) continuousPunch = 0;
    else if (diffToday < 2880 && continuousPunch === 0) continuousPunch = 1;
  }

  return { punchInDaily: detail.punchInDaily, continuousPunch };
};

// 获取用户任务完成状态
interface TaskStruct {
  name: string;
  condition: string;
}
// 用户任务完成状态
enum TaskStatus {
  InProgress,
  AvailableReward,
  Finished,
  Unknown,
}
const taskStatusRemap = [
  "in progress",
  "available reward",
  "finished",
  "unknown",
];
interface TaskResult {
  status: number;
  error?: string;
  taskStatus: string;
}
export const getUserTaskStatus = async (
  payload: JWTAuthPayload,
  obj: TaskStruct,
): Promise<TaskResult> => {
  // 获取到用户ID
  const userId = await prisma.user.findUnique({
    where: {
      phoneNumber: payload.phoneNumber,
      password: payload.password,
    },
    select: {
      id: true,
    },
  });
  if (userId === null)
    return {
      status: -1,
      error: "User not found",
      taskStatus: taskStatusRemap[TaskStatus.Unknown],
    };

  // 获取到用户任务完成状态
  const booleanCheck = obj.condition === "0"; // 如果条件为字符串'0'表示检测boolean值

  // 获取是否有对应的用户任务已创建，没有的话说明在进行中
  const taskExist = await prisma.taskReward.findMany({
    where: {
      name: obj.name,
    },
    select: {
      id: true,
      taskRewardReceived: {
        where: {
          userId: userId.id, // 这条很重要，只查询出指定用户id的指定名称的任务
        },
      },
    },
  });
  if (taskExist[0].taskRewardReceived.length === 0) {
    // 不存在任务，自动创建
    await prisma.taskReward.update({
      where: {
        id: taskExist[0].id,
        name: obj.name,
      },
      data: {
        taskRewardReceived: {
          create: {
            userId: userId.id,
            value: 0,
          },
        },
      },
    });
    return { status: 0, taskStatus: taskStatusRemap[TaskStatus.InProgress] };
  } else {
    // 任务已创建
    const v = taskExist[0].taskRewardReceived[0].value;
    if (v === -1)
      return { status: 0, taskStatus: taskStatusRemap[TaskStatus.Finished] };

    // 获取到任务记录值，通过条件表达式或只进行boolean比对
    if (booleanCheck) {
      if (v === 0)
        return {
          status: 0,
          taskStatus: taskStatusRemap[TaskStatus.InProgress],
        };
      else if (v >= 1)
        return {
          status: 0,
          taskStatus: taskStatusRemap[TaskStatus.AvailableReward],
        };
    } else {
      // condition = 'value >= 50'
      const evaluated = safeEval(obj.condition, { value: v });
      if (evaluated)
        return {
          status: 0,
          taskStatus: taskStatusRemap[TaskStatus.AvailableReward],
        };
      else
        return {
          status: 0,
          taskStatus: taskStatusRemap[TaskStatus.InProgress],
        };
    }
  }

  return { status: -1, taskStatus: taskStatusRemap[TaskStatus.Unknown] };
};

interface SetTaskValueResult {
  status: number;
  error?: string;
}
export const setUserTaskValue = async (
  taskRewardId: number,
  increment: number,
): Promise<SetTaskValueResult> => {
  const task = await prisma.taskRewardReceived.findUnique({
    where: {
      id: taskRewardId,
    },
    select: {
      value: true,
    },
  });
  if (!task) return { status: -1, error: "task not found" };

  const newValue = task.value + increment;
  await prisma.taskRewardReceived.update({
    where: {
      id: taskRewardId,
    },
    data: {
      value: newValue,
    },
  });
  return { status: 0 };
};

// 领取奖励
export const receiveAReward = async (
  payload: JWTAuthPayload,
  obj: TaskStruct,
): Promise<SetTaskValueResult> => {
  const result = await getUserTaskStatus(payload, obj);
  if (
    result.status === 0 &&
    result.taskStatus === taskStatusRemap[TaskStatus.AvailableReward]
  ) {
    // 满足条件，可以领奖
    // 1. 将任务值设置为-1
    // 2. 为用户颁发奖励
    const user = await prisma.user.findUnique({
      where: {
        phoneNumber: payload.phoneNumber,
        password: payload.password,
      },
      select: {
        id: true,
      },
    });
    if (!user) return { status: -1, error: "user not found" };
    const taskReward = await prisma.taskReward.findMany({
      where: {
        name: obj.name,
        condition: obj.condition,
      },
      select: {
        rewardDialogue: true,
        rewardPainting: true,
        taskRewardReceived: {
          where: {
            userId: user.id,
          },
          select: {
            id: true,
          },
        },
      },
    });
    if (taskReward.length === 0)
      return { status: -1, error: "task reward not found" };
    if (taskReward[0].taskRewardReceived.length === 0)
      return { status: -1, error: "task reward received not found" };

    const rewardDialogue = taskReward[0].rewardDialogue;
    const rewardPainting = taskReward[0].rewardPainting;

    // 将任务值设为-1，意为已完成
    await prisma.taskRewardReceived.update({
      where: {
        id: taskReward[0].taskRewardReceived[0].id,
      },
      data: {
        value: -1,
      },
    });

    // 为用户颁发奖励
    await calcBalance(payload, rewardDialogue, "dialogue");
    await calcBalance(payload, rewardPainting, "painting");
  }

  return { status: 0 };
};
