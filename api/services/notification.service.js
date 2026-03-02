import Notification from "../models/notification.model.js";

export const createNotification = async ({
  userId,
  actorId = null,
  type,
  title,
  message,
  entityType = "",
  entityId = "",
  metadata = {},
  dedupeKey = "",
  dedupeWindowSeconds = 30,
}) => {
  if (!userId || !type || !title || !message) {
    return null;
  }

  const effectiveDedupeKey = dedupeKey || `${type}:${entityType || "none"}:${entityId || "none"}:${actorId || "none"}`;

  if (dedupeWindowSeconds > 0) {
    const since = new Date(Date.now() - dedupeWindowSeconds * 1000);
    const existing = await Notification.findOne({
      userId,
      dedupeKey: effectiveDedupeKey,
      createdAt: { $gte: since },
    });

    if (existing) {
      return existing;
    }
  }

  const created = await Notification.create({
    userId,
    actorId,
    type,
    title,
    message,
    entityType,
    entityId: entityId ? String(entityId) : "",
    metadata,
    dedupeKey: effectiveDedupeKey,
  });

  return created;
};
