import prisma from "@/plugin/prismaClient";

export default async function () {
  const configs = await prisma.configuration.findMany({
    select: { name: true, value: true },
  });

  const map: Record<string, string> = {};
  for (const c of configs) map[c.name] = c.value;

  return {
    status: 0,
    data: {
      siteName: map.site_name || "ChatCafe",
      recordNumber: map.record_number || "",
      contactEmail: map.contact_email || "",
    },
  };
}
