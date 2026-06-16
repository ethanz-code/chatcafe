export default async function ({ jwt, set, headers }: any) {
  // console.log(headers['authorization'])
  if (!(await jwt.verify(headers["authorization"].split(" ")[1]))) {
    set.status = 401;
    return { status: -1, error: "Unauthorized" };
  } else return { status: 0, data: "Verified" };
}
