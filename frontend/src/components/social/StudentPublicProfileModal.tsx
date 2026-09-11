"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  X,
  ExternalLink,
  MessageSquare,
  UserPlus,
  UserCheck,
  Clock,
  Award,
  Trophy,
  Code2,
  BookOpen,
  Sparkles,
  Building,
  GraduationCap,
  Flame,
  CheckCircle2,
  ShieldCheck,
  Star,
  Github,
  Loader2,
} from "lucide-react";
import {
  PublicStudentProfile,
  fetchPublicStudentProfile,
  sendConnectionRequest,
  respondConnectionRequest,
  getConnectionStatus,
  LeaderboardStudent,
} from "@/lib/api";

interface StudentPublicProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  studentId: string | null;
  initialStudent?: LeaderboardStudent | null;
  token?: string | null;
  currentUserId?: string | null;
  onOpenMessage?: (peer: { id: string; name: string; avatar?: string; email: string; stream?: string; collegeName?: string }) => void;
  onConnectionChange?: () => void;
}

export default function StudentPublicProfileModal({
  isOpen,
  onClose,
  studentId,
  initialStudent,
  token,
  currentUserId,
  onOpenMessage,
  onConnectionChange,
}: StudentPublicProfileModalProps) {
  const [profile, setProfile] = useState<PublicStudentProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<"about" | "coding" | "academics">("coding");
  const [connectLoading, setConnectLoading] = useState(false);
  const [connectionStatus, setConnectionStatus] = useState<"SELF" | "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED">("NONE");

  useEffect(() => {
    if (!isOpen || !studentId) {
      setProfile(null);
      return;
    }

    let isMounted = true;
    const loadProfile = async () => {
      setLoading(true);
      try {
        const res = await fetchPublicStudentProfile(studentId, token);
        if (isMounted && res.success && res.profile) {
          setProfile(res.profile);
          setConnectionStatus(res.profile.connectionStatus || "NONE");
        } else if (isMounted && initialStudent) {
          // Fallback to initial student data
          setProfile({
            id: initialStudent.id,
            name: initialStudent.name,
            email: initialStudent.email,
            avatar: initialStudent.avatar,
            rollNo: initialStudent.rollNo,
            collegeName: initialStudent.collegeName || "Vishnu Educational Society",
            stream: initialStudent.stream,
            karmaPoints: initialStudent.karmaPoints || 0,
            overallScore: initialStudent.overallScore || 0,
            rank: initialStudent.rank,
            tier: (initialStudent.overallScore || 0) >= 1000 ? "Master" : (initialStudent.overallScore || 0) >= 800 ? "Expert" : "Novice",
            tierColor: (initialStudent.overallScore || 0) >= 1000 ? "#f59e0b" : "#38bdf8",
            handles: {
              leetcode: initialStudent.leetcodeHandle,
              codeforces: initialStudent.codeforcesHandle,
              codechef: initialStudent.codechefHandle,
              hackerrank: initialStudent.hackerrankHandle,
              github: initialStudent.githubHandle,
            },
            platforms: {
              leetcode: { connected: Boolean(initialStudent.leetcodeHandle), handle: initialStudent.leetcodeHandle },
              codeforces: { connected: Boolean(initialStudent.codeforcesHandle), handle: initialStudent.codeforcesHandle },
              codechef: { connected: Boolean(initialStudent.codechefHandle), handle: initialStudent.codechefHandle },
              hackerrank: { connected: Boolean(initialStudent.hackerrankHandle), handle: initialStudent.hackerrankHandle },
              github: { connected: Boolean(initialStudent.githubHandle), handle: initialStudent.githubHandle },
            },
            summary: {
              problemsSolved: 0,
              overallScore: initialStudent.overallScore || 0,
            },
          });
          // Check connection status
          const statusRes = await getConnectionStatus(studentId, token);
          if (isMounted) setConnectionStatus(statusRes.status);
        }
      } catch {
        // Ignore
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadProfile();
    return () => {
      isMounted = false;
    };
  }, [isOpen, studentId, token, initialStudent]);

  if (!isOpen) return null;

  const isSelf = currentUserId === studentId || profile?.id === currentUserId || connectionStatus === "SELF";

  const handleConnect = async () => {
    if (!studentId || connectLoading || isSelf) return;
    setConnectLoading(true);
    try {
      if (connectionStatus === "PENDING_RECEIVED") {
        // Accept request
        // In this case, we can trigger connection response if requestId exists, or re-send to auto-accept
        await sendConnectionRequest(studentId, token);
        setConnectionStatus("ACCEPTED");
      } else if (connectionStatus === "NONE") {
        await sendConnectionRequest(studentId, token);
        setConnectionStatus("PENDING_SENT");
      }
      onConnectionChange?.();
    } catch {
      // Ignore
    } finally {
      setConnectLoading(false);
    }
  };

  const handleMessageClick = () => {
    if (!profile) return;
    onClose();
    onOpenMessage?.({
      id: profile.id,
      name: profile.name,
      avatar: profile.avatar,
      email: profile.email,
      stream: profile.stream,
      collegeName: profile.collegeName,
    });
  };

  const displayName = profile?.name || initialStudent?.name || "Student Profile";
  const displayAvatar =
    profile?.avatar ||
    initialStudent?.avatar ||
    `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(profile?.email || studentId || "user")}`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 overflow-y-auto bg-black/80 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-2xl bg-[#0d121f] border border-white/10 rounded-2xl shadow-2xl overflow-hidden text-white my-8"
        >
          {/* Close Button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 rounded-full bg-black/60 hover:bg-black/80 text-gray-300 hover:text-white border border-white/10 transition-colors cursor-pointer"
            aria-label="Close profile"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LinkedIn-style Cover Banner */}
          <div className="relative h-36 sm:h-44 w-full bg-gradient-to-r from-amber-950/70 via-[#0f172a] to-cyan-950/70 overflow-hidden border-b border-white/10">
            {/* Tech Grid Pattern */}
            <div
              className="absolute inset-0 opacity-20"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 1px 1px, rgba(212,175,55,0.4) 1px, transparent 0)",
                backgroundSize: "20px 20px",
              }}
            />
            {/* Campus Branding in Banner */}
            <div className="absolute top-4 left-6 flex items-center gap-2 px-3 py-1 rounded-full bg-black/40 backdrop-blur-sm border border-white/10 text-xs font-mono text-amber-300/90">
              <Building className="w-3.5 h-3.5" />
              <span>{profile?.collegeName || initialStudent?.collegeName || "Vishnu Educational Society"}</span>
            </div>

            {/* DevScore Rank Badge */}
            {(profile?.rank || initialStudent?.rank) && (
              <div className="absolute bottom-3 right-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-sm border border-[#D4AF37]/30 text-xs font-mono flex items-center gap-1.5 text-amber-300">
                <Trophy className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Campus Rank #{profile?.rank || initialStudent?.rank}</span>
              </div>
            )}
          </div>

          {/* Profile Header (LinkedIn Style) */}
          <div className="px-6 sm:px-8 pb-6 relative">
            {/* Avatar overlapping banner */}
            <div className="relative -mt-16 sm:-mt-20 mb-4 flex items-end justify-between flex-wrap gap-4">
              <div className="relative">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={displayAvatar}
                  alt={displayName}
                  className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl border-4 border-[#0d121f] bg-black/60 object-cover shadow-xl"
                />
                <div
                  className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-emerald-500 border-2 border-[#0d121f] flex items-center justify-center"
                  title="Verified Student"
                >
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                </div>
              </div>

              {/* Action Buttons: Connect & Message */}
              <div className="flex items-center gap-2.5 pt-2">
                {!isSelf ? (
                  <>
                    <button
                      onClick={handleConnect}
                      disabled={connectLoading || connectionStatus === "ACCEPTED"}
                      className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                        connectionStatus === "ACCEPTED"
                          ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 cursor-default"
                          : connectionStatus === "PENDING_SENT"
                          ? "bg-amber-500/20 text-amber-300 border border-amber-500/30"
                          : connectionStatus === "PENDING_RECEIVED"
                          ? "bg-gradient-to-r from-emerald-500 to-teal-500 text-black font-bold shadow-lg shadow-emerald-500/20"
                          : "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black font-bold hover:shadow-lg hover:shadow-amber-500/20"
                      }`}
                    >
                      {connectLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : connectionStatus === "ACCEPTED" ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Connected</span>
                        </>
                      ) : connectionStatus === "PENDING_SENT" ? (
                        <>
                          <Clock className="w-4 h-4" />
                          <span>Request Pending</span>
                        </>
                      ) : connectionStatus === "PENDING_RECEIVED" ? (
                        <>
                          <UserCheck className="w-4 h-4" />
                          <span>Accept Connection</span>
                        </>
                      ) : (
                        <>
                          <UserPlus className="w-4 h-4" />
                          <span>Connect</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={handleMessageClick}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-white/10 hover:bg-white/15 text-white text-xs font-semibold border border-white/10 transition-all cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4 text-cyan-400" />
                      <span>Message</span>
                    </button>
                  </>
                ) : (
                  <span className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs font-mono text-gray-400">
                    Your Profile
                  </span>
                )}
              </div>
            </div>

            {/* Name, Headline & Metadata */}
            <div className="space-y-1.5">
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl font-bold text-white tracking-tight">{displayName}</h1>
                {profile?.rollNo && (
                  <span className="px-2 py-0.5 rounded bg-white/10 border border-white/10 text-[11px] font-mono text-gray-300">
                    {profile.rollNo}
                  </span>
                )}
                {profile?.tier && (
                  <span
                    className="px-2 py-0.5 rounded-full text-[10px] font-mono uppercase font-bold border"
                    style={{
                      backgroundColor: `${profile.tierColor || "#D4AF37"}20`,
                      color: profile.tierColor || "#D4AF37",
                      borderColor: `${profile.tierColor || "#D4AF37"}40`,
                    }}
                  >
                    {profile.tier}
                  </span>
                )}
              </div>

              {/* Student Headline */}
              <p className="text-sm text-gray-300 font-medium">
                {profile?.stream || initialStudent?.stream || "Computer Science"} • Class of{" "}
                {profile?.graduationYear || "2026"}
              </p>

              <p className="text-xs text-gray-400 flex items-center gap-2">
                <span>{profile?.collegeName || initialStudent?.collegeName || "Vishnu Educational Society"}</span>
                <span>•</span>
                <span className="text-amber-400 font-mono font-semibold">
                  {profile?.overallScore ?? initialStudent?.overallScore ?? 0} DevScore pts
                </span>
                <span>•</span>
                <span className="text-purple-400 font-mono">
                  {profile?.karmaPoints ?? initialStudent?.karmaPoints ?? 0} Karma
                </span>
              </p>

              {/* Bio snippet */}
              {profile?.bio && (
                <p className="text-xs text-gray-400 pt-1 italic">&ldquo;{profile.bio}&rdquo;</p>
              )}
            </div>

            {/* Platform Badges Link Row */}
            <div className="mt-4 pt-3 border-t border-white/10 flex items-center gap-2 flex-wrap">
              <span className="text-[11px] font-mono text-gray-400 mr-1">Profiles:</span>
              {profile?.handles.leetcode && (
                <a
                  href={`https://leetcode.com/u/${profile.handles.leetcode}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 text-xs font-mono border border-amber-500/20 transition flex items-center gap-1"
                >
                  <span>LC @{profile.handles.leetcode}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {profile?.handles.codechef && (
                <a
                  href={`https://www.codechef.com/users/${profile.handles.codechef}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-amber-700/15 hover:bg-amber-700/25 text-amber-200 text-xs font-mono border border-amber-700/30 transition flex items-center gap-1"
                >
                  <span>CC @{profile.handles.codechef}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {profile?.handles.codeforces && (
                <a
                  href={`https://codeforces.com/profile/${profile.handles.codeforces}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-red-500/10 hover:bg-red-500/20 text-red-300 text-xs font-mono border border-red-500/20 transition flex items-center gap-1"
                >
                  <span>CF @{profile.handles.codeforces}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {profile?.handles.hackerrank && (
                <a
                  href={`https://www.hackerrank.com/profile/${profile.handles.hackerrank}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-mono border border-emerald-500/20 transition flex items-center gap-1"
                >
                  <span>HR @{profile.handles.hackerrank}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {profile?.handles.github && (
                <a
                  href={`https://github.com/${profile.handles.github}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 text-xs font-mono border border-white/15 transition flex items-center gap-1"
                >
                  <Github className="w-3 h-3" />
                  <span>@{profile.handles.github}</span>
                  <ExternalLink className="w-3 h-3 opacity-70" />
                </a>
              )}
              {!profile?.handles.leetcode &&
                !profile?.handles.codechef &&
                !profile?.handles.codeforces &&
                !profile?.handles.github && (
                  <span className="text-xs text-gray-500 italic">No external platforms linked yet.</span>
                )}
            </div>

            {/* Navigation Tabs */}
            <div className="mt-5 border-b border-white/10 flex items-center gap-6 text-sm">
              <button
                onClick={() => setActiveTab("coding")}
                className={`pb-2.5 font-medium transition-colors relative cursor-pointer ${
                  activeTab === "coding" ? "text-amber-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Coding Analytics</span>
                {activeTab === "coding" && (
                  <motion.div layoutId="modalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("about")}
                className={`pb-2.5 font-medium transition-colors relative cursor-pointer ${
                  activeTab === "about" ? "text-amber-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>About & Skills</span>
                {activeTab === "about" && (
                  <motion.div layoutId="modalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>

              <button
                onClick={() => setActiveTab("academics")}
                className={`pb-2.5 font-medium transition-colors relative cursor-pointer ${
                  activeTab === "academics" ? "text-amber-400 font-semibold" : "text-gray-400 hover:text-white"
                }`}
              >
                <span>Academics & Labs</span>
                {activeTab === "academics" && (
                  <motion.div layoutId="modalTab" className="absolute bottom-0 left-0 right-0 h-0.5 bg-amber-400" />
                )}
              </button>
            </div>

            {/* Tab Contents */}
            <div className="mt-4 min-h-[160px]">
              {loading ? (
                <div className="flex items-center justify-center py-10 gap-3 text-amber-400">
                  <Loader2 className="w-6 h-6 animate-spin" />
                  <span className="text-xs font-mono">Loading profile data...</span>
                </div>
              ) : activeTab === "coding" ? (
                <div className="space-y-4">
                  {/* Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Trophy className="w-3.5 h-3.5 text-amber-400" />
                        <span>DevScore</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        {profile?.overallScore || 0}
                      </div>
                      <div className="text-[10px] text-amber-400/80 font-mono mt-0.5">
                        Tier: {profile?.tier || "Novice"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-yellow-400" />
                        <span>LeetCode</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        {profile?.platforms?.leetcode?.totalSolved ?? (profile?.handles.leetcode ? "Synced" : "—")}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {profile?.platforms?.leetcode?.ranking ? `#${profile.platforms.leetcode.ranking}` : "Problems Solved"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 text-amber-600" />
                        <span>CodeChef</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        {profile?.platforms?.codechef?.rating ?? (profile?.handles.codechef ? "Active" : "—")}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                        {profile?.platforms?.codechef?.stars ? `${profile.platforms.codechef.stars} Stars` : "Rating"}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-[11px] font-mono text-gray-400 flex items-center gap-1">
                        <Github className="w-3.5 h-3.5 text-gray-300" />
                        <span>GitHub</span>
                      </div>
                      <div className="text-lg font-bold text-white font-mono mt-1">
                        {profile?.platforms?.github?.repos ?? (profile?.handles.github ? "Active" : "—")}
                      </div>
                      <div className="text-[10px] text-gray-400 font-mono mt-0.5">Public Repositories</div>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-amber-200/90 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                      <span>Live statistics synchronized from competitive coding platforms.</span>
                    </div>
                    <span className="font-mono text-[11px] text-amber-300/80">
                      Verified by Cryptic-To-Clear
                    </span>
                  </div>
                </div>
              ) : activeTab === "about" ? (
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h3 className="font-semibold text-white text-sm">Professional Summary</h3>
                    <p className="text-gray-300 leading-relaxed">
                      {profile?.bio ||
                        `${displayName} is a dedicated student pursuing ${profile?.stream || "Computer Science"} at ${
                          profile?.collegeName || "Vishnu Educational Society"
                        }. Active participant in competitive programming and peer doubt-resolution.`}
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10 space-y-2">
                    <h3 className="font-semibold text-white text-sm">Technical Skills & Focus</h3>
                    <div className="flex items-center gap-2 flex-wrap pt-1">
                      {profile?.primaryLanguage && (
                        <span className="px-2.5 py-1 rounded-lg bg-cyan-500/10 text-cyan-300 border border-cyan-500/20 font-mono">
                          Primary: {profile.primaryLanguage}
                        </span>
                      )}
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-gray-300">
                        Data Structures & Algorithms
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 font-mono text-gray-300">
                        Competitive Coding
                      </span>
                      <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/20 font-mono">
                        Karma Points: {profile?.karmaPoints || 0}
                      </span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-3 text-xs text-gray-300">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-gray-400 font-mono text-[11px]">Academic Institution</div>
                      <div className="text-white font-semibold mt-1">
                        {profile?.collegeName || initialStudent?.collegeName || "Vishnu Educational Society"}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-gray-400 font-mono text-[11px]">Department / Stream</div>
                      <div className="text-white font-semibold mt-1">
                        {profile?.stream || initialStudent?.stream || "Computer Science"}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-gray-400 font-mono text-[11px]">University Roll Number</div>
                      <div className="text-white font-mono font-semibold mt-1">
                        {profile?.rollNo || initialStudent?.rollNo || "Not specified"}
                      </div>
                    </div>

                    <div className="p-3.5 rounded-xl bg-white/[0.03] border border-white/10">
                      <div className="text-gray-400 font-mono text-[11px]">Class of</div>
                      <div className="text-white font-mono font-semibold mt-1">
                        {profile?.graduationYear || "2026"}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
