"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Send,
  Loader2,
  Sparkles,
  MessageSquare,
  User,
  Check,
  CheckCheck,
} from "lucide-react";
import {
  DirectMessageItem,
  fetchDirectMessages,
  sendDirectMessage,
} from "@/lib/api";

interface DirectMessageDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  peer: {
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    stream?: string;
    collegeName?: string;
  } | null;
  token?: string | null;
  currentUserId?: string | null;
}

export default function DirectMessageDrawer({
  isOpen,
  onClose,
  peer,
  token,
  currentUserId,
}: DirectMessageDrawerProps) {
  const [messages, setMessages] = useState<DirectMessageItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [inputText, setInputText] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const loadMessages = async () => {
    if (!peer?.id) return;
    try {
      const res = await fetchDirectMessages(peer.id, token);
      if (res.success && res.data) {
        setMessages(res.data);
      }
    } catch {
      // Ignore
    }
  };

  useEffect(() => {
    if (!isOpen || !peer?.id) {
      setMessages([]);
      return;
    }

    setLoading(true);
    loadMessages().finally(() => {
      setLoading(false);
      setTimeout(scrollToBottom, 100);
    });

    // Poll every 5s while open
    const interval = setInterval(loadMessages, 5000);
    return () => clearInterval(interval);
  }, [isOpen, peer?.id, token]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputText).trim();
    if (!text || !peer?.id || sending) return;

    setSending(true);
    setInputText("");

    // Optimistic message
    const optimisticMsg: DirectMessageItem = {
      id: "opt_" + Date.now(),
      senderId: currentUserId || "me",
      receiverId: peer.id,
      content: text,
      isRead: false,
      createdAt: new Date().toISOString(),
    };
    setMessages((prev) => [...prev, optimisticMsg]);

    try {
      const res = await sendDirectMessage(peer.id, text, token);
      if (res.success && res.data) {
        setMessages((prev) =>
          prev.map((m) => (m.id === optimisticMsg.id ? res.data! : m))
        );
      }
    } catch {
      // Ignore
    } finally {
      setSending(false);
      setTimeout(scrollToBottom, 50);
    }
  };

  if (!isOpen || !peer) return null;

  const quickPrompts = [
    "Hey! Great work on the leaderboard 🚀",
    "Want to collaborate on upcoming coding contests?",
    "Could you share tips on LeetCode questions?",
  ];

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm">
        <motion.div
          initial={{ x: "100%", opacity: 0.8 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0.8 }}
          transition={{ type: "spring", damping: 25, stiffness: 220 }}
          className="w-full max-w-md h-full bg-[#0b0f19] border-l border-white/10 shadow-2xl flex flex-col text-white"
        >
          {/* Header */}
          <div className="p-4 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  peer.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(peer.email || peer.name || "peer")}`
                }
                alt={peer.name}
                className="w-10 h-10 rounded-full border border-[#D4AF37]/30 bg-black/50 object-cover"
              />
              <div>
                <div className="font-semibold text-sm text-white flex items-center gap-1.5">
                  <span>{peer.name}</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" title="Online" />
                </div>
                <div className="text-[11px] text-gray-400 font-mono">
                  {peer.stream || "Peer"} • {peer.collegeName || "Campus"}
                </div>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Close chat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3 font-sans text-xs">
            {loading ? (
              <div className="flex items-center justify-center h-full gap-2 text-amber-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="font-mono">Loading conversation...</span>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center p-6 text-gray-400 space-y-3">
                <div className="p-3 rounded-full bg-amber-500/10 border border-amber-500/20 text-[#D4AF37]">
                  <MessageSquare className="w-6 h-6" />
                </div>
                <p className="font-medium text-white">Start a conversation with {peer.name}</p>
                <p className="text-[11px] text-gray-400 max-w-xs">
                  Connect, share problem-solving strategies, or collaborate on hackathons and contests.
                </p>

                {/* Quick Prompts */}
                <div className="w-full pt-4 space-y-2 text-left">
                  <span className="text-[10px] font-mono text-gray-500 uppercase tracking-wider">
                    Quick suggestions:
                  </span>
                  {quickPrompts.map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleSend(prompt)}
                      className="w-full p-2.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-left text-[11px] text-gray-300 transition-colors flex items-center justify-between cursor-pointer"
                    >
                      <span>{prompt}</span>
                      <Sparkles className="w-3.5 h-3.5 text-amber-400 opacity-60 flex-shrink-0 ml-2" />
                    </button>
                  ))}
                </div>
              </div>
            ) : (
              messages.map((msg) => {
                const isMe = msg.senderId === currentUserId;
                const formattedTime = new Date(msg.createdAt).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                });

                return (
                  <div
                    key={msg.id}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[80%] px-3.5 py-2.5 rounded-2xl ${
                        isMe
                          ? "bg-gradient-to-r from-amber-600 to-amber-500 text-black font-medium rounded-br-none shadow-md"
                          : "bg-white/[0.07] border border-white/10 text-white rounded-bl-none"
                      }`}
                    >
                      <p className="leading-relaxed whitespace-pre-wrap break-words">{msg.content}</p>
                    </div>
                    <div className="flex items-center gap-1 mt-1 px-1 text-[10px] text-gray-500 font-mono">
                      <span>{formattedTime}</span>
                      {isMe && (
                        <span>
                          {msg.isRead ? (
                            <CheckCheck className="w-3 h-3 text-cyan-400 inline" />
                          ) : (
                            <Check className="w-3 h-3 text-gray-500 inline" />
                          )}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-3 border-t border-white/10 bg-white/[0.02]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputText}
                onChange={(e) => setInputText(e.target.value)}
                placeholder={`Message ${peer.name}...`}
                className="flex-1 px-3.5 py-2.5 bg-black/40 border border-white/10 rounded-xl text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400 transition-colors"
                disabled={sending}
              />
              <button
                type="submit"
                disabled={!inputText.trim() || sending}
                className="p-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-bold disabled:opacity-40 hover:shadow-lg hover:shadow-amber-500/20 transition-all cursor-pointer flex-shrink-0"
                aria-label="Send message"
              >
                {sending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
