import prisma from "@/plugin/prismaClient";

export default async function ({ query: { id } }: any) {
  const getAssistantById = await prisma.assistant.findUnique({
    where: {
      id: Number(id),
    },
    select: {
      name: true,
      imgUrl: true,
      description: true,
    },
  });

  if (getAssistantById === null)
    return { status: -1, message: "Assistant not found" };

  return {
    status: 0,
    data: getAssistantById,
  };
}
