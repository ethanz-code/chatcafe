import prisma from "./prismaClient";

const getAllInviteCode = await prisma.user.findMany({
  select: {
    inviteCode: true,
  },
});
// 现有用户邀请码暂存区
export const inviteCodeBuffer = getAllInviteCode.map((user) => user.inviteCode);
console.log(inviteCodeBuffer);

function generateInviteCode() {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  let inviteCode = "";
  for (let i = 0; i < 6; i++) {
    const randomIndex = Math.floor(Math.random() * chars.length);
    inviteCode += chars.charAt(randomIndex);
  }
  return inviteCode;
}

export function getNewInviteCode() {
  let newInviteCode = generateInviteCode();
  while (inviteCodeBuffer.includes(newInviteCode)) {
    newInviteCode = generateInviteCode();
  }

  inviteCodeBuffer.push(newInviteCode);
  return newInviteCode;
}
