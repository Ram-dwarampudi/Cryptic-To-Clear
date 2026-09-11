let prisma = null;
try {
  prisma = require("../config/db");
} catch {
  console.warn("Prisma not loaded in notifications.model");
}

class NotificationsModel {
  constructor() {
    this.notifications = new Map(); // id -> notification
  }

  async createNotification({ userId, actorId = null, type, title, message, data = null }) {
    if (!userId || !title) return null;
    const serializedData = data ? (typeof data === "string" ? data : JSON.stringify(data)) : null;

    if (prisma) {
      try {
        const notif = await prisma.notification.create({
          data: {
            userId,
            actorId,
            type: type || "SYSTEM",
            title,
            message: message || "",
            data: serializedData,
            isRead: false,
          },
        });
        if (notif) {
          this.notifications.set(notif.id, notif);
          return notif;
        }
      } catch (err) {
        console.warn("Prisma createNotification fallback to memory:", err.message);
      }
    }

    const newNotif = {
      id: "notif_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7),
      userId,
      actorId,
      type: type || "SYSTEM",
      title,
      message: message || "",
      data: serializedData,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    this.notifications.set(newNotif.id, newNotif);
    return newNotif;
  }

  async getNotifications(userId) {
    if (!userId) return [];

    if (prisma) {
      try {
        const dbNotifs = await prisma.notification.findMany({
          where: { userId },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        if (dbNotifs && dbNotifs.length > 0) {
          return dbNotifs;
        }
      } catch (err) {
        console.warn("Prisma getNotifications fallback to memory:", err.message);
      }
    }

    const notifs = Array.from(this.notifications.values())
      .filter((n) => n.userId === userId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return notifs;
  }

  async markRead(id, userId) {
    if (!id) return false;

    if (prisma) {
      try {
        await prisma.notification.updateMany({
          where: { id, userId },
          data: { isRead: true },
        });
      } catch (err) {
        console.warn("Prisma markRead fallback to memory:", err.message);
      }
    }

    const n = this.notifications.get(id);
    if (n && n.userId === userId) {
      n.isRead = true;
      this.notifications.set(id, n);
    }
    return true;
  }

  async markAllRead(userId) {
    if (!userId) return false;

    if (prisma) {
      try {
        await prisma.notification.updateMany({
          where: { userId, isRead: false },
          data: { isRead: true },
        });
      } catch (err) {
        console.warn("Prisma markAllRead fallback to memory:", err.message);
      }
    }

    for (const n of this.notifications.values()) {
      if (n.userId === userId) {
        n.isRead = true;
      }
    }
    return true;
  }

  async getUnreadCount(userId) {
    if (!userId) return 0;

    if (prisma) {
      try {
        const count = await prisma.notification.count({
          where: { userId, isRead: false },
        });
        return count;
      } catch (err) {
        // Fallback
      }
    }

    let count = 0;
    for (const n of this.notifications.values()) {
      if (n.userId === userId && !n.isRead) count++;
    }
    return count;
  }
}

module.exports = new NotificationsModel();
