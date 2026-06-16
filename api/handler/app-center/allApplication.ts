import prisma from "@/plugin/prismaClient";

export default async function ({}: any) {
  const apps = await prisma.applicationCenter.findMany();

  const result = apps.map((app) => {
    return {
      title: app.name,
      description: app.description,
      imgUrl: app.imgUrl,
      path: app.path,
      cost: app.cost,
      model: app.model,
      query: {
        type: app.queryType,
      },
      free: app.cost === 0,
    };
  });

  return { status: 0, data: result };
}
