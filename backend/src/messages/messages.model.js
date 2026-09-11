let prisma = null;
try {
  prisma = require("../config/db");
} catch {
  console.warn("Prisma not loaded in messages.model");
}
const userModel = require("../models/user.model");

class MessagesModel {
  constructor() {
    this.messages = []; // in-memory messages array
  }

  async sendMessage(senderId, receiverId, content) {
    if (!senderId || !receiverId || !content || !content.trim()) {
      throw new Error("Invalid message parameters.");
    }
    const cleanContent = content.trim();

    if (prisma) {
      try {
        const msg = await prisma.directMessage.create({
          data: {
            senderId,
            receiverId,
            content: cleanContent,
            isRead: false,
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true, email: true } },
            receiver: { select: { id: true, name: true, avatar: true, email: true } },
          },
        });
        this.messages.push(msg);
        return msg;
      } catch (err) {
        console.warn("Prisma sendMessage fallback to memory:", err.message);
      }
    }

    const msg = {
      id: "msg_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      senderId,
      receiverId,
      content: cleanContent,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.messages.push(msg);
    return msg;
  }

  async getConversation(userAId, userBId) {
    if (!userAId || !userBId) return [];

    if (prisma) {
      try {
        const dbMsgs = await prisma.directMessage.findMany({
          where: {
            OR: [
              { senderId: userAId, receiverId: userBId },
              { senderId: userBId, receiverId: userAId },
            ],
          },
          orderBy: { createdAt: "asc" },
          take: 100,
        });
        if (dbMsgs && dbMsgs.length > 0) {
          return dbMsgs;
        }
      } catch (err) {
        console.warn("Prisma getConversation fallback to memory:", err.message);
      }
    }

    return this.messages
      .filter(
        (m) =>
          (m.senderId === userAId && m.receiverId === userBId) ||
          (m.senderId === userBId && m.receiverId === userAId)
      )
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async markAsRead(senderId, receiverId) {
    if (!senderId || !receiverId) return;

    if (prisma) {
      try {
        await prisma.directMessage.updateMany({
          where: {
            senderId,
            receiverId,
            isRead: false,
          },
          data: { isRead: true },
        });
      } catch (err) {
        console.warn("Prisma markAsRead fallback to memory:", err.message);
      }
    }

    for (const m of this.messages) {
      if (m.senderId === senderId && m.receiverId === receiverId) {
        m.isRead = true;
      }
    }
  }

  async getConversationsSummary(userId) {
    if (!userId) return [];

    let allMsgs = [];
    if (prisma) {
      try {
        allMsgs = await prisma.directMessage.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          orderBy: { createdAt: "desc" },
          include: {
            sender: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
            receiver: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
          },
        });
      } catch (err) {
        console.warn("Prisma getConversationsSummary fallback to memory:", err.message);
      }
    }

    if (!allMsgs || allMsgs.length === 0) {
      allMsgs = this.messages
        .filter((m) => m.senderId === userId || m.receiverId === userId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    const conversationsMap = new Map();

    for (const msg of allMsgs) {
      const isSender = msg.senderId === userId;
      const peerId = isSender ? msg.receiverId : msg.senderId;

      if (!conversationsMap.has(peerId)) {
        let peer = isSender ? msg.receiver : msg.sender;
        if (!peer || !peer.name) {
          const u = await userModel.findById(peerId);
          peer = u ? userModel.sanitizeUser(u) : { id: peerId, name: "Student" };
        }

        conversationsMap.set(peerId, {
          peerId,
          peer,
          lastMessage: {
            content: msg.content,
            createdAt: msg.createdAt,
            senderId: msg.senderId,
          },
          unreadCount: 0,
        });
      }

      if (!isSender && !msg.isRead) {
        const conv = conversationsMap.get(peerId);
        conv.unreadCount += 1;
      }
    }

    return Array.from(conversationsMap.values());
  }
}

module.exports = new MessagesModel();
