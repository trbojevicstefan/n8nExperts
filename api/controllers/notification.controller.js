import Notification from "../models/notification.model.js";
import createError from "../utils/createError.js";

const asNumber = (value, fallback) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
};

export const getNotifications = async (req, res, next) => {
  try {
    const page = Math.max(1, asNumber(req.query.page, 1));
    const limit = Math.min(100, Math.max(1, asNumber(req.query.limit, 25)));
    const skip = (page - 1) * limit;

    const filters = {
      userId: req.userId,
      ...(req.query.type && { type: req.query.type }),
      ...(req.query.unread === "true" && { isRead: false }),
    };

    const [notifications, total, unread] = await Promise.all([
      Notification.find(filters)
        .populate("actorId", "username img")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limit),
      Notification.countDocuments(filters),
      Notification.countDocuments({ userId: req.userId, isRead: false }),
    ]);

    res.status(200).json({
      notifications,
      unreadCount: unread,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    next(err);
  }
};

export const getUnreadNotificationCount = async (req, res, next) => {
  try {
    const unreadCount = await Notification.countDocuments({ userId: req.userId, isRead: false });
    res.status(200).json({ unreadCount });
  } catch (err) {
    next(err);
  }
};

export const markNotificationRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.notificationId);
    if (!notification) {
      return next(createError(404, "Notification not found!"));
    }
    if (notification.userId.toString() !== req.userId) {
      return next(createError(403, "You can only update your own notifications."));
    }

    notification.isRead = true;
    notification.readAt = new Date();
    await notification.save();

    res.status(200).json(notification);
  } catch (err) {
    next(err);
  }
};

export const markAllNotificationsRead = async (req, res, next) => {
  try {
    const result = await Notification.updateMany(
      { userId: req.userId, isRead: false },
      { $set: { isRead: true, readAt: new Date() } }
    );

    res.status(200).json({ updated: result.modifiedCount || 0 });
  } catch (err) {
    next(err);
  }
};
