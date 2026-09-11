const connectionsModel = require("./connections.model");
const notificationsModel = require("../notifications/notifications.model");
const userModel = require("../models/user.model");

exports.getConnections = async (req, res, next) => {
  try {
    const data = await connectionsModel.getConnectionsData(req.user.id);
    return res.status(200).json({ success: true, ...data });
  } catch (err) {
    next(err);
  }
};

exports.sendRequest = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { targetUserId } = req.body;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "Target user ID is required." });
    }
    if (targetUserId === senderId) {
      return res.status(400).json({ success: false, message: "Cannot connect with yourself." });
    }

    const connection = await connectionsModel.sendRequest(senderId, targetUserId);

    // Notify receiver
    const sender = await userModel.findById(senderId);
    await notificationsModel.createNotification({
      userId: targetUserId,
      actorId: senderId,
      type: "CONNECTION_REQUEST",
      title: "New Connection Request",
      message: `${sender?.name || "A student"} sent you a connection request.`,
      data: {
        requestId: connection.id,
        senderId,
        senderName: sender?.name,
        senderAvatar: sender?.avatar,
      },
    });

    return res.status(200).json({
      success: true,
      message: "Connection request sent.",
      connection,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.respondRequest = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { requestId, action } = req.body; // action: 'accept' | 'decline'
    if (!requestId || !action) {
      return res.status(400).json({ success: false, message: "requestId and action are required." });
    }

    const updated = await connectionsModel.respondRequest(requestId, currentUserId, action);

    // If accepted, notify the original requester
    if (action === "accept") {
      const currentUser = await userModel.findById(currentUserId);
      const recipientId = updated.senderId === currentUserId ? updated.receiverId : updated.senderId;
      await notificationsModel.createNotification({
        userId: recipientId,
        actorId: currentUserId,
        type: "CONNECTION_ACCEPTED",
        title: "Connection Accepted! 🎉",
        message: `${currentUser?.name || "A student"} accepted your connection request.`,
        data: {
          peerId: currentUserId,
          peerName: currentUser?.name,
          peerAvatar: currentUser?.avatar,
        },
      });
    }

    return res.status(200).json({
      success: true,
      message: action === "accept" ? "Connection accepted." : "Connection request declined.",
      connection: updated,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.removeConnection = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    if (!targetUserId) {
      return res.status(400).json({ success: false, message: "Target user ID is required." });
    }
    await connectionsModel.removeConnection(req.user.id, targetUserId);
    return res.status(200).json({ success: true, message: "Connection removed." });
  } catch (err) {
    next(err);
  }
};

exports.getStatus = async (req, res, next) => {
  try {
    const { targetUserId } = req.params;
    const status = await connectionsModel.getConnectionStatus(req.user.id, targetUserId);
    return res.status(200).json({ success: true, status });
  } catch (err) {
    next(err);
  }
};
