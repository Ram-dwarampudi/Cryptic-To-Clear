"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  HelpCircle,
  CheckCircle2,
  AlertCircle,
  Code2,
  Sparkles,
  Search,
  Plus,
  X,
  Lock,
  Globe,
  EyeOff,
  ThumbsUp,
  Award,
  ChevronDown,
  ChevronUp,
  User,
  GraduationCap,
  Send,
  Loader2,
  Tag,
  ShieldCheck,
  Flame,
  Check,
  Filter,
} from "lucide-react";
import {
  fetchDoubts,
  createDoubt,
  createDoubtAnswer,
  acceptDoubtAnswer,
  fetchUserDoubtStats,
  DoubtItem,
  UserDoubtStats,
} from "@/lib/community-api";
import { useAuth } from "@/context/AuthContext";
import DirectMessageDrawer from "@/components/social/DirectMessageDrawer";

export default function DoubtsPage() {
  const { user, token, openAuthModal } = useAuth();

  const [doubts, setDoubts] = useState<DoubtItem[]>([]);
  const [stats, setStats] = useState<UserDoubtStats | null>(null);
  const [loading, setLoading] = useState(true);

  // Direct messaging state
  const [activeDmPeer, setActiveDmPeer] = useState<{
    id: string;
    name: string;
    avatar?: string;
    email?: string;
    stream?: string;
    collegeName?: string;
  } | null>(null);
  const [isDmOpen, setIsDmOpen] = useState(false);

  // Filters
  const [activeTab, setActiveTab] = useState<"all" | "open" | "faculty" | "my">("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Modal and Expansion
  const [isAskModalOpen, setIsAskModalOpen] = useState(false);
  const [expandedDoubtId, setExpandedDoubtId] = useState<string | null>(null);

  // Answering
  const [answerContent, setAnswerContent] = useState("");
  const [answerCode, setAnswerCode] = useState("");
  const [submittingAnswer, setSubmittingAnswer] = useState(false);

  const loadDoubts = async () => {
    setLoading(true);
    const params: any = {
      search: searchQuery,
      language: selectedLanguage,
      tag: selectedTag,
      currentUserId: user?.id || "usr_demo_001",
      userRole: user?.role === "faculty" ? "FACULTY" : "STUDENT",
    };

    if (activeTab === "open") {
      params.status = "OPEN";
    } else if (activeTab === "my") {
      params.authorId = user?.id || "usr_demo_001";
    }

    const [doubtsRes, statsRes] = await Promise.all([
      fetchDoubts(params),
      fetchUserDoubtStats(user?.id || "usr_demo_001"),
    ]);

    if (doubtsRes.success) {
      let filtered = doubtsRes.data;
      if (activeTab === "faculty") {
        filtered = filtered.filter((d) => d.hasFacultyEndorsement);
      }
      setDoubts(filtered);

      // Auto-expand the doubt that has answers by default so answers are immediately visible
      if (filtered.length > 0) {
        setExpandedDoubtId((prev) => {
          if (prev && filtered.some((d) => d.id === prev)) return prev;
          const withAnswers = filtered.find((d) => (d.answers && d.answers.length > 0) || (d.answersCount && d.answersCount > 0));
          return withAnswers ? withAnswers.id : filtered[0].id;
        });
      }
    }

    if (statsRes.success && statsRes.data) {
      setStats(statsRes.data);
    }

    setLoading(false);
  };

  useEffect(() => {
    loadDoubts();
  }, [activeTab, selectedLanguage, selectedTag]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadDoubts();
  };

  const handleAnswerSubmit = async (doubtId: string) => {
    if (!answerContent.trim()) return;
    setSubmittingAnswer(true);

    const res = await createDoubtAnswer(doubtId, {
      content: answerContent,
      codeSnippet: answerCode.trim() || undefined,
      authorId: user?.id || "usr_demo_001",
    });

    setSubmittingAnswer(false);

    if (res.success) {
      setAnswerContent("");
      setAnswerCode("");
      loadDoubts();
    }
  };

  const handleAcceptAnswer = async (doubtId: string, answerId: string) => {
    const res = await acceptDoubtAnswer(doubtId, answerId);
    if (res.success) {
      loadDoubts();
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#f7f3eb]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-12 sm:pt-36 sm:pb-14 editor-grid overflow-hidden border-b border-[rgba(212,175,55,0.15)]">
        <div className="blob h-[350px] w-[350px] bg-[var(--syn-function)] -top-32 -left-20 opacity-20" />
        <div className="blob h-[300px] w-[300px] bg-[var(--syn-keyword)] top-10 -right-20 opacity-15" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1 mb-4 border border-[rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <MessageSquare className="h-4 w-4 text-[#E8C97A]" />
                <span className="font-mono text-[11.5px] font-semibold text-[#E8C97A] uppercase tracking-wider">
                  Campus Collaborative Q&amp;A
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
                Campus Doubt Resolution <br />
                <span className="text-gradient">&amp; Knowledge Exchange</span>
              </h1>
              <p className="mt-3 text-base text-[var(--ink-dim)] max-w-2xl leading-relaxed">
                Stuck on a compiler bug, algorithmic recursion, or system design question? Ask openly or anonymously. Get help from fellow students and verified faculty answers.
              </p>
            </div>

            {/* Ask Button */}
            <div className="shrink-0">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal("login");
                  } else {
                    setIsAskModalOpen(true);
                  }
                }}
                className="btn-gold flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#0a0d13] shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Ask a Doubt</span>
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-black/20 text-[#0a0d13] font-mono">
                  +5 Karma
                </span>
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 mx-auto max-w-7xl px-5 sm:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Main Forum Column (8 cols) */}
          <div className="lg:col-span-8 space-y-6">
            {/* Filter Tabs & Search */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 glass p-2 rounded-2xl border border-white/10">
              <div className="flex items-center gap-1 overflow-x-auto scrollbar-none p-1">
                {[
                  { id: "all", label: "All Doubts" },
                  { id: "open", label: "Unresolved" },
                  { id: "faculty", label: "Faculty Verified" },
                  { id: "my", label: "My Doubts" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all shrink-0 cursor-pointer ${
                      activeTab === tab.id
                        ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.35)]"
                        : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-2 pr-2">
                <select
                  value={selectedLanguage}
                  onChange={(e) => setSelectedLanguage(e.target.value)}
                  className="px-3 py-1.5 rounded-xl glass border border-white/10 text-xs font-mono outline-none focus:border-[#D4AF37] bg-[var(--bg)] cursor-pointer"
                >
                  <option value="">Language: All</option>
                  <option value="python">Python</option>
                  <option value="cpp">C++</option>
                  <option value="java">Java</option>
                  <option value="c">C</option>
                  <option value="javascript">JavaScript</option>
                </select>
              </div>
            </div>

            {/* Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-dim)]" />
              <input
                type="text"
                placeholder="Search doubts by title, description, or topic tag..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-sm outline-none focus:border-[#D4AF37] transition-all placeholder:text-[var(--ink-dim)]"
              />
            </form>

            {/* Doubts Feed */}
            {loading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-[#E8C97A] mb-3" />
                <p className="text-sm font-mono text-[var(--ink-dim)]">Loading campus doubts...</p>
              </div>
            ) : doubts.length === 0 ? (
              <div className="text-center py-16 glass rounded-2xl border border-white/5 p-8">
                <HelpCircle className="h-10 w-10 text-[var(--ink-dim)] mx-auto mb-3" />
                <h3 className="font-display text-lg font-bold mb-1">No Doubts Found</h3>
                <p className="text-xs text-[var(--ink-dim)] mb-4">
                  There are no questions matching this criteria. Feel free to post one!
                </p>
                <button
                  onClick={() => {
                    setActiveTab("all");
                    setSearchQuery("");
                    setSelectedLanguage("");
                    setSelectedTag("");
                    loadDoubts();
                  }}
                  className="btn-gold px-4 py-1.5 rounded-lg text-xs font-bold text-black cursor-pointer"
                >
                  Reset Filter
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {doubts.map((doubt) => {
                  const isExpanded = expandedDoubtId === doubt.id;
                  const isAnonymous = doubt.privacy === "ANONYMOUS_PEERS";
                  const isFacultyOnly = doubt.privacy === "FACULTY_ONLY";

                  return (
                    <motion.div
                      key={doubt.id}
                      layout
                      className="glass rounded-2xl border border-white/10 hover:border-[#D4AF37]/40 transition-all overflow-hidden shadow-md"
                    >
                      <div
                        onClick={() => setExpandedDoubtId(isExpanded ? null : doubt.id)}
                        className="p-5 sm:p-6 cursor-pointer space-y-3"
                      >
                        {/* Header Badges */}
                        <div className="flex items-center justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            {doubt.status === "RESOLVED" ? (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                                <CheckCircle2 className="w-3 h-3" /> Solved
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-amber-500/15 text-amber-300 border border-amber-500/30">
                                <AlertCircle className="w-3 h-3" /> Open Doubt
                              </span>
                            )}

                            {doubt.hasFacultyEndorsement && (
                              <span className="flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10.5px] font-mono font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                                <ShieldCheck className="w-3 h-3" /> Faculty Verified
                              </span>
                            )}

                            {isAnonymous ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/5 text-[var(--ink-dim)] border border-white/10">
                                <EyeOff className="w-3 h-3 text-[#E8C97A]" /> Anonymous Peer
                              </span>
                            ) : isFacultyOnly ? (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono bg-rose-500/10 text-rose-300 border border-rose-500/20">
                                <Lock className="w-3 h-3" /> Faculty Only
                              </span>
                            ) : (
                              <span className="flex items-center gap-1 px-2 py-0.5 rounded text-[10.5px] font-mono bg-white/5 text-[var(--ink-dim)] border border-white/10">
                                <Globe className="w-3 h-3 text-cyan-400" /> Public
                              </span>
                            )}

                            {doubt.language && (
                              <span className="px-2 py-0.5 rounded text-[10.5px] font-mono bg-[#D4AF37]/10 text-[#E8C97A] border border-[#D4AF37]/25 uppercase font-semibold">
                                {doubt.language}
                              </span>
                            )}
                          </div>

                          <div className="text-[11px] font-mono text-[var(--ink-dim)]">
                            {new Date(doubt.createdAt).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </div>
                        </div>

                        {/* Author Profile Row */}
                        <div className="flex items-center justify-between gap-3 pt-1 border-t border-white/5 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={doubt.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${doubt.author?.name || "Student"}`}
                              alt={doubt.author?.name || "Author"}
                              className="w-6 h-6 rounded-full border border-[#D4AF37]/40 object-cover"
                            />
                            <div className="flex items-center gap-2 flex-wrap text-xs">
                              <span className="font-semibold text-white">
                                {doubt.author?.name || (isAnonymous ? "Anonymous Student" : "Student")}
                              </span>
                              {doubt.author?.role === "FACULTY" && (
                                <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#E8C97A] font-bold border border-[#D4AF37]/40">
                                  FACULTY
                                </span>
                              )}
                              {doubt.author?.department?.code && (
                                <span className="text-[11px] text-zinc-400 font-mono">
                                  • {doubt.author.department.code} {doubt.author.batchYear ? `'${String(doubt.author.batchYear).slice(-2)}` : ""}
                                </span>
                              )}
                            </div>
                          </div>

                          {/* Message Doubt Author Button (if not me) */}
                          {!isAnonymous && doubt.author?.id && doubt.author.id !== user?.id && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                if (!user) {
                                  openAuthModal("login");
                                  return;
                                }
                                setActiveDmPeer({
                                  id: doubt.author.id,
                                  name: doubt.author.name,
                                  avatar: doubt.author.avatar,
                                  email: (doubt.author as any).email,
                                  stream: (doubt.author as any).stream,
                                  collegeName: (doubt.author as any).collegeName,
                                });
                                setIsDmOpen(true);
                              }}
                              className="flex items-center gap-1.5 text-[11px] font-mono px-2.5 py-1 rounded-lg bg-white/5 hover:bg-[#D4AF37] text-zinc-300 hover:text-black border border-white/10 hover:border-[#D4AF37] transition-all cursor-pointer font-medium"
                              title={`Message ${doubt.author.name}`}
                            >
                              <MessageSquare className="w-3 h-3 text-[#E8C97A]" />
                              <span>Message</span>
                            </button>
                          )}
                        </div>

                        {/* Title & Description */}
                        <div>
                          <h3 className="font-display text-base sm:text-lg font-bold hover:text-[#E8C97A] transition-colors">
                            {doubt.title}
                          </h3>
                          <p className="mt-1 text-xs text-[var(--ink-dim)] line-clamp-2 leading-relaxed">
                            {doubt.description}
                          </p>
                        </div>

                        {/* Code Snippet Preview */}
                        {doubt.codeSnippet && !isExpanded && (
                          <div className="p-2.5 rounded-lg bg-black/40 border border-white/5 font-mono text-[11px] text-[var(--syn-string)] overflow-hidden max-h-20 opacity-80">
                            <pre className="truncate">{doubt.codeSnippet.split("\n")[0]}</pre>
                            {doubt.codeSnippet.split("\n").length > 1 && (
                              <span className="text-[10px] text-[var(--ink-faint)]">
                                ... +{doubt.codeSnippet.split("\n").length - 1} more lines
                              </span>
                            )}
                          </div>
                        )}

                        {/* Footer tags and Author info */}
                        <div className="pt-2 flex items-center justify-between gap-4 flex-wrap text-xs">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            {doubt.tags?.map((tag) => (
                              <span
                                key={tag}
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedTag(selectedTag === tag ? "" : tag);
                                }}
                                className="px-2 py-0.5 rounded-md bg-white/5 hover:bg-white/10 text-[10px] font-mono text-[var(--ink-dim)] transition-colors cursor-pointer border border-white/5"
                              >
                                #{tag}
                              </span>
                            ))}
                          </div>

                          <div className="flex items-center gap-3 text-xs font-mono">
                            <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-[#E8C97A]">
                              <MessageSquare className="w-3.5 h-3.5 text-[#D4AF37]" />
                              <span className="font-semibold">{doubt.answersCount || doubt.answers?.length || 0} answers</span>
                            </div>

                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setExpandedDoubtId(isExpanded ? null : doubt.id);
                              }}
                              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-[#D4AF37]/20 hover:bg-[#D4AF37] text-[#E8C97A] hover:text-black border border-[#D4AF37]/40 font-bold transition-all cursor-pointer shadow-[0_0_12px_rgba(212,175,55,0.15)]"
                            >
                              <span>{isExpanded ? "Hide Solutions" : "View Solutions & Answers"}</span>
                              {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Expanded Thread View */}
                      <AnimatePresence>
                        {isExpanded && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            exit={{ opacity: 0, height: 0 }}
                            transition={{ duration: 0.3 }}
                            className="p-5 sm:p-6 bg-black/25 border-t border-white/10 space-y-6"
                          >
                            {/* Full Description & Code */}
                            <div>
                              <p className="text-xs text-[var(--ink)] leading-relaxed whitespace-pre-wrap mb-4">
                                {doubt.description}
                              </p>

                              {doubt.codeSnippet && (
                                <div className="rounded-xl overflow-hidden border border-white/10 bg-[#0a0d13] p-4 font-mono text-xs">
                                  <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-[var(--ink-dim)]">
                                    <span>Snippet ({doubt.language || "code"})</span>
                                  </div>
                                  <pre className="text-[var(--syn-function)] overflow-x-auto whitespace-pre leading-relaxed">
                                    {doubt.codeSnippet}
                                  </pre>
                                </div>
                              )}
                            </div>

                            {/* Answers List */}
                            <div className="space-y-4 pt-4 border-t border-white/10">
                              <h4 className="font-serif text-sm font-bold text-[#E8C97A] flex items-center gap-2">
                                <MessageSquare className="w-4 h-4" />
                                Solutions &amp; Peer Explanations ({doubt.answers?.length || 0})
                              </h4>

                              {(!doubt.answers || doubt.answers.length === 0) ? (
                                <p className="text-xs text-[var(--ink-dim)] italic">
                                  No answers submitted yet. Be the first to explain and earn +10 Karma!
                                </p>
                              ) : (
                                <div className="space-y-3">
                                  {doubt.answers.map((ans) => {
                                    const isAuthor = user?.id === doubt.author?.id;

                                    return (
                                      <div
                                        key={ans.id}
                                        className={`glass-strong rounded-xl p-4 border transition-all ${
                                          ans.isAccepted
                                            ? "border-[#D4AF37]/60 bg-[#D4AF37]/5 shadow-[0_0_25px_rgba(212,175,55,0.15)]"
                                            : "border-white/10"
                                        }`}
                                      >
                                        <div className="flex items-center justify-between gap-2 mb-3 flex-wrap">
                                          <div className="flex items-center gap-2.5">
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                              src={ans.author?.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${ans.author?.name || "Peer"}`}
                                              alt={ans.author?.name || "Answerer"}
                                              className="w-6 h-6 rounded-full border border-white/20 object-cover"
                                            />
                                            <span className="text-xs font-bold text-white">{ans.author?.name || "Campus Peer"}</span>
                                            {ans.author?.role === "FACULTY" && (
                                              <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-[#D4AF37]/20 text-[#E8C97A] font-bold border border-[#D4AF37]/40">
                                                FACULTY
                                              </span>
                                            )}

                                            {/* Message Answerer Button */}
                                            {ans.author?.id && ans.author.id !== user?.id && (
                                              <button
                                                onClick={(e) => {
                                                  e.stopPropagation();
                                                  if (!user) {
                                                    openAuthModal("login");
                                                    return;
                                                  }
                                                  setActiveDmPeer({
                                                    id: ans.author.id,
                                                    name: ans.author.name,
                                                    avatar: ans.author.avatar,
                                                    email: (ans.author as any).email,
                                                    stream: (ans.author as any).stream,
                                                    collegeName: (ans.author as any).collegeName,
                                                  });
                                                  setIsDmOpen(true);
                                                }}
                                                className="flex items-center gap-1.5 text-[10.5px] font-mono px-2.5 py-0.5 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37] text-[#E8C97A] hover:text-black border border-[#D4AF37]/35 transition-all font-semibold cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.12)] ml-1"
                                                title={`Direct message ${ans.author.name}`}
                                              >
                                                <MessageSquare className="w-3 h-3" />
                                                <span>Message</span>
                                              </button>
                                            )}
                                          </div>

                                          <div className="flex items-center gap-2">
                                            {ans.isFacultyEndorsed && (
                                              <span className="flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded-full bg-[#D4AF37]/25 text-[#F3E5AB] border border-[#D4AF37]/40 font-bold">
                                                <ShieldCheck className="w-3 h-3 text-[#E8C97A]" /> Endorsed by {ans.endorsedByFacultyName || "Faculty"}
                                              </span>
                                            )}

                                            {ans.isAccepted && (
                                              <span className="flex items-center gap-1 text-[10px] font-mono px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#E8C97A] border border-[#D4AF37]/50 font-bold shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                                                <Check className="w-3 h-3" /> Accepted Solution
                                              </span>
                                            )}

                                            {/* Author can mark as accepted */}
                                            {isAuthor && !ans.isAccepted && (
                                              <button
                                                onClick={() => handleAcceptAnswer(doubt.id, ans.id)}
                                                className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-[#D4AF37]/20 text-[#E8C97A] border border-[#D4AF37]/40 hover:bg-[#D4AF37] hover:text-black font-bold transition-all cursor-pointer shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                                              >
                                                Accept as Solution
                                              </button>
                                            )}
                                          </div>
                                        </div>

                                        <div className="mt-1">
                                          <p className="text-xs text-zinc-200 leading-relaxed whitespace-pre-wrap font-sans">
                                            {ans.content || (
                                              <span className="text-zinc-400 italic">No explanation text provided.</span>
                                            )}
                                          </p>
                                        </div>

                                        {ans.codeSnippet && (
                                          <div className="mt-3 rounded-xl bg-black/60 p-3.5 font-mono text-[11px] text-zinc-100 overflow-x-auto border border-white/10">
                                            <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/10 text-[10px] text-zinc-400">
                                              <span>Working Solution Snippet</span>
                                              <button
                                                onClick={() => void navigator.clipboard.writeText(ans.codeSnippet!)}
                                                className="text-[#E8C97A] hover:underline font-mono text-[10px] cursor-pointer"
                                              >
                                                Copy Snippet
                                              </button>
                                            </div>
                                            <pre className="whitespace-pre leading-relaxed">{ans.codeSnippet}</pre>
                                          </div>
                                        )}
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>

                            {/* Post an Answer Form */}
                            <div className="pt-4 border-t border-white/10 space-y-3">
                              <h5 className="font-serif text-xs font-bold text-[#E8C97A] flex items-center gap-1.5">
                                <Plus className="w-3.5 h-3.5" /> Submit Solution / Explanation
                              </h5>
                              <textarea
                                rows={3}
                                placeholder="Explain clearly why this issue happens and how to resolve it..."
                                value={answerContent}
                                onChange={(e) => setAnswerContent(e.target.value)}
                                className="w-full p-3 rounded-xl glass border border-white/15 text-xs outline-none focus:border-[#D4AF37] resize-none"
                              />

                              <textarea
                                rows={2}
                                placeholder="Optional: Paste working solution code snippet here..."
                                value={answerCode}
                                onChange={(e) => setAnswerCode(e.target.value)}
                                className="w-full p-2.5 rounded-xl bg-black/30 border border-white/10 text-xs font-mono outline-none focus:border-[#D4AF37] resize-none"
                              />

                              <div className="flex items-center justify-between">
                                <span className="text-[11px] font-mono text-[var(--ink-dim)]">
                                  Submitting an answer awards +10 Karma points
                                </span>
                                <button
                                  onClick={() => handleAnswerSubmit(doubt.id)}
                                  disabled={submittingAnswer || !answerContent.trim()}
                                  className="btn-gold px-4 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                                >
                                  {submittingAnswer ? (
                                    <>
                                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Submitting...
                                    </>
                                  ) : (
                                    <>
                                      <Send className="w-3.5 h-3.5" /> Post Answer
                                    </>
                                  )}
                                </button>
                              </div>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </motion.div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Right Sidebar (4 cols) */}
          <div className="lg:col-span-4 space-y-6">
            {/* Student Doubt Resolution Tracker Card */}
            <div className="glass-strong rounded-2xl p-6 border border-[rgba(212,175,55,0.3)] shadow-xl relative overflow-hidden">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-[#E8C97A]">
                  <Flame className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="font-serif text-base font-bold">Your Campus Tracker</h3>
                </div>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#E8C97A] font-bold border border-[#D4AF37]/30">
                  {stats?.karmaPoints ?? 0} Karma
                </span>
              </div>

              <p className="text-xs text-[var(--ink-dim)] leading-relaxed mb-5">
                Every doubt asked, answered, and marked as verified solution tracks on your campus profile.
              </p>

              <div className="grid grid-cols-2 gap-3 font-mono text-center">
                <div className="p-3 rounded-xl glass border border-white/5">
                  <span className="text-[11px] text-[var(--ink-dim)] block">Doubts Asked</span>
                  <span className="font-display text-xl font-bold text-[#E8C97A]">
                    {stats?.doubtsAsked ?? 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl glass border border-white/5">
                  <span className="text-[11px] text-[var(--ink-dim)] block">Doubts Solved</span>
                  <span className="font-display text-xl font-bold text-emerald-400">
                    {stats?.doubtsResolved ?? 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl glass border border-white/5">
                  <span className="text-[11px] text-[var(--ink-dim)] block">Answers Given</span>
                  <span className="font-display text-xl font-bold text-cyan-400">
                    {stats?.answersGiven ?? 0}
                  </span>
                </div>

                <div className="p-3 rounded-xl glass border border-white/5">
                  <span className="text-[11px] text-[var(--ink-dim)] block">Accepted Fixes</span>
                  <span className="font-display text-xl font-bold text-purple-400">
                    {stats?.solutionsAccepted ?? 0}
                  </span>
                </div>
              </div>
            </div>

            {/* Privacy Levels Explained */}
            <div className="glass rounded-2xl p-6 border border-white/10 space-y-3 text-xs">
              <h4 className="font-serif text-sm font-bold text-[#E8C97A] flex items-center gap-1.5">
                <Lock className="w-4 h-4" /> Three-Tier Privacy System
              </h4>
              <p className="text-[var(--ink-dim)] leading-relaxed">
                Students often hesitate to ask doubts due to fear of judgment. You control who sees your identity:
              </p>
              <ul className="space-y-2 text-[var(--ink)]">
                <li className="flex items-start gap-2">
                  <Globe className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                  <span><strong>Public:</strong> Visible to all students and faculty with your profile.</span>
                </li>
                <li className="flex items-start gap-2">
                  <EyeOff className="w-4 h-4 text-[#E8C97A] shrink-0 mt-0.5" />
                  <span><strong>Anonymous to Peers:</strong> Name masked to students; faculty can monitor quality.</span>
                </li>
                <li className="flex items-start gap-2">
                  <Lock className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                  <span><strong>Faculty &amp; TA Only:</strong> Private consultation directly with instructors.</span>
                </li>
              </ul>
            </div>

            {/* Topic Filter Pills */}
            <div className="glass rounded-2xl p-6 border border-white/10 space-y-3">
              <h4 className="font-serif text-sm font-bold text-[#E8C97A] flex items-center gap-1.5">
                <Tag className="w-4 h-4" /> Frequently Asked Topics
              </h4>
              <div className="flex flex-wrap gap-1.5">
                {[
                  "Algorithms",
                  "Recursion",
                  "Pointers",
                  "Trees",
                  "QuickSort",
                  "Java",
                  "Concurrency",
                  "MemoryManagement",
                  "C",
                  "Python",
                ].map((t) => (
                  <button
                    key={t}
                    onClick={() => setSelectedTag(selectedTag === t ? "" : t)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-mono transition-all cursor-pointer ${
                      selectedTag === t
                        ? "bg-[#D4AF37] text-black font-bold"
                        : "glass text-[var(--ink-dim)] hover:text-[var(--ink)]"
                    }`}
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Ask a Doubt Modal */}
      <AnimatePresence>
        {isAskModalOpen && (
          <AskDoubtModal
            onClose={() => setIsAskModalOpen(false)}
            onSuccess={() => {
              setIsAskModalOpen(false);
              loadDoubts();
            }}
          />
        )}
      </AnimatePresence>

      {/* Direct Message Drawer */}
      <DirectMessageDrawer
        isOpen={isDmOpen}
        onClose={() => setIsDmOpen(false)}
        peer={activeDmPeer}
        token={token}
        currentUserId={user?.id}
      />

      <Footer />
    </div>
  );
}

function AskDoubtModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [language, setLanguage] = useState("python");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [tagInput, setTagInput] = useState("Algorithms, CompilerError");
  const [privacy, setPrivacy] = useState<"PUBLIC" | "ANONYMOUS_PEERS" | "FACULTY_ONLY">("PUBLIC");

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !description.trim()) {
      setError("Please fill in both title and question description.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const tags = tagInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    const res = await createDoubt({
      title,
      description,
      language,
      codeSnippet: codeSnippet.trim() || undefined,
      tags,
      privacy,
      authorId: user?.id || "usr_demo_001",
    });

    setSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || "Failed to submit doubt.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-strong rounded-2xl border border-[rgba(212,175,55,0.4)] shadow-2xl p-6 sm:p-8 max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex items-center justify-between pb-4 border-b border-white/10 mb-6">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-[#E8C97A]" />
            <h2 className="font-display text-xl font-bold">Ask a Campus Doubt</h2>
          </div>
          <button onClick={onClose} className="p-1 rounded-lg hover:bg-white/10 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
              Doubt Title *
            </label>
            <input
              type="text"
              required
              placeholder="e.g. Why does my recursive quicksort cause maximum depth exceeded?"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-sm outline-none focus:border-[#D4AF37]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
                Programming Language
              </label>
              <select
                value={language}
                onChange={(e) => setLanguage(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-xs font-mono outline-none focus:border-[#D4AF37] bg-[var(--bg)]"
              >
                <option value="python">Python</option>
                <option value="cpp">C++</option>
                <option value="java">Java</option>
                <option value="c">C</option>
                <option value="javascript">JavaScript</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
                Topic Tags (comma separated)
              </label>
              <input
                type="text"
                placeholder="e.g. Recursion, Sorting, Memory"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-xs outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
              Doubt Details &amp; Error Message *
            </label>
            <textarea
              required
              rows={3}
              placeholder="Describe what you tried, the error output, or what concept is confusing..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 rounded-lg glass border border-white/15 text-xs outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
              Code Snippet (Optional)
            </label>
            <textarea
              rows={4}
              placeholder="Paste your code snippet where the error happens..."
              value={codeSnippet}
              onChange={(e) => setCodeSnippet(e.target.value)}
              className="w-full p-3 rounded-lg bg-black/40 border border-white/15 text-xs font-mono outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {/* Privacy Level Selector */}
          <div className="pt-2 border-t border-white/10 space-y-2">
            <label className="block text-xs font-serif font-bold text-[#E8C97A]">
              Choose Privacy &amp; Anonymity Level
            </label>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <label
                className={`p-3 rounded-xl glass border cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === "PUBLIC"
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="privacy"
                    value="PUBLIC"
                    checked={privacy === "PUBLIC"}
                    onChange={() => setPrivacy("PUBLIC")}
                    className="accent-[#D4AF37]"
                  />
                  <Globe className="w-4 h-4 text-[#E8C97A]" />
                  <span className="font-semibold">Public</span>
                </div>
                <span className="text-[11px] text-[var(--ink-dim)]">
                  Name visible to all students &amp; faculty.
                </span>
              </label>

              <label
                className={`p-3 rounded-xl glass border cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === "ANONYMOUS_PEERS"
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="privacy"
                    value="ANONYMOUS_PEERS"
                    checked={privacy === "ANONYMOUS_PEERS"}
                    onChange={() => setPrivacy("ANONYMOUS_PEERS")}
                    className="accent-[#D4AF37]"
                  />
                  <EyeOff className="w-4 h-4 text-[#E8C97A]" />
                  <span className="font-semibold">Anonymous</span>
                </div>
                <span className="text-[11px] text-[var(--ink-dim)]">
                  Masked as &quot;Anonymous Peer&quot; to students.
                </span>
              </label>

              <label
                className={`p-3 rounded-xl glass border cursor-pointer transition-all flex flex-col justify-between ${
                  privacy === "FACULTY_ONLY"
                    ? "border-[#D4AF37] bg-[#D4AF37]/10"
                    : "border-white/10 hover:border-white/20"
                }`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <input
                    type="radio"
                    name="privacy"
                    value="FACULTY_ONLY"
                    checked={privacy === "FACULTY_ONLY"}
                    onChange={() => setPrivacy("FACULTY_ONLY")}
                    className="accent-[#D4AF37]"
                  />
                  <Lock className="w-4 h-4 text-[#E8C97A]" />
                  <span className="font-semibold">Faculty Only</span>
                </div>
                <span className="text-[11px] text-[var(--ink-dim)]">
                  Private question only seen by instructors.
                </span>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-end gap-3 pt-4 border-t border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl glass text-xs font-medium hover:bg-white/10 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="btn-gold px-5 py-2 rounded-xl text-xs font-bold text-black flex items-center gap-1.5 shadow-lg"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" /> Publishing...
                </>
              ) : (
                <>
                  <span>Post Doubt</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-mono">+5 Karma</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
