import prisma from "@/plugin/prismaClient";

const RETENTION_DAYS = 30;

export async function cleanupOldData() {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - RETENTION_DAYS);

  try {
    const deleted = await prisma.allDialog.deleteMany({
      where: {
        updatedAt: { lt: cutoff },
      },
    });
    if (deleted.count > 0) {
      console.log(`[cleanup] Deleted ${deleted.count} dialogs older than ${RETENTION_DAYS} days`);
    }
  } catch (error) {
    console.error("[cleanup] Error cleaning up old data:", error);
  }
}
