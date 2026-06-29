export default async function ({ jwt, set, headers }: any) {
  const authHeader = headers?.["authorization"];
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  const token = authHeader.split(" ")[1];
  if (!(await jwt.verify(token))) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  }

  return { status: 0, data: "Verified" };
}
