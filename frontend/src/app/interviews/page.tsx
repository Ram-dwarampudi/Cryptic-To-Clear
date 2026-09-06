"use client";

import React, { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion, AnimatePresence } from "framer-motion";
import {
  Building2,
  Briefcase,
  GraduationCap,
  Sparkles,
  Search,
  Filter,
  ChevronDown,
  ChevronUp,
  ThumbsUp,
  Plus,
  X,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Award,
  Layers,
  Clock,
  BookOpen,
  Share2,
  Loader2,
  Shield,
  EyeOff,
  TrendingUp,
} from "lucide-react";
import {
  fetchInterviews,
  fetchCompanyStats,
  createInterviewExperience,
  upvoteInterview,
  InterviewExperience,
  CompanyStat,
  InterviewRound,
} from "@/lib/community-api";
import { useAuth } from "@/context/AuthContext";

export default function InterviewsPage() {
  const { user, openAuthModal } = useAuth();

  const [interviews, setInterviews] = useState<InterviewExperience[]>([]);
  const [companies, setCompanies] = useState<CompanyStat[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedDriveType, setSelectedDriveType] = useState("");

  // Modal State
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [interviewsRes, statsRes] = await Promise.all([
      fetchInterviews({
        search: searchQuery,
        company: selectedCompany,
        difficulty: selectedDifficulty,
        driveType: selectedDriveType,
      }),
      fetchCompanyStats(),
    ]);

    if (interviewsRes.success) {
      setInterviews(interviewsRes.data);
    }
    if (statsRes.success) {
      setCompanies(statsRes.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [selectedCompany, selectedDifficulty, selectedDriveType]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loadData();
  };

  const handleUpvote = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const res = await upvoteInterview(id);
    if (res.success && res.upvotes !== undefined) {
      setInterviews((prev) =>
        prev.map((item) => (item.id === id ? { ...item, upvotes: res.upvotes! } : item))
      );
    }
  };

  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#f7f3eb]">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-14 sm:pt-36 sm:pb-16 editor-grid overflow-hidden border-b border-[rgba(212,175,55,0.15)]">
        <div className="blob h-[380px] w-[380px] bg-[var(--syn-keyword)] -top-32 -left-20 opacity-20" />
        <div className="blob h-[320px] w-[320px] bg-[var(--syn-function)] top-10 -right-20 opacity-15" />

        <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1 mb-4 border border-[rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.2)]">
                <GraduationCap className="h-4 w-4 text-[#E8C97A]" />
                <span className="font-mono text-[11.5px] font-semibold text-[#E8C97A] uppercase tracking-wider">
                  Campus Placement Knowledge Base
                </span>
              </div>
              <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight">
                Senior-to-Junior <br />
                <span className="text-gradient">Interview Experience Hub</span>
              </h1>
              <p className="mt-3 text-base text-[var(--ink-dim)] max-w-2xl leading-relaxed">
                Real interview rounds, exact coding challenges, and strategic preparation advice shared by placed seniors. Study what your seniors faced and get hired.
              </p>
            </div>

            {/* Action button */}
            <div className="shrink-0">
              <button
                onClick={() => {
                  if (!user) {
                    openAuthModal("login");
                  } else {
                    setIsShareModalOpen(true);
                  }
                }}
                className="btn-gold flex items-center gap-2 px-5 py-3 rounded-xl font-bold text-sm text-[#0a0d13] shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.5)] transition-all transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              >
                <Plus className="h-4 w-4" />
                <span>Share Your Experience</span>
                <span className="ml-1 text-[11px] px-1.5 py-0.5 rounded bg-black/20 text-[#0a0d13] font-mono">
                  +25 Karma
                </span>
              </button>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-10">
            <div className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-[#E8C97A] mb-1">
                <Briefcase className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold">Total Experiences</span>
              </div>
              <p className="font-display text-2xl font-bold">{interviews.length}</p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-emerald-400 mb-1">
                <Building2 className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold">Hiring Companies</span>
              </div>
              <p className="font-display text-2xl font-bold">{companies.length}</p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-amber-400 mb-1">
                <TrendingUp className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold">Highest Package</span>
              </div>
              <p className="font-display text-2xl font-bold">
                {interviews.length > 0
                  ? (interviews.find((i) => i.packageCTC)?.packageCTC || "Competitive")
                  : "—"}
              </p>
            </div>

            <div className="glass rounded-xl p-4 border border-white/5">
              <div className="flex items-center gap-2 text-purple-400 mb-1">
                <Award className="h-4 w-4" />
                <span className="font-mono text-xs font-semibold">Status</span>
              </div>
              <p className="font-display text-2xl font-bold">
                {interviews.length > 0 ? "Verified" : "Ready"}
              </p>
            </div>
          </div>

          {/* Company Quick-Pill Filter */}
          {companies.length > 0 && (
            <div className="mt-8 flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              <span className="text-xs font-mono text-[var(--ink-dim)] shrink-0 flex items-center gap-1 mr-1">
                <Filter className="w-3 h-3" /> Top Companies:
              </span>
              <button
                onClick={() => setSelectedCompany("")}
                className={`px-3 py-1 rounded-lg text-xs font-medium font-mono transition-all shrink-0 ${
                  selectedCompany === ""
                    ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                    : "glass text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-white/20"
                }`}
              >
                All Companies
              </button>
              {companies.map((c) => (
                <button
                  key={c.companyName}
                  onClick={() => setSelectedCompany(selectedCompany === c.companyName ? "" : c.companyName)}
                  className={`px-3 py-1 rounded-lg text-xs font-medium transition-all shrink-0 flex items-center gap-1.5 ${
                    selectedCompany === c.companyName
                      ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_10px_rgba(212,175,55,0.4)]"
                      : "glass text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-white/20"
                  }`}
                >
                  <span>{c.companyName}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 font-mono">
                    {c.count}
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Main Content Area */}
      <section className="py-10 mx-auto max-w-7xl px-5 sm:px-8 w-full flex-1">
        {/* Search & Filter Controls */}
        <form onSubmit={handleSearchSubmit} className="mb-8 flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-[var(--ink-dim)]" />
            <input
              type="text"
              placeholder="Search by company, role (e.g. SDE, Cloud), or keyword in questions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl glass border border-white/10 text-sm outline-none focus:border-[#D4AF37] transition-all placeholder:text-[var(--ink-dim)]"
            />
          </div>

          <div className="flex items-center gap-3">
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass border border-white/10 text-xs font-mono outline-none focus:border-[#D4AF37] transition-all bg-[var(--bg)] cursor-pointer"
            >
              <option value="">Difficulty: All</option>
              <option value="EASY">Easy</option>
              <option value="MEDIUM">Medium</option>
              <option value="HARD">Hard</option>
            </select>

            <select
              value={selectedDriveType}
              onChange={(e) => setSelectedDriveType(e.target.value)}
              className="px-3 py-2.5 rounded-xl glass border border-white/10 text-xs font-mono outline-none focus:border-[#D4AF37] transition-all bg-[var(--bg)] cursor-pointer"
            >
              <option value="">Drive Type: All</option>
              <option value="ON_CAMPUS">On Campus</option>
              <option value="OFF_CAMPUS">Off Campus</option>
              <option value="POOL_CAMPUS">Pool Campus</option>
            </select>

            <button
              type="submit"
              className="px-4 py-2.5 rounded-xl glass font-medium text-xs hover:border-[#D4AF37] hover:text-[#E8C97A] transition-all cursor-pointer shrink-0"
            >
              Filter
            </button>
          </div>
        </form>

        {/* Loading Spinner */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="h-8 w-8 animate-spin text-[#E8C97A] mb-3" />
            <p className="text-sm font-mono text-[var(--ink-dim)]">Loading verified interview experiences...</p>
          </div>
        ) : interviews.length === 0 ? (
          <div className="text-center py-20 glass rounded-2xl border border-white/5 p-8 max-w-lg mx-auto">
            <HelpCircle className="h-10 w-10 text-[var(--ink-dim)] mx-auto mb-3" />
            <h3 className="font-display text-lg font-bold mb-1">No Experiences Found</h3>
            <p className="text-xs text-[var(--ink-dim)] mb-6">
              No interview experiences matched your current filter. Be the first to share one!
            </p>
            <button
              onClick={() => {
                setSearchQuery("");
                setSelectedCompany("");
                setSelectedDifficulty("");
                setSelectedDriveType("");
                loadData();
              }}
              className="btn-gold px-4 py-2 rounded-lg text-xs font-bold text-black cursor-pointer"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="space-y-6">
            {interviews.map((item) => {
              const isExpanded = expandedId === item.id;
              const difficultyColor =
                item.difficulty === "HARD"
                  ? "border-rose-500/30 text-rose-300 bg-rose-500/10"
                  : item.difficulty === "MEDIUM"
                  ? "border-amber-500/30 text-amber-300 bg-amber-500/10"
                  : "border-emerald-500/30 text-emerald-300 bg-emerald-500/10";

              return (
                <motion.div
                  key={item.id}
                  layout
                  className="glass rounded-2xl border border-white/10 hover:border-[#D4AF37]/50 transition-all shadow-lg overflow-hidden"
                >
                  {/* Card Header Banner */}
                  <div
                    onClick={() => setExpandedId(isExpanded ? null : item.id)}
                    className="p-6 cursor-pointer flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
                  >
                    <div className="flex items-start gap-4">
                      {/* Company Avatar / Logo */}
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-white/10 to-white/5 border border-white/15 flex items-center justify-center shrink-0 p-2 shadow-inner">
                        {item.companyLogo ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={item.companyLogo}
                            alt={item.companyName}
                            className="max-h-full max-w-full object-contain filter drop-shadow"
                          />
                        ) : (
                          <Building2 className="w-6 h-6 text-[#E8C97A]" />
                        )}
                      </div>

                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <h2 className="font-display text-xl font-bold">{item.companyName}</h2>
                          <span className="text-xs font-mono text-[var(--ink-dim)]">•</span>
                          <span className="text-sm font-medium text-[var(--ink)]">{item.roleTitle}</span>
                        </div>

                        <div className="flex items-center gap-3 mt-1.5 flex-wrap">
                          {item.packageCTC && (
                            <span className="text-xs font-mono font-bold text-[#E8C97A] px-2 py-0.5 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/25">
                              {item.packageCTC}
                            </span>
                          )}
                          <span className="text-[11px] font-mono text-[var(--ink-dim)]">
                            {item.driveType.replace("_", " ")}
                          </span>
                          {item.location && (
                            <span className="text-[11px] font-mono text-[var(--ink-dim)]">
                              📍 {item.location}
                            </span>
                          )}
                          <span className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border ${difficultyColor}`}>
                            {item.difficulty}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right side stats & Author */}
                    <div className="flex sm:flex-col items-center sm:items-end justify-between w-full sm:w-auto gap-2 border-t sm:border-t-0 pt-3 sm:pt-0 border-white/5">
                      <div className="flex items-center gap-2">
                        {item.isAnonymous ? (
                          <div className="flex items-center gap-1.5 text-xs text-[var(--ink-dim)] font-mono">
                            <EyeOff className="w-3.5 h-3.5 text-[#E8C97A]" />
                            <span>{item.student.name}</span>
                          </div>
                        ) : (
                          <div className="flex items-center gap-2">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.student.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=Senior"}
                              alt={item.student.name}
                              className="w-6 h-6 rounded-full border border-white/20"
                            />
                            <span className="text-xs font-medium text-[var(--ink)]">
                              {item.student.name}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <button
                          onClick={(e) => handleUpvote(item.id, e)}
                          className="flex items-center gap-1 text-xs text-[var(--ink-dim)] hover:text-[#E8C97A] transition-colors cursor-pointer glass px-2.5 py-1 rounded-lg border border-white/10"
                        >
                          <ThumbsUp className="w-3.5 h-3.5" />
                          <span className="font-mono">{item.upvotes}</span>
                        </button>
                        <div className="flex items-center gap-1 text-xs text-[#E8C97A] font-mono">
                          <span>{item.rounds?.length || 0} Rounds</span>
                          {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Summary Bar */}
                  <div className="px-6 pb-4 text-xs text-[var(--ink-dim)] leading-relaxed border-b border-white/5">
                    &ldquo;{item.summary}&rdquo;
                  </div>

                  {/* Expanded Content: Rounds & Question Bank */}
                  <AnimatePresence>
                    {isExpanded && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        exit={{ opacity: 0, height: 0 }}
                        transition={{ duration: 0.3 }}
                        className="p-6 bg-black/20 border-t border-white/5 space-y-6"
                      >
                        {/* Round Breakdown */}
                        <div>
                          <h3 className="font-serif text-sm font-bold text-[#E8C97A] flex items-center gap-2 mb-3">
                            <Layers className="w-4 h-4" />
                            Interview Rounds & Questions Asked
                          </h3>

                          <div className="space-y-4">
                            {item.rounds?.map((round, idx) => (
                              <div
                                key={idx}
                                className="glass-strong rounded-xl p-4 border border-white/10"
                              >
                                <div className="flex items-center justify-between gap-2 mb-2">
                                  <div className="flex items-center gap-2">
                                    <span className="font-mono text-xs font-bold px-2 py-0.5 rounded bg-[#D4AF37]/20 text-[#E8C97A] border border-[#D4AF37]/30">
                                      Round {round.roundNumber || idx + 1}
                                    </span>
                                    <span className="font-semibold text-sm">{round.roundName}</span>
                                    <span className="text-xs font-mono text-[var(--ink-dim)]">
                                      ({round.roundType})
                                    </span>
                                  </div>
                                  {round.duration && (
                                    <span className="text-[11px] font-mono text-[var(--ink-dim)] flex items-center gap-1">
                                      <Clock className="w-3 h-3" /> {round.duration}
                                    </span>
                                  )}
                                </div>

                                {round.details && (
                                  <p className="text-xs text-[var(--ink-dim)] mb-3 leading-relaxed">
                                    {round.details}
                                  </p>
                                )}

                                {round.questions && round.questions.length > 0 && (
                                  <div className="mt-2.5 pt-2.5 border-t border-white/5">
                                    <span className="text-[11px] font-mono font-semibold text-[#E8C97A] block mb-1.5">
                                      Questions Asked:
                                    </span>
                                    <ul className="space-y-1.5">
                                      {round.questions.map((q, qIdx) => (
                                        <li
                                          key={qIdx}
                                          className="text-xs text-[var(--ink)] font-mono flex items-start gap-2 bg-black/30 p-2 rounded-lg border border-white/5"
                                        >
                                          <span className="text-[#E8C97A] font-bold">Q{qIdx + 1}.</span>
                                          <span>{q}</span>
                                        </li>
                                      ))}
                                    </ul>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Tips for Juniors */}
                        {item.tips && (
                          <div className="glass rounded-xl p-4 border border-emerald-500/20 bg-emerald-950/10">
                            <h4 className="font-serif text-xs font-bold text-emerald-400 flex items-center gap-1.5 mb-1">
                              <Sparkles className="w-4 h-4" /> Senior Advice & Strategy
                            </h4>
                            <p className="text-xs text-[var(--ink)] leading-relaxed">{item.tips}</p>
                          </div>
                        )}

                        {/* Resources */}
                        {item.preparationResources && (
                          <div className="glass rounded-xl p-4 border border-purple-500/20 bg-purple-950/10">
                            <h4 className="font-serif text-xs font-bold text-purple-400 flex items-center gap-1.5 mb-1">
                              <BookOpen className="w-4 h-4" /> Recommended Prep Materials
                            </h4>
                            <p className="text-xs text-[var(--ink)] leading-relaxed">
                              {item.preparationResources}
                            </p>
                          </div>
                        )}
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </div>
        )}
      </section>

      {/* Share Interview Experience Modal */}
      <AnimatePresence>
        {isShareModalOpen && (
          <ShareExperienceModal
            onClose={() => setIsShareModalOpen(false)}
            onSuccess={() => {
              setIsShareModalOpen(false);
              loadData();
            }}
          />
        )}
      </AnimatePresence>

      <Footer />
    </div>
  );
}

function ShareExperienceModal({
  onClose,
  onSuccess,
}: {
  onClose: () => void;
  onSuccess: () => void;
}) {
  const { user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [companyName, setCompanyName] = useState("");
  const [roleTitle, setRoleTitle] = useState("Software Development Engineer - I");
  const [packageCTC, setPackageCTC] = useState("");
  const [location, setLocation] = useState("");
  const [driveType, setDriveType] = useState("ON_CAMPUS");
  const [difficulty, setDifficulty] = useState("MEDIUM");
  const [graduationYear, setGraduationYear] = useState(2025);
  const [summary, setSummary] = useState("");
  const [tips, setTips] = useState("");
  const [preparationResources, setPreparationResources] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);

  // Dynamic rounds
  const [rounds, setRounds] = useState<InterviewRound[]>([
    {
      roundNumber: 1,
      roundName: "Online Assessment (OA)",
      roundType: "Coding",
      duration: "90 mins",
      details: "Algorithmic challenges on HackerRank / HackerEarth platform.",
      questions: ["Given an array, find the maximum contiguous subarray sum."],
    },
    {
      roundNumber: 2,
      roundName: "Technical Round 1",
      roundType: "DSA & Problem Solving",
      duration: "45 mins",
      details: "Live pair-coding interview with a Senior Engineer.",
      questions: ["Design and implement an LRU cache in O(1) time."],
    },
  ]);

  const addRound = () => {
    setRounds([
      ...rounds,
      {
        roundNumber: rounds.length + 1,
        roundName: `Technical Round ${rounds.length}`,
        roundType: "Technical",
        duration: "45 mins",
        details: "",
        questions: [""],
      },
    ]);
  };

  const updateRound = (idx: number, field: keyof InterviewRound, val: any) => {
    const next = [...rounds];
    next[idx] = { ...next[idx], [field]: val };
    setRounds(next);
  };

  const addQuestionToRound = (rIdx: number) => {
    const next = [...rounds];
    next[rIdx].questions.push("");
    setRounds(next);
  };

  const updateQuestion = (rIdx: number, qIdx: number, val: string) => {
    const next = [...rounds];
    next[rIdx].questions[qIdx] = val;
    setRounds(next);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !summary.trim()) {
      setError("Please fill in company name and interview summary.");
      return;
    }

    setSubmitting(true);
    setError(null);

    const res = await createInterviewExperience({
      companyName,
      roleTitle,
      packageCTC,
      location,
      driveType,
      difficulty,
      graduationYear,
      summary,
      rounds,
      tips,
      preparationResources,
      isAnonymous,
      studentId: user?.id || "usr_demo_001",
    });

    setSubmitting(false);

    if (res.success) {
      onSuccess();
    } else {
      setError(res.message || "Failed to submit interview experience.");
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
            <GraduationCap className="w-5 h-5 text-[#E8C97A]" />
            <h2 className="font-display text-xl font-bold">Share Interview Experience</h2>
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
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
                Company Name *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. Google, Amazon, TCS, Uber"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
                Role Title *
              </label>
              <input
                type="text"
                required
                placeholder="e.g. SDE-1, Cloud Engineer"
                value={roleTitle}
                onChange={(e) => setRoleTitle(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
                Package / CTC
              </label>
              <input
                type="text"
                placeholder="e.g. 18 LPA, 40k/mo"
                value={packageCTC}
                onChange={(e) => setPackageCTC(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-sm outline-none focus:border-[#D4AF37]"
              />
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">Drive Type</label>
              <select
                value={driveType}
                onChange={(e) => setDriveType(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-xs font-mono outline-none focus:border-[#D4AF37] bg-[var(--bg)]"
              >
                <option value="ON_CAMPUS">On Campus</option>
                <option value="OFF_CAMPUS">Off Campus</option>
                <option value="POOL_CAMPUS">Pool Campus</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full px-3 py-2 rounded-lg glass border border-white/15 text-xs font-mono outline-none focus:border-[#D4AF37] bg-[var(--bg)]"
              >
                <option value="EASY">Easy</option>
                <option value="MEDIUM">Medium</option>
                <option value="HARD">Hard</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
              Interview Overview & Summary *
            </label>
            <textarea
              required
              rows={2}
              placeholder="Briefly describe the overall drive flow, how many applicants cleared, and the vibe of the panel..."
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              className="w-full p-3 rounded-lg glass border border-white/15 text-xs outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {/* Rounds Section */}
          <div className="pt-2 border-t border-white/10">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-serif font-bold text-[#E8C97A]">
                Rounds & Questions Asked
              </span>
              <button
                type="button"
                onClick={addRound}
                className="text-xs font-mono text-[#E8C97A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" /> Add Round
              </button>
            </div>

            <div className="space-y-3">
              {rounds.map((r, rIdx) => (
                <div key={rIdx} className="glass rounded-xl p-3 border border-white/10 space-y-2">
                  <div className="flex items-center gap-2">
                    <input
                      type="text"
                      placeholder="Round Title (e.g. Technical Round 1)"
                      value={r.roundName}
                      onChange={(e) => updateRound(rIdx, "roundName", e.target.value)}
                      className="flex-1 px-2.5 py-1.5 rounded glass text-xs outline-none"
                    />
                    <input
                      type="text"
                      placeholder="Duration"
                      value={r.duration}
                      onChange={(e) => updateRound(rIdx, "duration", e.target.value)}
                      className="w-24 px-2.5 py-1.5 rounded glass text-xs font-mono outline-none"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <span className="text-[11px] font-mono text-[var(--ink-dim)]">Questions:</span>
                    {r.questions.map((q, qIdx) => (
                      <input
                        key={qIdx}
                        type="text"
                        placeholder={`Question ${qIdx + 1}`}
                        value={q}
                        onChange={(e) => updateQuestion(rIdx, qIdx, e.target.value)}
                        className="w-full px-2.5 py-1 rounded bg-black/30 border border-white/10 text-xs font-mono outline-none"
                      />
                    ))}
                    <button
                      type="button"
                      onClick={() => addQuestionToRound(rIdx)}
                      className="text-[11px] text-[#E8C97A] hover:underline font-mono"
                    >
                      + Add Question
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-mono text-[var(--ink-dim)] mb-1">
              Tips for Juniors
            </label>
            <textarea
              rows={2}
              placeholder="What should juniors focus on? Any specific topics or STAR behavioral tips?"
              value={tips}
              onChange={(e) => setTips(e.target.value)}
              className="w-full p-3 rounded-lg glass border border-white/15 text-xs outline-none focus:border-[#D4AF37] resize-none"
            />
          </div>

          {/* Privacy Toggle */}
          <div className="p-3.5 rounded-xl glass border border-[rgba(212,175,55,0.3)] bg-[rgba(212,175,55,0.06)] flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <EyeOff className="w-5 h-5 text-[#E8C97A] shrink-0" />
              <div>
                <p className="text-xs font-semibold">Post Anonymously to Juniors</p>
                <p className="text-[11px] text-[var(--ink-dim)]">
                  Your identity will be masked as &quot;Anonymous Senior&quot;.
                </p>
              </div>
            </div>
            <input
              type="checkbox"
              checked={isAnonymous}
              onChange={(e) => setIsAnonymous(e.target.checked)}
              className="w-4 h-4 accent-[#D4AF37] cursor-pointer"
            />
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
                  <Loader2 className="w-4 h-4 animate-spin" /> Submitting...
                </>
              ) : (
                <>
                  <span>Publish Experience</span>
                  <span className="text-[10px] px-1 py-0.2 rounded bg-black/20 font-mono">+25 Karma</span>
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
