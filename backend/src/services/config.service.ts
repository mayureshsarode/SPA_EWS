import prisma from "../config/prisma";

/**
 * Get all system config as a key-value map.
 */
export async function getConfig(): Promise<Record<string, string>> {
  const configs = await prisma.systemConfig.findMany();
  return Object.fromEntries(configs.map((c) => [c.key, c.value]));
}

/**
 * Upsert a single config key-value pair.
 */
export async function setConfigValue(key: string, value: string) {
  return prisma.systemConfig.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });
}

/**
 * Bulk-update multiple config keys.
 */
export async function setConfigBulk(
  entries: Record<string, string>,
  userId: string
) {
  const updates = Object.entries(entries).map(([key, value]) =>
    prisma.systemConfig.upsert({
      where: { key },
      update: { value: String(value) },
      create: { key, value: String(value) },
    })
  );

  await Promise.all(updates);

  // Audit log
  await prisma.auditLog.create({
    data: {
      action: "CONFIG_UPDATED",
      entityType: "SystemConfig",
      entityId: "bulk",
      userId,
      details: JSON.stringify(entries),
    },
  });

  return { message: "Configuration updated successfully" };
}
