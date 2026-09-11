"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  Users,
  UserCheck,
  Clock,
  MessageSquare,
  ExternalLink,
  Check,
  Loader2,
  AlertCircle,
} from "lucide-react";
import {
  fetchConnections,
  respondConnectionRequest,
  removeConnection,
} from "@/lib/api";

interface ConnectionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  token?: string | null;
  onOpenProfile: (studentId: string, initialData?: any) => void;
  onOpenMessage: (peer: any) => void;
}

export default function ConnectionsModal({
  isOpen,
  onClose,
  token,
  onOpenProfile,
  onOpenMessage,
}: ConnectionsModalProps) {
  const [activeTab, setActiveTab] = useState<"connections" | "invitations">("connections");
  const [connections, setConnections] = useState<any[]>([]);
  const [pendingReceived, setPendingReceived] = useState<any[]>([]);
  const [pendingSent, setPendingSent] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState<string | null>(null);

  const loadData = async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetchConnections(token);
      if (res.success) {
        setConnections(res.connections || []);
        setPendingReceived(res.pendingReceived || []);
        setPendingSent(res.pendingSent || []);
      }
    } catch {
      // Ignore
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen, token]);

  if (!isOpen) return null;

  const handleRespond = async (requestId: string, action: "accept" | "decline") => {
    setActionLoadingId(requestId);
    try {
      await respondConnectionRequest(requestId, action, token);
      await loadData();
    } catch {
      // Ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleRemove = async (peerId: string) => {
    if (!confirm("Are you sure you want to remove this connection?")) return;
    setActionLoadingId(peerId);
    try {
      await removeConnection(peerId, token);
      await loadData();
    } catch {
      // Ignore
    } finally {
      setActionLoadingId(null);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="relative w-full max-w-xl bg-[#0c101d] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white my-8 flex flex-col max-h-[85vh]"
        >
          {/* Header */}
          <div className="p-4 sm:p-6 border-b border-white/10 flex items-center justify-between bg-white/[0.02]">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-[#D4AF37]">
                <Users className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white tracking-tight">Campus Network</h2>
                <p className="text-xs text-gray-400">
                  Manage your student connections, peer network, and invitations
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex items-center border-b border-white/10 px-6 text-sm bg-white/[0.01]">
            <button
              onClick={() => setActiveTab("connections")}
              className={`py-3 font-medium transition-colors relative cursor-pointer mr-6 ${
                activeTab === "connections"
                  ? "text-amber-400 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>Connections ({connections.length})</span>
              {activeTab === "connections" && (
                <motion.div layoutId="connTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>

            <button
              onClick={() => setActiveTab("invitations")}
              className={`py-3 font-medium transition-colors relative cursor-pointer ${
                activeTab === "invitations"
                  ? "text-amber-400 font-semibold"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <span>
                Invitations ({pendingReceived.length + pendingSent.length})
              </span>
              {activeTab === "invitations" && (
                <motion.div layoutId="connTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
              )}
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loading ? (
              <div className="flex items-center justify-center py-12 gap-2 text-amber-400">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs font-mono">Loading network data...</span>
              </div>
            ) : activeTab === "connections" ? (
              connections.length === 0 ? (
                <div className="text-center py-12 text-gray-400 space-y-2">
                  <UserCheck className="w-8 h-8 mx-auto text-gray-600" />
                  <p className="text-sm font-medium">No connections yet</p>
                  <p className="text-xs text-gray-500 max-w-sm mx-auto">
                    Connect with your classmates and peers from the Student Leaderboard or Search bar to expand your network.
                  </p>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-3">
                  {connections.map((c) => {
                    const peer = c.peer || {};
                    return (
                      <div
                        key={c.connectionId}
                        className="p-3.5 rounded-xl bg-white/[0.03] hover:bg-white/[0.05] border border-white/10 flex items-center justify-between gap-3 transition-colors"
                      >
                        <div
                          className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                          onClick={() => {
                            onClose();
                            onOpenProfile(peer.id, peer);
                          }}
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={
                              peer.avatar ||
                              `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(peer.email || "peer")}`
                            }
                            alt={peer.name}
                            className="w-10 h-10 rounded-full border border-white/10 bg-black/40 object-cover flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <h4 className="text-xs font-semibold text-white truncate hover:text-amber-400 transition-colors">
                              {peer.name}
                            </h4>
                            <p className="text-[11px] text-gray-400 truncate">
                              {peer.stream || "Student"} • {peer.collegeName || "Campus"}
                            </p>
                            {peer.overallScore !== undefined && (
                              <span className="text-[10px] text-amber-400 font-mono">
                                {peer.overallScore} DevScore pts
                              </span>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <button
                            onClick={() => {
                              onClose();
                              onOpenMessage(peer);
                            }}
                            className="px-3 py-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 text-xs font-medium transition-colors flex items-center gap-1.5 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>Message</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )
            ) : (
              <div className="space-y-6">
                {/* Pending Received */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
                    Received Requests ({pendingReceived.length})
                  </h3>
                  {pendingReceived.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No incoming connection requests.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingReceived.map((req) => (
                        <div
                          key={req.requestId}
                          className="p-3.5 rounded-xl bg-amber-500/[0.04] border border-amber-500/20 flex items-center justify-between gap-3"
                        >
                          <div
                            className="flex items-center gap-3 cursor-pointer flex-1 min-w-0"
                            onClick={() => {
                              onClose();
                              onOpenProfile(req.peer?.id, req.peer);
                            }}
                          >
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                req.peer?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.peer?.email || "peer")}`
                              }
                              alt={req.peer?.name}
                              className="w-10 h-10 rounded-full border border-white/10 bg-black/40 object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">
                                {req.peer?.name}
                              </h4>
                              <p className="text-[11px] text-gray-400 truncate">
                                {req.peer?.stream || "Student"}
                              </p>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 flex-shrink-0">
                            <button
                              onClick={() => handleRespond(req.requestId, "accept")}
                              disabled={actionLoadingId === req.requestId}
                              className="px-3 py-1.5 rounded-lg bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black text-xs font-bold hover:opacity-90 transition-opacity cursor-pointer flex items-center gap-1"
                            >
                              {actionLoadingId === req.requestId ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <Check className="w-3.5 h-3.5" />
                              )}
                              <span>Accept</span>
                            </button>

                            <button
                              onClick={() => handleRespond(req.requestId, "decline")}
                              disabled={actionLoadingId === req.requestId}
                              className="px-2.5 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-gray-300 text-xs transition-colors cursor-pointer"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Pending Sent */}
                <div>
                  <h3 className="text-xs font-mono uppercase tracking-wider text-gray-400 mb-3">
                    Sent Requests ({pendingSent.length})
                  </h3>
                  {pendingSent.length === 0 ? (
                    <p className="text-xs text-gray-500 italic">No pending sent requests.</p>
                  ) : (
                    <div className="space-y-2.5">
                      {pendingSent.map((req) => (
                        <div
                          key={req.requestId}
                          className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 flex items-center justify-between gap-3"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={
                                req.peer?.avatar ||
                                `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(req.peer?.email || "peer")}`
                              }
                              alt={req.peer?.name}
                              className="w-9 h-9 rounded-full border border-white/10 bg-black/40 object-cover flex-shrink-0"
                            />
                            <div className="min-w-0">
                              <h4 className="text-xs font-semibold text-white truncate">
                                {req.peer?.name}
                              </h4>
                              <p className="text-[11px] text-gray-400 truncate">
                                {req.peer?.stream || "Student"}
                              </p>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[11px] font-mono text-gray-400 flex items-center gap-1 flex-shrink-0">
                            <Clock className="w-3 h-3 text-amber-400" />
                            <span>Pending</span>
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
