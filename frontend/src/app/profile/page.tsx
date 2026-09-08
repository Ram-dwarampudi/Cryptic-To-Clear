"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  fetchStudentDashboard,
  updateStudentProfile,
  syncExternalPlatforms,
  StudentDashboardData,
  ProblemItem,
} from "@/lib/api";
import {
  Zap,
  Star,
  Clock,
  Sparkles,
  Edit3,
  RefreshCw,
  ExternalLink,
  Code2,
  BookOpen,
  HelpCircle,
  Award,
  Search,
  Building,
  GraduationCap,
  X,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Flame,
  Target,
  BarChart3,
  PieChart,
  TrendingUp,
  Cpu,
  Layers,
  ArrowUpRight,
  ShieldCheck,
  Compass,
} from "lucide-react";

export default function StudentProfileDashboard() {
  const router = useRouter();
  const { user, token, loading: authLoading } = useAuth();

  const [dashboard, setDashboard] = useState<StudentDashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Active Workspace Tab
  const [activeTab, setActiveTab] = useState<"problems" | "coursework" | "community" | "analytics">("problems");

  // Modals
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSyncModalOpen, setIsSyncModalOpen] = useState(false);
  const [codingChartType, setCodingChartType] = useState<"pie" | "bar">("pie");
  const [selectedPlatform, setSelectedPlatform] = useState<"leetcode" | "codeforces" | "codechef" | "hackerrank" | "github">("codechef");
  const [actionLoading, setActionLoading] = useState(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const openPlatformModal = (platform: "leetcode" | "codeforces" | "codechef" | "hackerrank" | "github") => {
    setSelectedPlatform(platform);
    setIsSyncModalOpen(true);
  };

  // Edit Profile Form State
  const [editForm, setEditForm] = useState<{
    name: string;
    bio: string;
    rollNo: string;
    collegeName: string;
    stream: string;
    primaryLanguage: string;
    graduationYear: number | string;
  }>({
    name: "",
    bio: "",
    rollNo: "",
    collegeName: "",
    stream: "",
    primaryLanguage: "",
    graduationYear: "",
  });

  // External Handles State
  const [handlesForm, setHandlesForm] = useState({
    leetcodeHandle: "",
    codeforcesHandle: "",
    codechefHandle: "",
    hackerrankHandle: "",
    githubHandle: "",
  });

  // Problem Filters
  const [problemSearch, setProblemSearch] = useState("");
  const [difficultyFilter, setDifficultyFilter] = useState<string>("All");
  const [statusFilter, setStatusFilter] = useState<string>("All");

  // Load Dashboard
  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await fetchStudentDashboard(token);
      if (res.success && res.data) {
        setDashboard(res.data);
        const p = res.data.profile;
        setEditForm({
          name: p.name || "",
          bio: p.bio || "",
          rollNo: p.rollNo || "",
          collegeName: p.collegeName || "",
          stream: p.stream || "",
          primaryLanguage: p.primaryLanguage || "",
          graduationYear: p.graduationYear || "",
        });
        setHandlesForm({
          leetcodeHandle: p.handles?.leetcode || "",
          codeforcesHandle: p.handles?.codeforces || "",
          codechefHandle: p.handles?.codechef || "",
          hackerrankHandle: p.handles?.hackerrank || "",
          githubHandle: p.handles?.github || "",
        });
      } else {
        setError(res.message || "Failed to load developer dashboard.");
      }
    } catch {
      setError("Network error loading dashboard.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?redirect=/profile");
      return;
    }
    if (user) {
      loadDashboard();
    }
  }, [user, authLoading, token, router]);

  // Save Profile
  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await updateStudentProfile(
        {
          ...editForm,
          graduationYear:
            typeof editForm.graduationYear === "number"
              ? editForm.graduationYear
              : editForm.graduationYear
              ? parseInt(editForm.graduationYear, 10)
              : undefined,
        },
        token
      );
      if (res.success) {
        setActionSuccess("Profile updated successfully!");
        setTimeout(() => {
          setIsEditModalOpen(false);
          setActionSuccess(null);
          loadDashboard();
        }, 700);
      } else {
        alert(res.message || "Failed to update profile.");
      }
    } catch {
      alert("Error updating profile.");
    } finally {
      setActionLoading(false);
    }
  };

  // Sync Platforms
  const handleSyncPlatforms = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    setActionSuccess(null);
    try {
      const res = await syncExternalPlatforms(handlesForm, token);
      if (res.success) {
        setActionSuccess("Coding accounts linked & DevScore recalculated!");
        setTimeout(() => {
          setIsSyncModalOpen(false);
          setActionSuccess(null);
          loadDashboard();
        }, 900);
      } else {
        alert(res.message || "Failed to sync platforms.");
      }
    } catch {
      alert("Error syncing platforms.");
    } finally {
      setActionLoading(false);
    }
  };

  // One-click Refresh Live External Stats
  const handleRefreshLiveStats = async () => {
    setActionLoading(true);
    try {
      const res = await syncExternalPlatforms({}, token);
      if (res.success) {
        await loadDashboard();
      } else {
        alert(res.message || "Could not sync stats.");
      }
    } catch {
      alert("Network error while syncing stats.");
    } finally {
      setActionLoading(false);
    }
  };

  if (authLoading || (loading && !dashboard)) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center font-mono text-[#E8C97A]">
        <Loader2 className="w-8 h-8 animate-spin mb-3 text-[#D4AF37]" />
        <p className="text-xs tracking-wider uppercase">Loading Student Profile...</p>
      </div>
    );
  }

  if (error && !dashboard) {
    return (
      <div className="min-h-screen bg-[#070b14] flex flex-col items-center justify-center p-6 text-center">
        <AlertCircle className="w-10 h-10 text-red-400 mb-3" />
        <h2 className="text-lg font-bold text-white mb-1">Could Not Load Dashboard</h2>
        <p className="text-xs text-[var(--ink-dim)] font-mono mb-4">{error}</p>
        <button onClick={loadDashboard} className="btn-gold px-4 py-2 text-xs font-bold">
          Try Again
        </button>
      </div>
    );
  }

  const p = dashboard?.profile;
  const s = dashboard?.summary;
  const breakdown = dashboard?.scoreBreakdown;
  const problemsList: ProblemItem[] = dashboard?.problems || [];
  const coursework = dashboard?.coursework?.assignments || [];
  const doubts = dashboard?.doubtsStats;
  const platforms = dashboard?.platforms || {};
  const submissions = dashboard?.submissions;
  const ratingGraph = dashboard?.ratingGraph || [];

  // Coding Performance Stats & Chart Calculations
  const lcEasy = platforms.leetcode?.easy || 0;
  const lcMed = platforms.leetcode?.medium || 0;
  const lcHard = platforms.leetcode?.hard || 0;
  const lcTotal = platforms.leetcode?.totalSolved || (lcEasy + lcMed + lcHard);
  const ccTotal = platforms.codechef?.totalSolved || 0;
  const totalProblemsSolved = s?.problemsSolved || (lcTotal + ccTotal);
  const totalAttempted = s?.problemsAttempted || totalProblemsSolved;
  const accuracyRate = s?.accuracy ?? 100;

  const diffEasy = lcEasy;
  const diffMed = lcMed;
  const diffHard = lcHard;
  const diffSum = diffEasy + diffMed + diffHard;

  const easyPct = diffSum > 0 ? Math.round((diffEasy / diffSum) * 100) : 0;
  const medPct = diffSum > 0 ? Math.round((diffMed / diffSum) * 100) : 0;
  const hardPct = diffSum > 0 ? Math.max(0, 100 - easyPct - medPct) : 0;

  const circleCircumference = 251.327; // 2 * PI * 40
  const dashEasy = diffSum > 0 ? (diffEasy / diffSum) * circleCircumference : 0;
  const dashMed = diffSum > 0 ? (diffMed / diffSum) * circleCircumference : 0;
  const dashHard = diffSum > 0 ? (diffHard / diffSum) * circleCircumference : 0;

  const connectedPlatformCount = [
    platforms.leetcode?.connected,
    platforms.codechef?.connected,
    platforms.codeforces?.connected,
    platforms.hackerrank?.connected,
    platforms.github?.connected,
  ].filter(Boolean).length;

  // Filtered problems
  const filteredProblems = problemsList.filter((item) => {
    const matchesSearch =
      item.title.toLowerCase().includes(problemSearch.toLowerCase()) ||
      item.category.toLowerCase().includes(problemSearch.toLowerCase());
    const matchesDiff = difficultyFilter === "All" || item.difficulty === difficultyFilter;
    const matchesStatus = statusFilter === "All" || item.status === statusFilter;
    return matchesSearch && matchesDiff && matchesStatus;
  });

  return (
    <div className="min-h-screen bg-[#070b14] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37]/20 selection:text-[#E8C97A]">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-24 pb-20 space-y-10">
        {/* =========================================================================
            SECTION 1: HERO COMMAND DECK (Identity + Coding Performance Stats)
           ========================================================================= */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
          {/* Left: Student Identity & Academic Profile Card */}
          <div className="lg:col-span-7 glass-strong rounded-3xl border border-white/10 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden shadow-2xl">
            {/* Background Ambient Glow */}
            <div className="absolute top-0 right-0 w-80 h-80 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            <div>
              {/* Header: Status Pill & Edit CTA */}
              <div className="flex items-center justify-between gap-4 mb-6">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span>Student Profile</span>
                </div>
                <button
                  onClick={() => setIsEditModalOpen(true)}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-mono text-[var(--ink-dim)] hover:text-white transition-all cursor-pointer"
                >
                  <Edit3 className="w-3.5 h-3.5 text-[#D4AF37]" />
                  <span>Edit Profile</span>
                </button>
              </div>

              {/* Profile Avatar & Names */}
              <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5 mb-6">
                <div className="h-20 w-20 rounded-2xl bg-gradient-to-br from-[#D4AF37] via-[#9c784f] to-[#16213b] p-0.5 shadow-xl flex-shrink-0">
                  <div className="h-full w-full rounded-[14px] bg-[#070b14] flex items-center justify-center text-3xl font-bold font-serif text-[#E8C97A] overflow-hidden">
                    {p?.avatar ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={p.avatar} alt={p.name} className="h-full w-full object-cover" />
                    ) : (
                      p?.name?.charAt(0).toUpperCase() || "S"
                    )}
                  </div>
                </div>

                <div className="space-y-1">
                  <h1 className="text-2xl sm:text-3xl font-bold text-white tracking-tight font-display">
                    {p?.name || "Student"}
                  </h1>
                  <p className="text-xs font-mono text-[var(--ink-dim)]">
                    {p?.rollNo ? (
                      <span className="text-[#E8C97A] font-semibold">{p.rollNo} • </span>
                    ) : null}
                    {p?.email}
                  </p>
                  <p className="text-xs text-[var(--ink-dim)] italic font-serif pt-1 max-w-xl line-clamp-2">
                    {p?.bio || "No bio added yet. Click Edit Profile to add your developer headline."}
                  </p>
                </div>
              </div>

              {/* Academic Credentials Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 py-4 border-y border-white/5 font-mono text-xs">
                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider block">University</span>
                  <p className="font-semibold text-white truncate" title={p?.collegeName || "Not Specified"}>
                    {p?.collegeName || "Not Specified"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider block">Department</span>
                  <p className="font-semibold text-white truncate" title={p?.stream || "Not Specified"}>
                    {p?.stream || "Not Specified"}
                  </p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider block">Primary Tech</span>
                  <p className="font-bold text-[#E8C97A]">{p?.primaryLanguage || "Not Specified"}</p>
                </div>

                <div className="space-y-0.5">
                  <span className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider block">Class Of</span>
                  <p className="font-semibold text-white">{p?.graduationYear || "Not Specified"}</p>
                </div>
              </div>
            </div>

            {/* Quick Actions Footer */}
            <div className="pt-5 flex items-center justify-between flex-wrap gap-3">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--ink-faint)]">Status:</span>
                <span className="text-xs font-mono text-emerald-400 font-semibold">Active Account</span>
              </div>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[rgba(212,175,55,0.12)] hover:bg-[rgba(212,175,55,0.2)] border border-[rgba(212,175,55,0.35)] text-[#E8C97A] text-xs font-mono font-medium transition-all cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Link Platforms</span>
              </button>
            </div>
          </div>

          {/* Right: Coding Performance & Problem Distribution Hero */}
          <div className="lg:col-span-5 glass-strong rounded-3xl border border-[rgba(212,175,55,0.3)] p-6 sm:p-7 flex flex-col justify-between relative overflow-hidden shadow-2xl bg-gradient-to-b from-[#0d1527] to-[#070b14]">
            {/* Ambient Background Glow */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

            {/* Top Header: Title & View Mode Switcher */}
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                {codingChartType === "pie" ? (
                  <PieChart className="w-4 h-4 text-[#D4AF37]" />
                ) : (
                  <BarChart3 className="w-4 h-4 text-[#D4AF37]" />
                )}
                <span className="text-xs font-mono uppercase tracking-wider text-[#E8C97A] font-bold">
                  Coding Performance Stats
                </span>
              </div>

              {/* Chart Toggle: Pie Chart vs Bar Graph */}
              <div className="inline-flex items-center p-0.5 rounded-xl bg-white/5 border border-white/10 font-mono text-[11px]">
                <button
                  type="button"
                  onClick={() => setCodingChartType("pie")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    codingChartType === "pie"
                      ? "bg-[rgba(212,175,55,0.2)] text-[#E8C97A] border border-[rgba(212,175,55,0.4)] font-bold shadow-sm"
                      : "text-[var(--ink-dim)] hover:text-white border border-transparent"
                  }`}
                  title="View Problem Difficulty Pie Chart"
                >
                  <PieChart className="w-3 h-3" />
                  <span>Pie Chart</span>
                </button>
                <button
                  type="button"
                  onClick={() => setCodingChartType("bar")}
                  className={`px-2.5 py-1 rounded-lg transition-all flex items-center gap-1.5 cursor-pointer ${
                    codingChartType === "bar"
                      ? "bg-[rgba(212,175,55,0.2)] text-[#E8C97A] border border-[rgba(212,175,55,0.4)] font-bold shadow-sm"
                      : "text-[var(--ink-dim)] hover:text-white border border-transparent"
                  }`}
                  title="View Platform Breakdown Bar Graph"
                >
                  <BarChart3 className="w-3 h-3" />
                  <span>Bar Graph</span>
                </button>
              </div>
            </div>

            {/* Core Stats KPI Header */}
            <div className="flex items-center justify-between gap-4 pb-3 border-b border-white/10">
              <div>
                <div className="text-4xl sm:text-5xl font-black font-mono tracking-tight text-white flex items-baseline gap-2">
                  <span className="bg-gradient-to-r from-white via-[#E8C97A] to-[#D4AF37] bg-clip-text text-transparent">
                    {totalProblemsSolved}
                  </span>
                  <span className="text-xs font-mono text-[var(--ink-faint)] font-normal">solved</span>
                </div>
                <p className="text-[11px] font-mono text-[var(--ink-dim)] mt-0.5">
                  Across {connectedPlatformCount || 1} Connected Platform{connectedPlatformCount !== 1 ? "s" : ""}
                </p>
              </div>

              <div className="text-right font-mono">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-500/10 border border-emerald-500/25 text-emerald-400">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>{accuracyRate}% Accuracy</span>
                </span>
                <p className="text-[10px] text-[var(--ink-faint)] mt-1">
                  {totalAttempted} Attempts Tracked
                </p>
              </div>
            </div>

            {/* Dynamic View: Pie Chart vs Bar Graph */}
            {codingChartType === "pie" ? (
              /* ==================== PIE / DONUT CHART VIEW ==================== */
              <div className="my-auto py-3">
                <div className="flex items-center justify-between gap-4">
                  {/* SVG Donut Chart */}
                  <div className="relative w-28 h-28 sm:w-32 sm:h-32 flex-shrink-0 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                      {/* Background track circle */}
                      <circle
                        cx="50"
                        cy="50"
                        r="40"
                        stroke="rgba(255, 255, 255, 0.07)"
                        strokeWidth="11"
                        fill="none"
                      />
                      {/* Easy segment */}
                      {diffSum > 0 && dashEasy > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#10b981"
                          strokeWidth="11"
                          strokeDasharray={`${dashEasy} ${circleCircumference}`}
                          strokeDashoffset={0}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-700"
                        />
                      )}
                      {/* Medium segment */}
                      {diffSum > 0 && dashMed > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#f59e0b"
                          strokeWidth="11"
                          strokeDasharray={`${dashMed} ${circleCircumference}`}
                          strokeDashoffset={-dashEasy}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-700"
                        />
                      )}
                      {/* Hard segment */}
                      {diffSum > 0 && dashHard > 0 && (
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="#ef4444"
                          strokeWidth="11"
                          strokeDasharray={`${dashHard} ${circleCircumference}`}
                          strokeDashoffset={-(dashEasy + dashMed)}
                          strokeLinecap="round"
                          fill="none"
                          className="transition-all duration-700"
                        />
                      )}
                    </svg>

                    {/* Donut Center Content */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                      <span className="text-base sm:text-lg font-black font-mono text-white leading-none">
                        {diffSum > 0 ? diffSum : totalProblemsSolved}
                      </span>
                      <span className="text-[9px] font-mono uppercase tracking-wider text-[var(--ink-faint)] mt-0.5">
                        {diffSum > 0 ? "Categorized" : "Total"}
                      </span>
                    </div>
                  </div>

                  {/* Difficulty Breakdown Metrics */}
                  <div className="flex-1 space-y-2 font-mono">
                    {/* Easy */}
                    <div className="bg-white/5 border border-emerald-500/20 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_6px_rgba(52,211,153,0.8)]" />
                          Easy
                        </span>
                        <span className="text-white font-bold">
                          {diffEasy} <span className="text-[var(--ink-faint)] font-normal text-[10px]">({easyPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${easyPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Medium */}
                    <div className="bg-white/5 border border-amber-500/20 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-amber-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_6px_rgba(251,191,36,0.8)]" />
                          Medium
                        </span>
                        <span className="text-white font-bold">
                          {diffMed} <span className="text-[var(--ink-faint)] font-normal text-[10px]">({medPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-amber-400 rounded-full transition-all duration-500"
                          style={{ width: `${medPct}%` }}
                        />
                      </div>
                    </div>

                    {/* Hard */}
                    <div className="bg-white/5 border border-rose-500/20 rounded-xl p-2 sm:p-2.5">
                      <div className="flex items-center justify-between text-xs mb-1">
                        <span className="flex items-center gap-1.5 text-rose-400 font-semibold">
                          <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_6px_rgba(244,63,94,0.8)]" />
                          Hard
                        </span>
                        <span className="text-white font-bold">
                          {diffHard} <span className="text-[var(--ink-faint)] font-normal text-[10px]">({hardPct}%)</span>
                        </span>
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-white/10 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-rose-500 to-rose-400 rounded-full transition-all duration-500"
                          style={{ width: `${hardPct}%` }}
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Sub-note */}
                <p className="text-[10px] font-mono text-[var(--ink-faint)] mt-2.5 text-center">
                  Difficulty breakdown reflects verified solves across linked accounts.
                </p>
              </div>
            ) : (
              /* ==================== BAR GRAPH VIEW ==================== */
              <div className="my-auto py-2.5 space-y-3 font-mono">
                {/* LeetCode Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      LeetCode
                      {platforms.leetcode?.handle && (
                        <span className="text-[var(--ink-faint)] font-normal text-[10px]">
                          (@{platforms.leetcode.handle})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-white">
                      {lcTotal} <span className="text-[var(--ink-faint)] font-normal text-[10px]">solved</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 via-amber-400 to-[#E8C97A] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (lcTotal / Math.max(totalProblemsSolved, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--ink-dim)]">
                    <span>Breakdown: {lcEasy} Easy • {lcMed} Medium • {lcHard} Hard</span>
                    <span>{Math.round((lcTotal / Math.max(totalProblemsSolved, 1)) * 100)}% share</span>
                  </div>
                </div>

                {/* CodeChef Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#d97706]" />
                      CodeChef
                      {platforms.codechef?.handle && (
                        <span className="text-[var(--ink-faint)] font-normal text-[10px]">
                          (@{platforms.codechef.handle})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-white">
                      {ccTotal} <span className="text-[var(--ink-faint)] font-normal text-[10px]">solved</span>
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-[#b45309] via-[#d97706] to-[#f59e0b] rounded-full transition-all duration-500"
                      style={{
                        width: `${Math.min(
                          (ccTotal / Math.max(totalProblemsSolved, 1)) * 100,
                          100
                        )}%`,
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--ink-dim)]">
                    <span>
                      Rating: {platforms.codechef?.rating || "N/A"} ({platforms.codechef?.stars || "Unrated"})
                    </span>
                    <span>{Math.round((ccTotal / Math.max(totalProblemsSolved, 1)) * 100)}% share</span>
                  </div>
                </div>

                {/* Codeforces / Other Platforms Status Bar */}
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-[var(--ink)] font-semibold flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-cyan-400" />
                      Codeforces
                      {platforms.codeforces?.handle && (
                        <span className="text-[var(--ink-faint)] font-normal text-[10px]">
                          (@{platforms.codeforces.handle})
                        </span>
                      )}
                    </span>
                    <span className="font-bold text-cyan-300">
                      {platforms.codeforces?.connected
                        ? `Rating: ${platforms.codeforces.rating || "Unrated"}`
                        : "Not Linked"}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-600 to-cyan-400 rounded-full transition-all duration-500"
                      style={{
                        width: platforms.codeforces?.connected ? "60%" : "0%",
                      }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-[var(--ink-dim)]">
                    <span>Rank: {platforms.codeforces?.rank || (platforms.codeforces?.connected ? "Participant" : "Link in accounts")}</span>
                    <span>{platforms.codeforces?.connected ? "Active" : "Inactive"}</span>
                  </div>
                </div>

                {/* Segmented Cumulative Difficulty Bar */}
                <div className="pt-2 border-t border-white/5 space-y-1">
                  <div className="flex items-center justify-between text-[10px] text-[var(--ink-faint)]">
                    <span>Difficulty Split</span>
                    <span>{easyPct}% Easy • {medPct}% Medium • {hardPct}% Hard</span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-white/10 overflow-hidden flex">
                    <div className="h-full bg-emerald-500 transition-all duration-500" style={{ width: `${easyPct}%` }} title={`Easy: ${diffEasy}`} />
                    <div className="h-full bg-amber-500 transition-all duration-500" style={{ width: `${medPct}%` }} title={`Medium: ${diffMed}`} />
                    <div className="h-full bg-rose-500 transition-all duration-500" style={{ width: `${hardPct}%` }} title={`Hard: ${diffHard}`} />
                  </div>
                </div>
              </div>
            )}

            {/* Bottom Footer: Platform Quick Status & Manage Platforms CTA */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between flex-wrap gap-2 text-xs font-mono">
              <div className="flex items-center gap-3">
                <span className="text-[10px] uppercase text-[var(--ink-faint)] tracking-wider">
                  Sync:
                </span>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      platforms.leetcode?.connected ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                  <span className="text-[11px] text-[var(--ink-dim)]">LeetCode</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span
                    className={`w-1.5 h-1.5 rounded-full ${
                      platforms.codechef?.connected ? "bg-emerald-400" : "bg-white/20"
                    }`}
                  />
                  <span className="text-[11px] text-[var(--ink-dim)]">CodeChef</span>
                </div>
              </div>

              <button
                onClick={() => setIsSyncModalOpen(true)}
                className="inline-flex items-center gap-1 text-[11px] text-[#E8C97A] hover:text-white transition-colors cursor-pointer"
              >
                <span>Manage Accounts</span>
                <ArrowUpRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 2: MULTI-PLATFORM CONNECTED ECOSYSTEM
           ========================================================================= */}
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-white font-display flex items-center gap-2">
                <Layers className="w-4 h-4 text-[#D4AF37]" />
                <span>Connected Coding Ecosystem</span>
              </h2>
              <p className="text-xs text-[var(--ink-dim)] font-mono">
                Real-time external competitive profiles synced into your Cryptic-to-Clear score.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={handleRefreshLiveStats}
                disabled={actionLoading}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-300 hover:text-white text-xs font-mono transition-all cursor-pointer shadow-sm disabled:opacity-50"
                title="Fetch latest solved problems and ratings from LeetCode and CodeChef"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${actionLoading ? "animate-spin text-amber-400" : ""}`} />
                <span>Sync Live Stats</span>
              </button>
              <button
                onClick={() => openPlatformModal("leetcode")}
                className="text-xs font-mono text-[#E8C97A] hover:underline flex items-center gap-1 cursor-pointer"
              >
                <span>Manage Handles</span>
                <ArrowUpRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            {/* LeetCode Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-amber-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-amber-400 font-mono tracking-wide">LeetCode</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platforms.leetcode?.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`}
                  />
                </div>
                {platforms.leetcode?.connected ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white truncate font-mono">
                      @{platforms.leetcode.handle}
                    </p>
                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-[var(--ink-dim)]">Solved:</span>
                      <span className="text-white font-bold">{platforms.leetcode.totalSolved || 0}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-1 text-[10px] font-mono text-center pt-1">
                      <div className="bg-emerald-500/10 text-emerald-400 py-0.5 rounded">E: {platforms.leetcode.easy || 0}</div>
                      <div className="bg-amber-500/10 text-amber-400 py-0.5 rounded">M: {platforms.leetcode.medium || 0}</div>
                      <div className="bg-rose-500/10 text-rose-400 py-0.5 rounded">H: {platforms.leetcode.hard || 0}</div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[var(--ink-faint)] font-mono">Not Connected</p>
                    <button
                      onClick={() => openPlatformModal("leetcode")}
                      className="text-[11px] font-mono text-amber-400 hover:underline"
                    >
                      + Connect LeetCode
                    </button>
                  </div>
                )}
              </div>
              {platforms.leetcode?.connected && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[var(--ink-faint)]">
                  <a
                    href={`https://leetcode.com/${platforms.leetcode.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-400 flex items-center gap-1"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => openPlatformModal("leetcode")}
                    className="text-amber-400/80 hover:text-amber-400 underline text-[10px]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* Codeforces Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-cyan-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-cyan-400 font-mono tracking-wide">Codeforces</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platforms.codeforces?.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`}
                  />
                </div>
                {platforms.codeforces?.connected ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white truncate font-mono">
                      @{platforms.codeforces.handle}
                    </p>
                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-[var(--ink-dim)]">Rating:</span>
                      <span className="text-cyan-400 font-bold">{platforms.codeforces.rating || "Unrated"}</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="text-[var(--ink-dim)]">Rank:</span>
                      <span className="text-white capitalize font-semibold">{platforms.codeforces.rank || "Newbie"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[var(--ink-faint)] font-mono">Not Connected</p>
                    <button
                      onClick={() => openPlatformModal("codeforces")}
                      className="text-[11px] font-mono text-cyan-400 hover:underline"
                    >
                      + Connect Codeforces
                    </button>
                  </div>
                )}
              </div>
              {platforms.codeforces?.connected && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[var(--ink-faint)]">
                  <a
                    href={`https://codeforces.com/profile/${platforms.codeforces.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-cyan-400 flex items-center gap-1"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => openPlatformModal("codeforces")}
                    className="text-cyan-400/80 hover:text-cyan-400 underline text-[10px]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* CodeChef Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-amber-600/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-amber-500 font-mono tracking-wide">CodeChef</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platforms.codechef?.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`}
                  />
                </div>
                {platforms.codechef?.connected ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white truncate font-mono">
                      @{platforms.codechef.handle}
                    </p>
                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-[var(--ink-dim)]">Stars:</span>
                      <span className="text-amber-400 font-bold">{platforms.codechef.stars || "Unrated"}</span>
                    </div>
                    <div className="flex items-baseline justify-between text-xs font-mono">
                      <span className="text-[var(--ink-dim)]">Rating:</span>
                      <span className="text-white font-semibold">{platforms.codechef.rating || "N/A"}</span>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[var(--ink-faint)] font-mono">Not Connected</p>
                    <button
                      onClick={() => openPlatformModal("codechef")}
                      className="text-[11px] font-mono text-amber-500 hover:underline"
                    >
                      + Connect CodeChef
                    </button>
                  </div>
                )}
              </div>
              {platforms.codechef?.connected && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[var(--ink-faint)]">
                  <a
                    href={`https://www.codechef.com/users/${platforms.codechef.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-amber-500 flex items-center gap-1"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => openPlatformModal("codechef")}
                    className="text-amber-400/80 hover:text-amber-400 underline text-[10px]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* HackerRank Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-emerald-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-emerald-400 font-mono tracking-wide">HackerRank</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platforms.hackerrank?.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`}
                  />
                </div>
                {platforms.hackerrank?.connected ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white truncate font-mono">
                      @{platforms.hackerrank.handle}
                    </p>
                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-[var(--ink-dim)]">Status:</span>
                      <span className="text-emerald-400 font-bold">Connected</span>
                    </div>
                    <div className="text-[10px] font-mono text-[var(--ink-faint)] truncate">
                      Profile Active
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[var(--ink-faint)] font-mono">Not Connected</p>
                    <button
                      onClick={() => openPlatformModal("hackerrank")}
                      className="text-[11px] font-mono text-emerald-400 hover:underline"
                    >
                      + Connect HackerRank
                    </button>
                  </div>
                )}
              </div>
              {platforms.hackerrank?.connected && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[var(--ink-faint)]">
                  <a
                    href={`https://www.hackerrank.com/${platforms.hackerrank.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-emerald-400 flex items-center gap-1"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => openPlatformModal("hackerrank")}
                    className="text-emerald-400/80 hover:text-emerald-400 underline text-[10px]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>

            {/* GitHub Card */}
            <div className="glass-panel p-4 rounded-2xl border border-white/5 hover:border-purple-500/30 transition-all flex flex-col justify-between group">
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="font-bold text-xs text-purple-400 font-mono tracking-wide">GitHub</span>
                  <span
                    className={`w-2 h-2 rounded-full ${
                      platforms.github?.connected ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.5)]" : "bg-white/20"
                    }`}
                  />
                </div>
                {platforms.github?.connected ? (
                  <div className="space-y-2">
                    <p className="text-sm font-bold text-white truncate font-mono">
                      @{platforms.github.handle}
                    </p>
                    <div className="flex items-baseline justify-between text-xs font-mono pt-1">
                      <span className="text-[var(--ink-dim)]">Status:</span>
                      <span className="text-purple-400 font-bold">Connected</span>
                    </div>
                    <div className="text-[10px] font-mono text-emerald-400 truncate">
                      Profile Active
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 space-y-2">
                    <p className="text-xs text-[var(--ink-faint)] font-mono">Not Connected</p>
                    <button
                      onClick={() => openPlatformModal("github")}
                      className="text-[11px] font-mono text-purple-400 hover:underline"
                    >
                      + Connect GitHub
                    </button>
                  </div>
                )}
              </div>
              {platforms.github?.connected && (
                <div className="mt-3 pt-2 border-t border-white/5 flex items-center justify-between text-[11px] font-mono text-[var(--ink-faint)]">
                  <a
                    href={`https://github.com/${platforms.github.handle}`}
                    target="_blank"
                    rel="noreferrer"
                    className="hover:text-purple-400 flex items-center gap-1"
                  >
                    <span>Public Profile</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                  <button
                    onClick={() => openPlatformModal("github")}
                    className="text-purple-400/80 hover:text-purple-400 underline text-[10px]"
                  >
                    Edit
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 3: 4-PILLAR CORE METRICS DECK
           ========================================================================= */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Problems Solved */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">Problems Solved</span>
              <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400">
                <Code2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">
                {s?.problemsSolved ?? 0}
              </div>
              <p className="text-xs font-mono text-[var(--ink-faint)] mt-1">
                Out of <span className="text-white font-semibold">{s?.problemsAttempted ?? 0}</span> attempted
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div
                className="h-full bg-amber-400 rounded-full"
                style={{
                  width: s?.problemsAttempted ? `${Math.min(((s?.problemsSolved || 0) / s.problemsAttempted) * 100, 100)}%` : "0%",
                }}
              />
            </div>
          </div>

          {/* Metric 2: Evaluation Accuracy */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">Precision Ratio</span>
              <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
                <Target className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white">
                {s?.accuracy ?? 0}%
              </div>
              <p className="text-xs font-mono text-emerald-400 mt-1">
                Optimal time & memory complexity
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-emerald-400 rounded-full" style={{ width: `${s?.accuracy || 0}%` }} />
            </div>
          </div>

          {/* Metric 3: Active Coding Streak */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">Coding Streak</span>
              <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
                <Flame className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white flex items-center gap-2">
                <span>{s?.currentStreak ?? 0} Days</span>
                <span className="text-xs font-normal text-rose-400 font-mono">🔥</span>
              </div>
              <p className="text-xs font-mono text-[var(--ink-faint)] mt-1">
                Personal record: <span className="text-white font-semibold">{s?.longestStreak ?? 0} days</span>
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-rose-500 rounded-full" style={{ width: s?.currentStreak ? "100%" : "0%" }} />
            </div>
          </div>

          {/* Metric 4: Community Karma & Doubts */}
          <div className="glass-panel p-5 rounded-2xl border border-white/5 space-y-3 relative overflow-hidden">
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">Community Karma</span>
              <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400">
                <Award className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="text-3xl font-bold font-mono text-white flex items-center gap-1.5">
                <span className="text-purple-400 font-black">{doubts?.karma ?? p?.karmaPoints ?? 0}</span>
                <span className="text-xs font-mono text-[var(--ink-faint)] font-normal">pts</span>
              </div>
              <p className="text-xs font-mono text-[var(--ink-faint)] mt-1">
                <span className="text-white font-semibold">{doubts?.accepted ?? 0}</span> endorsed solutions provided
              </p>
            </div>
            <div className="w-full h-1.5 rounded-full bg-white/5 overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: doubts?.karma ? "100%" : "0%" }} />
            </div>
          </div>
        </section>

        {/* =========================================================================
            SECTION 4: COMMAND CENTER WORKSPACE (4 TABS)
           ========================================================================= */}
        <section className="space-y-6">
          {/* Navigation Bar */}
          <div className="flex items-center justify-between border-b border-white/10 pb-4 overflow-x-auto gap-4">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab("problems")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "problems"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[var(--ink-dim)] hover:text-white hover:bg-white/10"
                }`}
              >
                <Code2 className="w-3.5 h-3.5" />
                <span>Problem Archives ({problemsList.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("coursework")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "coursework"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[var(--ink-dim)] hover:text-white hover:bg-white/10"
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Academic Labs ({coursework.length})</span>
              </button>

              <button
                onClick={() => setActiveTab("community")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "community"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[var(--ink-dim)] hover:text-white hover:bg-white/10"
                }`}
              >
                <HelpCircle className="w-3.5 h-3.5" />
                <span>Community & Karma ({doubts?.asked || 0} asked, {doubts?.answered || 0} solved)</span>
              </button>

              <button
                onClick={() => setActiveTab("analytics")}
                className={`px-4 py-2 rounded-xl text-xs font-mono font-semibold transition-all cursor-pointer flex items-center gap-2 ${
                  activeTab === "analytics"
                    ? "bg-[#D4AF37] text-black shadow-lg shadow-[#D4AF37]/20"
                    : "bg-white/5 text-[var(--ink-dim)] hover:text-white hover:bg-white/10"
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>Skill Radar & Analytics</span>
              </button>
            </div>
          </div>

          {/* TAB 1: PROBLEM ARCHIVES & SOLVES */}
          {activeTab === "problems" && (
            <div className="space-y-4">
              {/* Search & Filters */}
              <div className="flex flex-col sm:flex-row items-center justify-between gap-3 glass-panel p-3.5 rounded-2xl border border-white/5">
                <div className="relative w-full sm:w-80">
                  <Search className="w-4 h-4 text-[var(--ink-faint)] absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search by title or topic (e.g. Binary Search, DP)..."
                    value={problemSearch}
                    onChange={(e) => setProblemSearch(e.target.value)}
                    className="w-full bg-black/40 border border-white/10 rounded-xl pl-9 pr-3 py-1.5 text-xs font-mono text-white placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto overflow-x-auto">
                  {/* Difficulty Filter */}
                  <select
                    value={difficultyFilter}
                    onChange={(e) => setDifficultyFilter(e.target.value)}
                    aria-label="Filter problems by difficulty"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="All">All Difficulties</option>
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>

                  {/* Status Filter */}
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    aria-label="Filter problems by status"
                    className="bg-black/40 border border-white/10 rounded-xl px-3 py-1.5 text-xs font-mono text-white focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="All">All Statuses</option>
                    <option value="Accepted">Accepted Only</option>
                    <option value="Attempted">Attempted Only</option>
                  </select>
                </div>
              </div>

              {/* Problems Cards Table */}
              <div className="glass-strong rounded-2xl border border-white/5 overflow-hidden">
                <div className="divide-y divide-white/5">
                  {filteredProblems.length > 0 ? (
                    filteredProblems.map((prob) => (
                      <div
                        key={prob.id}
                        className="p-4 sm:p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 hover:bg-white/[0.02] transition-colors"
                      >
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2.5 flex-wrap">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                                prob.difficulty === "Easy"
                                  ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                  : prob.difficulty === "Medium"
                                  ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                  : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                              }`}
                            >
                              {prob.difficulty}
                            </span>
                            <span className="text-sm font-bold text-white font-mono hover:text-[#E8C97A] transition-colors">
                              {prob.title}
                            </span>
                            <span className="px-2 py-0.5 rounded-full bg-white/5 text-[10px] font-mono text-[var(--ink-dim)]">
                              {prob.category}
                            </span>
                          </div>

                          <div className="flex items-center gap-4 text-xs font-mono text-[var(--ink-faint)]">
                            <span>Origin: <strong className="text-white">{prob.source}</strong></span>
                            <span>Time: <strong className="text-[#E8C97A]">{prob.timeComplexity}</strong></span>
                            <span>Accuracy: <strong className="text-emerald-400">{prob.accuracy}</strong></span>
                            <span>{prob.solvedAt}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-3 w-full sm:w-auto justify-end">
                          <span
                            className={`text-xs font-mono px-2.5 py-1 rounded-lg ${
                              prob.status === "Accepted"
                                ? "text-emerald-400 bg-emerald-500/10 border border-emerald-500/20"
                                : "text-amber-400 bg-amber-500/10 border border-amber-500/20"
                            }`}
                          >
                            {prob.status}
                          </span>

                          <Link
                            href={prob.problemUrl || "/compiler"}
                            className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-white/10 text-xs font-mono text-white transition-all flex items-center gap-1.5"
                          >
                            <span>Solve</span>
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </Link>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="p-16 text-center space-y-3">
                      <Code2 className="w-10 h-10 text-[var(--ink-faint)] mx-auto opacity-40" />
                      <h4 className="text-sm font-bold text-white font-mono">No Problems Solved Yet</h4>
                      <p className="text-xs font-mono text-[var(--ink-dim)] max-w-md mx-auto">
                        Solve coding problems in the Cryptic to Clear compiler or link your LeetCode / Codeforces accounts to see your solved archive here.
                      </p>
                      <div className="pt-2">
                        <Link
                          href="/compiler"
                          className="btn-gold px-4 py-2 rounded-xl text-xs font-bold text-black inline-flex items-center gap-2"
                        >
                          <Zap className="w-3.5 h-3.5" />
                          <span>Open Code Compiler</span>
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACADEMIC LABS & COURSEWORK */}
          {activeTab === "coursework" && (
            <div>
              {coursework.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {coursework.map((lab: any) => (
                    <div
                      key={lab.id}
                      className="glass-panel p-5 rounded-2xl border border-white/5 hover:border-[#D4AF37]/30 transition-all flex flex-col justify-between space-y-4"
                    >
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-[11px] font-mono text-[var(--ink-faint)] uppercase tracking-wider">
                            {lab.courseName}
                          </span>
                          <span
                            className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded ${
                              lab.status === "Graded"
                                ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                                : lab.status === "Submitted"
                                ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20"
                                : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            }`}
                          >
                            {lab.status}
                          </span>
                        </div>
                        <h3 className="text-sm font-bold text-white font-mono">{lab.title}</h3>
                        <p className="text-xs font-mono text-[var(--ink-dim)]">
                          Deadline: <span className="text-white">{lab.deadline}</span>
                        </p>
                      </div>

                      <div className="pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          {lab.grade ? (
                            <span className="text-xs font-mono text-[#E8C97A] font-bold">Grade: {lab.grade}</span>
                          ) : (
                            <span className="text-xs font-mono text-[var(--ink-faint)]">Pending Submission</span>
                          )}
                        </div>
                        <Link
                          href="/compiler"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-[#D4AF37] hover:text-black border border-white/10 text-xs font-mono text-white transition-all"
                        >
                          <span>Open in Compiler</span>
                          <ArrowUpRight className="w-3.5 h-3.5" />
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="glass-panel p-16 rounded-2xl border border-white/5 text-center space-y-3">
                  <BookOpen className="w-10 h-10 text-[var(--ink-faint)] mx-auto opacity-40" />
                  <h4 className="text-sm font-bold text-white font-mono">No Lab Assignments Assigned Yet</h4>
                  <p className="text-xs font-mono text-[var(--ink-dim)] max-w-md mx-auto">
                    When instructors publish coursework or laboratory tasks for your class, they will appear here with live evaluation status.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: COMMUNITY & DOUBTS */}
          {activeTab === "community" && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Community Summary */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center gap-2">
                  <Award className="w-5 h-5 text-purple-400" />
                  <h3 className="font-bold text-white font-mono text-sm">Karma Reputation</h3>
                </div>
                <div className="text-4xl font-black font-mono text-purple-400">
                  {doubts?.karma ?? 0} <span className="text-xs font-normal text-[var(--ink-faint)]">Karma</span>
                </div>
                <p className="text-xs font-mono text-[var(--ink-dim)] leading-relaxed">
                  Earn karma by answering fellow students’ coding queries, resolving bugs, and having your solutions accepted.
                </p>
                <div className="pt-2">
                  <Link
                    href="/doubts"
                    className="w-full inline-flex items-center justify-center gap-2 py-2 rounded-xl bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/30 text-xs font-mono font-bold transition-all"
                  >
                    <span>Browse Campus Doubts</span>
                    <ArrowUpRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>

              {/* Doubts Asked Ledger */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white font-mono text-sm">Questions Asked</h3>
                  <span className="text-sm font-bold text-white font-mono">{doubts?.asked ?? 0}</span>
                </div>
                <p className="text-xs font-mono text-[var(--ink-dim)]">
                  Your questions resolved by instructors and peers.
                </p>
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs font-mono text-[var(--ink-faint)]">
                    No doubts asked yet. Need help with an algorithm? Ask in the community!
                  </p>
                </div>
              </div>

              {/* Doubts Answered Ledger */}
              <div className="glass-panel p-6 rounded-2xl border border-white/5 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-white font-mono text-sm">Answers Provided</h3>
                  <span className="text-sm font-bold text-emerald-400 font-mono">{doubts?.answered ?? 0}</span>
                </div>
                <p className="text-xs font-mono text-[var(--ink-dim)]">
                  Solutions accepted & upvoted by classmates.
                </p>
                <div className="p-8 text-center border border-dashed border-white/10 rounded-xl">
                  <p className="text-xs font-mono text-[var(--ink-faint)]">
                    No answers posted yet. Help your peers resolve doubts to gain karma!
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: ANALYTICS & SKILL RADAR */}
          {activeTab === "analytics" && (
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Rating Timeline Graph */}
              <div className="lg:col-span-8 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-[#D4AF37]" />
                      <span>Rating Progression Trajectory</span>
                    </h3>
                    <p className="text-xs text-[var(--ink-dim)] font-mono">
                      Algorithmic skill score progression over past competition seasons.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-[#E8C97A] font-bold">
                    Current: {breakdown?.overallScore ?? 0}
                  </span>
                </div>

                {ratingGraph.length > 0 ? (
                  <div className="h-56 w-full pt-4">
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 700 200">
                      <defs>
                        <linearGradient id="curveGradient" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.3" />
                          <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>

                      <line x1="0" y1="40" x2="700" y2="40" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                      <line x1="0" y1="100" x2="700" y2="100" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />
                      <line x1="0" y1="160" x2="700" y2="160" stroke="rgba(255,255,255,0.05)" strokeDasharray="4 4" />

                      {ratingGraph.map((item, idx) => {
                        const x = 350;
                        const y = 100;
                        return (
                          <g key={item.month}>
                            <circle cx={x} cy={y} r="6" fill="#070b14" stroke="#E8C97A" strokeWidth="3" />
                            <text x={x} y="190" textAnchor="middle" fill="#94a3b8" fontSize="12" fontFamily="monospace">
                              {item.month}
                            </text>
                            <text x={x} y={y - 14} textAnchor="middle" fill="#ffffff" fontSize="12" fontFamily="monospace" fontWeight="bold">
                              {item.rating} pts
                            </text>
                          </g>
                        );
                      })}
                    </svg>
                  </div>
                ) : (
                  <div className="h-56 flex flex-col items-center justify-center text-center p-8 border border-dashed border-white/10 rounded-xl space-y-2">
                    <BarChart3 className="w-8 h-8 text-[var(--ink-faint)] opacity-40" />
                    <p className="text-xs font-mono text-[var(--ink-dim)]">
                      Rating progression will activate as you solve problems and link competitive coding platforms.
                    </p>
                  </div>
                )}
              </div>

              {/* Language Mastery */}
              <div className="lg:col-span-4 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>Language Proficiency</span>
                </h3>
                {submissions?.languages && submissions.languages.length > 0 ? (
                  <div className="space-y-3 pt-2">
                    {submissions.languages.map((lang) => (
                      <div key={lang.language} className="space-y-1">
                        <div className="flex items-center justify-between text-xs font-mono">
                          <span className="text-white font-semibold">{lang.language}</span>
                          <span className="text-[var(--ink-dim)]">{lang.submissions} submissions ({lang.percentage}%)</span>
                        </div>
                        <div className="w-full h-2 rounded-full bg-white/5 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${lang.percentage}%`,
                              backgroundColor: lang.color || "#D4AF37",
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs font-mono text-[var(--ink-dim)] border border-dashed border-white/10 rounded-xl">
                    No submissions recorded yet. Execute code in the compiler to track languages.
                  </div>
                )}
              </div>

              {/* DSA Topic Mastery Radar */}
              <div className="lg:col-span-12 glass-panel p-6 rounded-2xl border border-white/5 space-y-4">
                <h3 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                  <Compass className="w-4 h-4 text-emerald-400" />
                  <span>Data Structures & Algorithmic Domain Mastery</span>
                </h3>
                {submissions?.topics && submissions.topics.length > 0 ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 pt-1 font-mono text-xs">
                    {submissions.topics.map((top) => (
                      <div key={top.tag} className="p-3 rounded-xl bg-white/[0.02] border border-white/5 space-y-1">
                        <span className="text-[10px] uppercase text-[var(--ink-faint)] block truncate">{top.tag}</span>
                        <p className="text-base font-bold text-white">{top.count} <span className="text-[10px] font-normal text-[var(--ink-dim)]">solved</span></p>
                        <span
                          className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold"
                          style={{ backgroundColor: `${top.color}15`, color: top.color }}
                        >
                          {top.proficiency}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="py-8 text-center text-xs font-mono text-[var(--ink-dim)] border border-dashed border-white/10 rounded-xl">
                    Algorithmic domain tags will populate as you solve challenges across different data structure categories.
                  </div>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* =========================================================================
          MODAL 1: EDIT STUDENT PROFILE
         ========================================================================= */}
      <AnimatePresence>
        {isEditModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1120] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-5"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <h3 className="text-lg font-bold text-white font-display">Edit Student Profile</h3>
                <button
                  onClick={() => setIsEditModalOpen(false)}
                  className="p-1 rounded-lg text-[var(--ink-dim)] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProfile} className="space-y-4 font-mono text-xs">
                <div>
                  <label className="block text-[var(--ink-dim)] mb-1">Full Name</label>
                  <input
                    type="text"
                    value={editForm.name}
                    onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    required
                  />
                </div>

                <div>
                  <label className="block text-[var(--ink-dim)] mb-1">Developer Bio / Headline</label>
                  <textarea
                    rows={2}
                    value={editForm.bio}
                    onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. Software engineering student passionate about algorithms and systems"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--ink-dim)] mb-1">College Roll / Reg No</label>
                    <input
                      type="text"
                      value={editForm.rollNo}
                      onChange={(e) => setEditForm({ ...editForm, rollNo: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. CS-2024-001"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--ink-dim)] mb-1">Primary Language</label>
                    <select
                      value={editForm.primaryLanguage}
                      onChange={(e) => setEditForm({ ...editForm, primaryLanguage: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="">Select language...</option>
                      <option value="Java">Java</option>
                      <option value="C++">C++</option>
                      <option value="Python">Python</option>
                      <option value="JavaScript">JavaScript</option>
                      <option value="TypeScript">TypeScript</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-[var(--ink-dim)] mb-1">College / University Name</label>
                  <input
                    type="text"
                    value={editForm.collegeName}
                    onChange={(e) => setEditForm({ ...editForm, collegeName: e.target.value })}
                    className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="e.g. University School of Engineering"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[var(--ink-dim)] mb-1">Stream / Department</label>
                    <input
                      type="text"
                      value={editForm.stream}
                      onChange={(e) => setEditForm({ ...editForm, stream: e.target.value })}
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. Computer Science"
                    />
                  </div>

                  <div>
                    <label className="block text-[var(--ink-dim)] mb-1">Graduation Year</label>
                    <input
                      type="number"
                      value={editForm.graduationYear}
                      onChange={(e) => setEditForm({ ...editForm, graduationYear: e.target.value ? parseInt(e.target.value, 10) : "" })}
                      placeholder="e.g. 2026"
                      className="w-full bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-[#D4AF37]"
                    />
                  </div>
                </div>

                {actionSuccess && (
                  <p className="text-emerald-400 font-semibold text-center">{actionSuccess}</p>
                )}

                <div className="pt-2 flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setIsEditModalOpen(false)}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={actionLoading}
                    className="btn-gold px-5 py-2 rounded-xl text-black font-bold font-mono"
                  >
                    {actionLoading ? "Saving..." : "Save Changes"}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* =========================================================================
          MODAL 2: LINK EXTERNAL CODING PLATFORMS
         ========================================================================= */}
      <AnimatePresence>
        {isSyncModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1120] border border-white/10 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative space-y-6"
            >
              {(() => {
                const configMap = {
                  leetcode: {
                    name: "LeetCode",
                    title: "Connect LeetCode Account",
                    subtitle: "Enter your public LeetCode handle to sync solved problems, submissions, and contest rating.",
                    labelColor: "text-amber-400",
                    accentBorder: "focus:border-amber-400",
                    badgeClass: "bg-amber-500/10 text-amber-400 border-amber-500/30",
                    activeTabClass: "bg-amber-500/20 text-amber-300 border-amber-500/50 shadow-[0_0_12px_rgba(245,158,11,0.25)]",
                    field: "leetcodeHandle" as const,
                    placeholder: "e.g. your_leetcode_handle",
                    connected: !!platforms.leetcode?.connected,
                    handle: platforms.leetcode?.handle,
                    profileUrl: platforms.leetcode?.handle ? `https://leetcode.com/${platforms.leetcode.handle}` : null,
                    benefits: "Syncs Easy, Medium, Hard problem solves and platform acceptance rate into your DevScore.",
                  },
                  codeforces: {
                    name: "Codeforces",
                    title: "Connect Codeforces Account",
                    subtitle: "Enter your public Codeforces handle to sync competitive rating, title rank, and contest solves.",
                    labelColor: "text-cyan-400",
                    accentBorder: "focus:border-cyan-400",
                    badgeClass: "bg-cyan-500/10 text-cyan-400 border-cyan-500/30",
                    activeTabClass: "bg-cyan-500/20 text-cyan-300 border-cyan-500/50 shadow-[0_0_12px_rgba(34,211,238,0.25)]",
                    field: "codeforcesHandle" as const,
                    placeholder: "e.g. your_codeforces_handle",
                    connected: !!platforms.codeforces?.connected,
                    handle: platforms.codeforces?.handle,
                    profileUrl: platforms.codeforces?.handle ? `https://codeforces.com/profile/${platforms.codeforces.handle}` : null,
                    benefits: "Syncs live rating, ranking tier (Pupil, Specialist, Master), and contest submission records.",
                  },
                  codechef: {
                    name: "CodeChef",
                    title: "Connect CodeChef Account",
                    subtitle: "Enter your public CodeChef handle to sync your star division, rating, and global ranking.",
                    labelColor: "text-amber-500",
                    accentBorder: "focus:border-amber-500",
                    badgeClass: "bg-amber-600/10 text-amber-500 border-amber-500/30",
                    activeTabClass: "bg-amber-600/20 text-amber-400 border-amber-500/50 shadow-[0_0_12px_rgba(217,119,6,0.25)]",
                    field: "codechefHandle" as const,
                    placeholder: "e.g. your_codechef_handle",
                    connected: !!platforms.codechef?.connected,
                    handle: platforms.codechef?.handle,
                    profileUrl: platforms.codechef?.handle ? `https://www.codechef.com/users/${platforms.codechef.handle}` : null,
                    benefits: "Syncs star tier (1★ to 7★), rating, and contest achievements into your Unified Developer Score.",
                  },
                  hackerrank: {
                    name: "HackerRank",
                    title: "Connect HackerRank Account",
                    subtitle: "Enter your public HackerRank username to sync verified problem solves and domain certifications.",
                    labelColor: "text-emerald-400",
                    accentBorder: "focus:border-emerald-400",
                    badgeClass: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
                    activeTabClass: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50 shadow-[0_0_12px_rgba(52,211,153,0.25)]",
                    field: "hackerrankHandle" as const,
                    placeholder: "e.g. your_hackerrank_handle",
                    connected: !!platforms.hackerrank?.connected,
                    handle: platforms.hackerrank?.handle,
                    profileUrl: platforms.hackerrank?.handle ? `https://www.hackerrank.com/${platforms.hackerrank.handle}` : null,
                    benefits: "Syncs skill badges, solved challenges, and verified domain badges.",
                  },
                  github: {
                    name: "GitHub",
                    title: "Connect GitHub Account",
                    subtitle: "Enter your public GitHub handle to sync public repositories, open-source activity, and contributions.",
                    labelColor: "text-purple-400",
                    accentBorder: "focus:border-purple-400",
                    badgeClass: "bg-purple-500/10 text-purple-400 border-purple-500/30",
                    activeTabClass: "bg-purple-500/20 text-purple-300 border-purple-500/50 shadow-[0_0_12px_rgba(192,132,252,0.25)]",
                    field: "githubHandle" as const,
                    placeholder: "e.g. your_github_username",
                    connected: !!platforms.github?.connected,
                    handle: platforms.github?.handle,
                    profileUrl: platforms.github?.handle ? `https://github.com/${platforms.github.handle}` : null,
                    benefits: "Syncs public repositories, stars, commit activity, and open-source contributions.",
                  },
                };

                const current = configMap[selectedPlatform];
                const platformsList: (keyof typeof configMap)[] = [
                  "leetcode",
                  "codeforces",
                  "codechef",
                  "hackerrank",
                  "github",
                ];

                return (
                  <>
                    {/* Modal Header */}
                    <div className="flex items-start justify-between border-b border-white/10 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase border ${current.badgeClass}`}>
                            {current.name}
                          </span>
                          {current.connected && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-mono text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Connected</span>
                            </span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-white font-display">
                          {current.title}
                        </h3>
                        <p className="text-xs text-[var(--ink-dim)] font-mono mt-1">
                          {current.subtitle}
                        </p>
                      </div>
                      <button
                        onClick={() => setIsSyncModalOpen(false)}
                        className="p-1 rounded-lg text-[var(--ink-dim)] hover:text-white"
                      >
                        <X className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Platform Selector Pill Switcher */}
                    <div className="space-y-1.5">
                      <p className="text-[11px] font-mono text-[var(--ink-faint)]">Select Platform to Connect:</p>
                      <div className="flex flex-wrap gap-1.5 p-1 rounded-2xl bg-black/40 border border-white/5">
                        {platformsList.map((platformKey) => {
                          const pMeta = configMap[platformKey];
                          const isActive = selectedPlatform === platformKey;
                          return (
                            <button
                              key={platformKey}
                              type="button"
                              onClick={() => setSelectedPlatform(platformKey)}
                              className={`flex-1 min-w-[75px] py-1.5 px-2 rounded-xl text-xs font-mono font-bold transition-all flex items-center justify-center gap-1 border ${
                                isActive
                                  ? pMeta.activeTabClass
                                  : "text-[var(--ink-dim)] border-transparent hover:text-white hover:bg-white/5"
                              }`}
                            >
                              <span>{pMeta.name}</span>
                              {pMeta.connected && (
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              )}
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* Single Platform Input Form */}
                    <form onSubmit={handleSyncPlatforms} className="space-y-4 font-mono text-xs">
                      <div>
                        <div className="flex items-center justify-between mb-1.5">
                          <label className={`block font-bold ${current.labelColor}`}>
                            {current.name} Username
                          </label>
                          {current.connected && current.profileUrl && (
                            <a
                              href={current.profileUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="text-[10px] text-[var(--ink-dim)] hover:text-white flex items-center gap-1"
                            >
                              <span>View Profile</span>
                              <ExternalLink className="w-3 h-3" />
                            </a>
                          )}
                        </div>

                        <input
                          type="text"
                          placeholder={current.placeholder}
                          value={handlesForm[current.field]}
                          onChange={(e) =>
                            setHandlesForm({
                              ...handlesForm,
                              [current.field]: e.target.value.trim(),
                            })
                          }
                          className={`w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-sm text-white focus:outline-none transition-colors ${current.accentBorder}`}
                          autoFocus
                        />

                        <p className="mt-2 text-[11px] text-[var(--ink-dim)] leading-relaxed">
                          {current.benefits}
                        </p>
                      </div>

                      {actionSuccess && (
                        <p className="text-emerald-400 font-semibold text-center text-xs py-1">
                          {actionSuccess}
                        </p>
                      )}

                      <div className="pt-2 flex justify-end gap-2 border-t border-white/5">
                        <button
                          type="button"
                          onClick={() => setIsSyncModalOpen(false)}
                          className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-white font-mono"
                        >
                          Cancel
                        </button>
                        <button
                          type="submit"
                          disabled={actionLoading}
                          className="btn-gold px-5 py-2 rounded-xl text-black font-bold font-mono shadow-lg hover:shadow-[#D4AF37]/20"
                        >
                          {actionLoading ? "Syncing Platform..." : `Sync & Save ${current.name}`}
                        </button>
                      </div>
                    </form>
                  </>
                );
              })()}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
