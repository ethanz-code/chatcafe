import { getPunchRelatedData } from "@/plugin/taskReward";

export default async function ({ jwt, set, headers }: any) {
  // 验证token
  const payload = await jwt.verify(headers["authorization"].split(" ")[1]);
  if (!payload) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const userWhere = {
    id: payload.id,
  };

  const { punchInDaily, continuousPunch } =
    await getPunchRelatedData(userWhere);

  return { status: 0, message: "success", punchInDaily, continuousPunch };
}
