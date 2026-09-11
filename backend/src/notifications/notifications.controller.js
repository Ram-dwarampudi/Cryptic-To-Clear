const notificationsModel = require("./notifications.model");

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const notifications = await notificationsModel.getNotifications(userId);
    const unreadCount = await notificationsModel.getUnreadCount(userId);
    return res.status(200).json({
      success: true,
      data: notifications,
      unreadCount,
    });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { id } = req.params;
    await notificationsModel.markRead(id, req.user.id);
    return res.status(200).json({ success: true, message: "Marked as read." });
  } catch (err) {
    next(err);
  }
};

exports.markAllRead = async (req, res, next) => {
  try {
    await notificationsModel.markAllRead(req.user.id);
    return res.status(200).json({ success: true, message: "All notifications marked as read." });
  } catch (err) {
    next(err);
  }
};
