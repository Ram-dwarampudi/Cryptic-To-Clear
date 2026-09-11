const messagesModel = require("./messages.model");
const notificationsModel = require("../notifications/notifications.model");
const userModel = require("../models/user.model");

exports.sendMessage = async (req, res, next) => {
  try {
    const senderId = req.user.id;
    const { receiverId, content } = req.body;
    if (!receiverId || !content || !content.trim()) {
      return res.status(400).json({ success: false, message: "receiverId and content are required." });
    }
    if (receiverId === senderId) {
      return res.status(400).json({ success: false, message: "Cannot send message to yourself." });
    }

    const message = await messagesModel.sendMessage(senderId, receiverId, content);

    // Notify receiver
    const sender = await userModel.findById(senderId);
    await notificationsModel.createNotification({
      userId: receiverId,
      actorId: senderId,
      type: "MESSAGE",
      title: `Message from ${sender?.name || "A Classmate"}`,
      message: content.length > 60 ? content.substring(0, 57) + "..." : content,
      data: {
        peerId: senderId,
        senderName: sender?.name,
        senderAvatar: sender?.avatar,
      },
    });

    return res.status(201).json({
      success: true,
      message: "Message sent.",
      data: message,
    });
  } catch (err) {
    return res.status(400).json({ success: false, message: err.message });
  }
};

exports.getConversation = async (req, res, next) => {
  try {
    const currentUserId = req.user.id;
    const { peerId } = req.params;
    if (!peerId) {
      return res.status(400).json({ success: false, message: "peerId is required." });
    }

    const messages = await messagesModel.getConversation(currentUserId, peerId);
    // Mark messages from peer as read
    await messagesModel.markAsRead(peerId, currentUserId);

    return res.status(200).json({
      success: true,
      data: messages,
    });
  } catch (err) {
    next(err);
  }
};

exports.getConversations = async (req, res, next) => {
  try {
    const conversations = await messagesModel.getConversationsSummary(req.user.id);
    return res.status(200).json({
      success: true,
      data: conversations,
    });
  } catch (err) {
    next(err);
  }
};

exports.markRead = async (req, res, next) => {
  try {
    const { peerId } = req.params;
    await messagesModel.markAsRead(peerId, req.user.id);
    return res.status(200).json({ success: true, message: "Messages marked as read." });
  } catch (err) {
    next(err);
  }
};
