let prisma = null;
try {
  prisma = require("../config/db");
} catch {
  console.warn("Prisma not loaded in connections.model");
}
const userModel = require("../models/user.model");

class ConnectionsModel {
  constructor() {
    this.connections = new Map(); // id -> connection
  }

  async getConnectionStatus(userAId, userBId) {
    if (!userAId || !userBId || userAId === userBId) return "SELF";

    if (prisma) {
      try {
        const conn = await prisma.connection.findFirst({
          where: {
            OR: [
              { senderId: userAId, receiverId: userBId },
              { senderId: userBId, receiverId: userAId },
            ],
          },
        });
        if (conn) {
          if (conn.status === "ACCEPTED") return "ACCEPTED";
          if (conn.status === "PENDING") {
            return conn.senderId === userAId ? "PENDING_SENT" : "PENDING_RECEIVED";
          }
          return "REJECTED";
        }
      } catch (err) {
        console.warn("Prisma getConnectionStatus fallback to memory:", err.message);
      }
    }

    for (const c of this.connections.values()) {
      if ((c.senderId === userAId && c.receiverId === userBId) || (c.senderId === userBId && c.receiverId === userAId)) {
        if (c.status === "ACCEPTED") return "ACCEPTED";
        if (c.status === "PENDING") {
          return c.senderId === userAId ? "PENDING_SENT" : "PENDING_RECEIVED";
        }
        return "REJECTED";
      }
    }
    return "NONE";
  }

  async sendRequest(senderId, receiverId) {
    if (!senderId || !receiverId || senderId === receiverId) {
      throw new Error("Invalid connection target.");
    }

    const currentStatus = await this.getConnectionStatus(senderId, receiverId);
    if (currentStatus === "ACCEPTED") {
      throw new Error("Already connected.");
    }
    if (currentStatus === "PENDING_SENT") {
      throw new Error("Connection request already pending.");
    }
    if (currentStatus === "PENDING_RECEIVED") {
      // Auto-accept if recipient already sent one
      return await this.respondByUsers(receiverId, senderId, "accept");
    }

    if (prisma) {
      try {
        const conn = await prisma.connection.upsert({
          where: {
            senderId_receiverId: { senderId, receiverId },
          },
          update: {
            status: "PENDING",
            updatedAt: new Date(),
          },
          create: {
            senderId,
            receiverId,
            status: "PENDING",
          },
          include: {
            sender: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
            receiver: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
          },
        });
        this.connections.set(conn.id, conn);
        return conn;
      } catch (err) {
        console.warn("Prisma sendRequest fallback to memory:", err.message);
      }
    }

    const id = "conn_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
    const memoryConn = {
      id,
      senderId,
      receiverId,
      status: "PENDING",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    this.connections.set(id, memoryConn);
    return memoryConn;
  }

  async respondRequest(requestId, currentUserId, action) {
    const status = action === "accept" ? "ACCEPTED" : "REJECTED";

    if (prisma) {
      try {
        const conn = await prisma.connection.findUnique({ where: { id: requestId } });
        if (!conn) throw new Error("Request not found.");
        if (conn.receiverId !== currentUserId) {
          throw new Error("Not authorized to respond to this request.");
        }

        const updated = await prisma.connection.update({
          where: { id: requestId },
          data: { status, updatedAt: new Date() },
          include: {
            sender: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
            receiver: { select: { id: true, name: true, avatar: true, email: true, stream: true, collegeName: true } },
          },
        });
        this.connections.set(updated.id, updated);
        return updated;
      } catch (err) {
        console.warn("Prisma respondRequest fallback to memory:", err.message);
      }
    }

    const c = this.connections.get(requestId);
    if (!c) throw new Error("Request not found.");
    if (c.receiverId !== currentUserId) throw new Error("Not authorized.");
    c.status = status;
    c.updatedAt = new Date().toISOString();
    this.connections.set(requestId, c);
    return c;
  }

  async respondByUsers(senderId, receiverId, action) {
    const status = action === "accept" ? "ACCEPTED" : "REJECTED";
    if (prisma) {
      try {
        const updated = await prisma.connection.update({
          where: {
            senderId_receiverId: { senderId, receiverId },
          },
          data: { status, updatedAt: new Date() },
        });
        return updated;
      } catch (err) {
        // Fallback
      }
    }
    for (const c of this.connections.values()) {
      if (c.senderId === senderId && c.receiverId === receiverId) {
        c.status = status;
        return c;
      }
    }
    return null;
  }

  async removeConnection(userAId, userBId) {
    if (prisma) {
      try {
        await prisma.connection.deleteMany({
          where: {
            OR: [
              { senderId: userAId, receiverId: userBId },
              { senderId: userBId, receiverId: userAId },
            ],
          },
        });
      } catch (err) {
        console.warn("Prisma removeConnection fallback to memory:", err.message);
      }
    }

    for (const [id, c] of this.connections.entries()) {
      if ((c.senderId === userAId && c.receiverId === userBId) || (c.senderId === userBId && c.receiverId === userAId)) {
        this.connections.delete(id);
      }
    }
    return true;
  }

  async getConnectionsData(userId) {
    if (!userId) return { connections: [], pendingReceived: [], pendingSent: [] };

    if (prisma) {
      try {
        const all = await prisma.connection.findMany({
          where: {
            OR: [{ senderId: userId }, { receiverId: userId }],
          },
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                rollNo: true,
                collegeName: true,
                stream: true,
                overallScore: true,
                karmaPoints: true,
                bio: true,
              },
            },
            receiver: {
              select: {
                id: true,
                name: true,
                email: true,
                avatar: true,
                rollNo: true,
                collegeName: true,
                stream: true,
                overallScore: true,
                karmaPoints: true,
                bio: true,
              },
            },
          },
          orderBy: { updatedAt: "desc" },
        });

        const connections = [];
        const pendingReceived = [];
        const pendingSent = [];

        for (const c of all) {
          const isSender = c.senderId === userId;
          const peer = isSender ? c.receiver : c.sender;

          if (c.status === "ACCEPTED") {
            connections.push({
              connectionId: c.id,
              connectedAt: c.updatedAt,
              peer,
            });
          } else if (c.status === "PENDING") {
            if (isSender) {
              pendingSent.push({
                requestId: c.id,
                sentAt: c.createdAt,
                peer,
              });
            } else {
              pendingReceived.push({
                requestId: c.id,
                receivedAt: c.createdAt,
                peer,
              });
            }
          }
        }

        return { connections, pendingReceived, pendingSent };
      } catch (err) {
        console.warn("Prisma getConnectionsData fallback to memory:", err.message);
      }
    }

    // Memory fallback
    const connections = [];
    const pendingReceived = [];
    const pendingSent = [];

    for (const c of this.connections.values()) {
      if (c.senderId === userId || c.receiverId === userId) {
        const isSender = c.senderId === userId;
        const peerId = isSender ? c.receiverId : c.senderId;
        const peerUser = await userModel.findById(peerId);
        const peer = peerUser ? userModel.sanitizeUser(peerUser) : { id: peerId, name: "Student" };

        if (c.status === "ACCEPTED") {
          connections.push({ connectionId: c.id, connectedAt: c.updatedAt, peer });
        } else if (c.status === "PENDING") {
          if (isSender) {
            pendingSent.push({ requestId: c.id, sentAt: c.createdAt, peer });
          } else {
            pendingReceived.push({ requestId: c.id, receivedAt: c.createdAt, peer });
          }
        }
      }
    }

    return { connections, pendingReceived, pendingSent };
  }
}

module.exports = new ConnectionsModel();
