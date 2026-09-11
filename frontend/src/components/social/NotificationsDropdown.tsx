"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Bell,
  Check,
  CheckCheck,
  UserPlus,
  MessageSquare,
  Trophy,
  Sparkles,
  Loader2,
  X,
  UserCheck,
} from "lucide-react";
import {
  NotificationItem,
  fetchNotifications,
  markNotificationRead,
  markAllNotificationsRead,
  respondConnectionRequest,
} from "@/lib/api";

interface NotificationsDropdownProps {
  token?: string | null;
  onOpenMessage?: (peer: { id: string; name: string; avatar?: string; email: string }) => void;
  onConnectionAccepted?: () => void;
}

export default function NotificationsDropdown({
  token,
  onOpenMessage,
  onConnectionAccepted,
}: NotificationsDropdownProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [respondingId, setRespondingId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    if (!token) return;
    try {
      const res = await fetchNotifications(token);
      if (res.success && res.data) {
        setNotifications(res.data);
        setUnreadCount(res.unreadCount || 0);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    loadNotifications();
    const interval = setInterval(loadNotifications, 12000);
    return () => clearInterval(interval);
  }, [token]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isOpen]);

  const handleMarkAllRead = async () => {
    try {
      await markAllNotificationsRead(token);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      setUnreadCount(0);
    } catch {
      // Ignore
    }
  };

  const handleItemClick = async (notif: NotificationItem) => {
    if (!notif.isRead) {
      await markNotificationRead(notif.id, token);
      setNotifications((prev) =>
        prev.map((n) => (n.id === notif.id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    }

    if (notif.type === "MESSAGE" && notif.data?.peerId) {
      setIsOpen(false);
      onOpenMessage?.({
        id: notif.data.peerId,
        name: notif.data.senderName || "Peer",
        avatar: notif.data.senderAvatar,
        email: "",
      });
    }
  };

  const handleRespondRequest = async (
    notif: NotificationItem,
    action: "accept" | "decline"
  ) => {
    const reqId = notif.data?.requestId;
    if (!reqId) return;
    setRespondingId(notif.id);
    try {
      await respondConnectionRequest(reqId, action, token);
      await markNotificationRead(notif.id, token);
      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notif.id
            ? {
                ...n,
                isRead: true,
                message:
                  action === "accept"
                    ? "Connection accepted!"
                    : "Connection request declined.",
              }
            : n
        )
      );
      setUnreadCount((c) => Math.max(0, c - 1));
      if (action === "accept") {
        onConnectionAccepted?.();
      }
    } catch {
      // Ignore
    } finally {
      setRespondingId(null);
    }
  };

  return (
    <div className="relative" ref={dropdownRef}>
      {/* Bell Button */}
      <button
        onClick={() => {
          setIsOpen((prev) => !prev);
          if (!isOpen) loadNotifications();
        }}
        className="relative p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
        aria-label="Notifications"
      >
        <Bell className="w-4 h-4 text-amber-300" />
        {unreadCount > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-gradient-to-r from-red-500 to-amber-500 text-black font-extrabold text-[10px] rounded-full flex items-center justify-center shadow-lg animate-pulse">
            {unreadCount > 9 ? "9+" : unreadCount}
          </span>
        )}
      </button>

      {/* Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.96 }}
            transition={{ duration: 0.15 }}
            className="absolute right-0 mt-2 w-80 sm:w-96 bg-[#0c101d] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden text-white"
          >
            {/* Header */}
            <div className="p-3.5 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
              <div className="flex items-center gap-2">
                <span className="font-semibold text-sm text-white">Notifications</span>
                {unreadCount > 0 && (
                  <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {unreadCount} new
                  </span>
                )}
              </div>

              {unreadCount > 0 && (
                <button
                  onClick={handleMarkAllRead}
                  className="text-[11px] font-mono text-amber-400 hover:text-amber-300 transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <CheckCheck className="w-3.5 h-3.5" />
                  <span>Mark all read</span>
                </button>
              )}
            </div>

            {/* List */}
            <div className="max-h-[380px] overflow-y-auto divide-y divide-white/5 font-sans">
              {notifications.length === 0 ? (
                <div className="p-8 text-center text-gray-400 space-y-2">
                  <Bell className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-xs font-medium">No notifications yet</p>
                  <p className="text-[11px] text-gray-500">
                    You will be notified about connection requests, direct messages, and leaderboard milestones.
                  </p>
                </div>
              ) : (
                notifications.map((notif) => {
                  const isConnRequest = notif.type === "CONNECTION_REQUEST";
                  const isMessage = notif.type === "MESSAGE";
                  const isAccepted = notif.type === "CONNECTION_ACCEPTED";

                  return (
                    <div
                      key={notif.id}
                      onClick={() => handleItemClick(notif)}
                      className={`p-3.5 transition-colors cursor-pointer ${
                        !notif.isRead
                          ? "bg-amber-500/[0.05] hover:bg-amber-500/[0.08]"
                          : "hover:bg-white/[0.03]"
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        {/* Icon / Avatar */}
                        <div className="flex-shrink-0 mt-0.5">
                          {isConnRequest ? (
                            <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                              <UserPlus className="w-4 h-4" />
                            </div>
                          ) : isMessage ? (
                            <div className="w-8 h-8 rounded-full bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 flex items-center justify-center">
                              <MessageSquare className="w-4 h-4" />
                            </div>
                          ) : isAccepted ? (
                            <div className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <UserCheck className="w-4 h-4" />
                            </div>
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 flex items-center justify-center">
                              <Trophy className="w-4 h-4" />
                            </div>
                          )}
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-1">
                            <h4 className="text-xs font-semibold text-white truncate">
                              {notif.title}
                            </h4>
                            <span className="text-[10px] text-gray-500 font-mono flex-shrink-0">
                              {new Date(notif.createdAt).toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                          </div>

                          <p className="text-[11px] text-gray-300 mt-0.5 line-clamp-2">
                            {notif.message}
                          </p>

                          {/* Action Buttons for Connection Requests */}
                          {isConnRequest && notif.data?.requestId && !notif.isRead && (
                            <div className="mt-2.5 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                              <button
                                onClick={() => handleRespondRequest(notif, "accept")}
                                disabled={respondingId === notif.id}
                                className="px-3 py-1 rounded-lg bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black text-[11px] font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                              >
                                {respondingId === notif.id ? (
                                  <Loader2 className="w-3 h-3 animate-spin" />
                                ) : (
                                  <Check className="w-3 h-3" />
                                )}
                                <span>Accept</span>
                              </button>

                              <button
                                onClick={() => handleRespondRequest(notif, "decline")}
                                disabled={respondingId === notif.id}
                                className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 text-[11px] transition-colors cursor-pointer flex items-center gap-1"
                              >
                                <X className="w-3 h-3" />
                                <span>Decline</span>
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
