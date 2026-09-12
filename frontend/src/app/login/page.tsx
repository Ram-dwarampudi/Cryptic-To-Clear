"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import LoginForm from "@/components/auth/LoginForm";
import FacultyLoginForm from "@/components/auth/FacultyLoginForm";
import RegisterForm from "@/components/auth/RegisterForm";
import ForgotPassword from "@/components/auth/ForgotPassword";
import GuestButton from "@/components/auth/GuestButton";
import {
  Sparkles,
  GraduationCap,
  User,
  Shield,
  Code2,
  BookOpen,
  MessageSquare,
  CheckCircle2,
  ArrowLeft,
  Briefcase,
  Zap,
} from "lucide-react";

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const tabParam = searchParams.get("tab");
  const [activeTab, setActiveTab] = useState<"login" | "faculty" | "register" | "forgot">("login");
  const [registerRole, setRegisterRole] = useState<"student" | "faculty">("student");

  useEffect(() => {
    if (tabParam === "faculty") setActiveTab("faculty");
    else if (tabParam === "register") {
      setActiveTab("register");
      setRegisterRole("student");
    } else if (tabParam === "faculty-register") {
      setActiveTab("register");
      setRegisterRole("faculty");
    } else if (tabParam === "forgot") setActiveTab("forgot");
  }, [tabParam]);

  // If already logged in, offer quick jump or redirect
  useEffect(() => {
    if (user) {
      const redirect = searchParams.get("redirect");
      if (redirect) {
        router.push(redirect);
      }
    }
  }, [user, router, searchParams]);

  const handleAuthSuccess = () => {
    const redirect = searchParams.get("redirect");
    if (redirect) {
      router.push(redirect);
    } else if (activeTab === "faculty") {
      router.push("/faculty");
    } else {
      router.push("/compiler");
    }
  };

  return (
    <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] text-[var(--ink)]">
      {/* Background ambient lighting effects */}
      <div className="blob h-[450px] w-[450px] bg-[rgba(212,175,55,0.12)] top-12 -left-40 pointer-events-none opacity-40 blur-3xl" />
      <div className="blob h-[450px] w-[450px] bg-[rgba(126,182,255,0.08)] bottom-12 -right-40 pointer-events-none opacity-30 blur-3xl" />
      <div className="blob h-[300px] w-[300px] bg-[rgba(168,85,247,0.08)] top-1/2 left-1/3 pointer-events-none opacity-25 blur-3xl" />

      {/* Top Bar Navigation */}
      <header className="max-w-7xl mx-auto w-full mb-6 flex items-center justify-between">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-xs font-mono text-[var(--ink-dim)] hover:text-[#E8C97A] transition-colors group px-3 py-1.5 rounded-lg hover:bg-white/5 border border-transparent hover:border-[rgba(212,175,55,0.2)]"
        >
          <ArrowLeft className="w-3.5 h-3.5 group-hover:-translate-x-0.5 transition-transform" />
          <span>Back to Home</span>
        </Link>

        <div className="flex items-center gap-3">
          <Link
            href="/compiler"
            className="text-xs font-mono text-[var(--ink-dim)] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
          >
            Launch Compiler
          </Link>
          <Link
            href="/interviews"
            className="text-xs font-mono text-[var(--ink-dim)] hover:text-white px-3 py-1.5 rounded-lg hover:bg-white/5 transition-colors hidden sm:inline-block"
          >
            Interview Archive
          </Link>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto w-full my-auto">
        <div className="grid lg:grid-cols-12 gap-8 lg:gap-12 items-center">
          {/* Left Column: Campus Value Showcase */}
          <div className="lg:col-span-6 space-y-6">
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.4 }}
              className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 font-mono text-[11px] text-[#E8C97A] border border-[rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.1)]"
            >
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Cryptic to Clear • Unified Portal</span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.05 }}
            >
              <h1 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ink)] leading-[1.2]">
                One Unified Portal. <br />
                <span className="text-gold-gradient font-serif italic">Every Campus Tool.</span>
              </h1>
              <p className="mt-4 text-sm sm:text-base text-[var(--ink-dim)] max-w-lg leading-relaxed">
                Seamlessly bridge student coding practice with real company placement experiences and faculty course evaluations.
              </p>
            </motion.div>

            {/* Value Pillars List */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="grid sm:grid-cols-2 gap-3.5 pt-2"
            >
              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.4)] transition-all group">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center text-[#E8C97A]">
                    <Code2 className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-mono font-bold text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                    Smart AI Compiler
                  </h2>
                </div>
                <p className="text-[11px] text-[var(--ink-dim)] font-mono leading-relaxed">
                  10+ languages with AST debug visualizer and instant AI error fixes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.4)] transition-all group">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center text-[#E8C97A]">
                    <Briefcase className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-mono font-bold text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                    Interview Hub
                  </h2>
                </div>
                <p className="text-[11px] text-[var(--ink-dim)] font-mono leading-relaxed">
                  Senior interview transcripts from Google, Amazon, Microsoft & TCS.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.4)] transition-all group">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center text-[#E8C97A]">
                    <MessageSquare className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-mono font-bold text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                    Campus Doubts Forum
                  </h2>
                </div>
                <p className="text-[11px] text-[var(--ink-dim)] font-mono leading-relaxed">
                  Ask by roll number or anonymously with verified faculty solutions.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-white/[0.02] border border-[rgba(212,175,55,0.18)] hover:border-[rgba(212,175,55,0.4)] transition-all group">
                <div className="flex items-center gap-2.5 mb-1.5">
                  <div className="h-7 w-7 rounded-lg bg-[rgba(212,175,55,0.15)] flex items-center justify-center text-[#E8C97A]">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <h2 className="text-xs font-mono font-bold text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                    Faculty Gradebook
                  </h2>
                </div>
                <p className="text-[11px] text-[var(--ink-dim)] font-mono leading-relaxed">
                  Automated test suites, batch analytics, and plagiarism audit.
                </p>
              </div>
            </motion.div>

            {/* University Live Metrics */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.15 }}
              className="p-4 rounded-2xl glass border border-[rgba(212,175,55,0.2)] flex items-center justify-between font-mono"
            >
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">Campus</div>
                <div className="text-[10px] text-[#E8C97A] uppercase tracking-wider">Multi-Role SaaS</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">10+ Langs</div>
                <div className="text-[10px] text-[#E8C97A] uppercase tracking-wider">Smart Compiler</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-white">3-Tier</div>
                <div className="text-[10px] text-[#E8C97A] uppercase tracking-wider">Doubt Privacy</div>
              </div>
              <div className="h-8 w-px bg-white/10" />
              <div>
                <div className="text-lg sm:text-xl font-bold text-emerald-400">Connected</div>
                <div className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">PostgreSQL 17</div>
              </div>
            </motion.div>

            {/* Student Placed Testimonial */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="p-3.5 rounded-xl bg-white/[0.02] border border-white/5 text-xs text-[var(--ink-dim)] italic font-serif flex items-start gap-3"
            >
              <div className="h-8 w-8 rounded-full bg-gradient-to-tr from-[#D4AF37] to-[#E8C97A] text-[#060911] font-bold font-mono flex items-center justify-center shrink-0 not-italic text-xs">
                AM
              </div>
              <div>
                <p>
                  &ldquo;Having verified past senior interview questions and a smart compiler in one campus portal made college placements genuinely straightforward.&rdquo;
                </p>
                <p className="mt-1 text-[11px] font-mono not-italic text-[#E8C97A]">
                  — Final Year Student, Placed at Amazon (2025 Batch)
                </p>
              </div>
            </motion.div>
          </div>

          {/* Right Column: Authentication Card */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="lg:col-span-6"
          >
            <div className="glass-strong rounded-3xl border border-[rgba(212,175,55,0.3)] shadow-[0_16px_50px_rgba(0,0,0,0.6)] p-6 sm:p-8 relative overflow-hidden backdrop-blur-2xl">
              {/* Subtle inner corner gold glow */}
              <div className="absolute -top-16 -right-16 w-36 h-36 bg-[rgba(212,175,55,0.2)] rounded-full blur-2xl pointer-events-none" />

              {/* Portal Header */}
              <div className="text-center mb-6">
                <div className="flex items-center justify-center gap-3 mb-2">
                  <img
                    src="/logo-icon.png"
                    alt="Cryptic to Clear Logo"
                    className="h-10 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,255,255,0.3)]"
                  />
                  <div className="flex flex-col text-left leading-none">
                    <span className="font-logo-title font-bold text-xl tracking-[0.06em] text-[var(--ink)]">
                      CRYPTIC
                    </span>
                    <span className="font-sans font-semibold text-[10.5px] tracking-[0.3em] text-[#E8C97A] mt-1">
                      TO CLEAR
                    </span>
                  </div>
                </div>
                <h2 className="font-display text-2xl font-bold text-[var(--ink)] tracking-tight">
                  {activeTab === "login" && "Student Sign In"}
                  {activeTab === "faculty" && "Faculty & Institutional Portal"}
                  {activeTab === "register" && (registerRole === "faculty" ? "Create Faculty Account" : "Create Account")}
                  {activeTab === "forgot" && "Account Recovery"}
                </h2>
                <p className="text-xs text-[var(--ink-dim)] mt-1 font-mono">
                  {activeTab === "login" && "Sign in with your campus credentials or demo account"}
                  {activeTab === "faculty" && "Department professors, evaluators & course admins"}
                  {activeTab === "register" && (registerRole === "faculty" ? "Register your institutional faculty or lab admin credentials" : "Join your campus batch & sync lab assignments")}
                  {activeTab === "forgot" && "Recover your institutional access credentials"}
                </p>
              </div>

              {/* Segmented Tab Selector */}
              <div className="grid grid-cols-3 gap-1 p-1 bg-[rgba(7,11,20,0.9)] rounded-xl border border-[rgba(212,175,55,0.25)] mb-6 font-mono text-xs">
                <button
                  type="button"
                  onClick={() => setActiveTab("login")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "login"
                      ? "btn-gold text-white font-bold shadow-md"
                      : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                  }`}
                >
                  <User className="w-3.5 h-3.5 hidden sm:inline" />
                  <span>Student</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("faculty")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "faculty"
                      ? "bg-purple-700/80 text-white font-bold shadow-md border border-purple-400/40"
                      : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 hidden sm:inline text-purple-300" />
                  <span>Faculty</span>
                </button>

                <button
                  type="button"
                  onClick={() => setActiveTab("register")}
                  className={`flex items-center justify-center gap-1.5 py-2 rounded-lg font-medium transition-all cursor-pointer ${
                    activeTab === "register"
                      ? "btn-gold text-white font-bold shadow-md"
                      : "text-[var(--ink-dim)] hover:text-[var(--ink)]"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 hidden sm:inline" />
                  <span>Register</span>
                </button>
              </div>

              {/* Active Form */}
              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -8 }}
                  transition={{ duration: 0.18 }}
                  className="relative z-10"
                >
                  {activeTab === "login" && (
                    <LoginForm
                      onSwitchTab={(tab) => setActiveTab(tab)}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {activeTab === "faculty" && (
                    <FacultyLoginForm
                      onSwitchTab={(tab) => {
                        if (tab === "register") setRegisterRole("faculty");
                        setActiveTab(tab);
                      }}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {activeTab === "register" && (
                    <RegisterForm
                      initialRole={registerRole}
                      onSwitchTab={() => setActiveTab("login")}
                      onSuccess={handleAuthSuccess}
                    />
                  )}

                  {activeTab === "forgot" && (
                    <ForgotPassword onSwitchTab={() => setActiveTab("login")} />
                  )}
                </motion.div>
              </AnimatePresence>

              {/* Instant Guest Playground Jump */}
              <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.15)] flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono">
                <GuestButton redirectToCompiler={true} />
                <span className="text-[11px] text-[var(--ink-faint)]">
                  No sign up required for guest mode
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </main>

      {/* Subtle Footer Note */}
      <footer className="max-w-7xl mx-auto w-full mt-8 pt-4 border-t border-white/5 text-center text-xs font-mono text-[var(--ink-faint)]">
        Cryptic to Clear • University Tech Campus Academic Platform • Secure TLS & JWT Authentication
      </footer>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen relative flex flex-col justify-between overflow-x-hidden pt-20 pb-12 px-4 sm:px-6 lg:px-8 bg-[var(--bg)] text-[var(--ink)]">
          {/* Top Bar Navigation */}
          <header className="max-w-7xl mx-auto w-full mb-6 flex items-center justify-between">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-xs font-mono text-[var(--ink-dim)] hover:text-[#E8C97A] transition-colors px-3 py-1.5 rounded-lg border border-white/10"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back to Home</span>
            </Link>

            <div className="flex items-center gap-3">
              <Link
                href="/compiler"
                className="text-xs font-mono text-[var(--ink-dim)] hover:text-white px-3 py-1.5 rounded-lg border border-white/10"
              >
                Launch Compiler
              </Link>
              <Link
                href="/interviews"
                className="text-xs font-mono text-[var(--ink-dim)] hover:text-white px-3 py-1.5 rounded-lg border border-white/10 hidden sm:inline-block"
              >
                Interview Archive
              </Link>
            </div>
          </header>

          {/* Main Skeleton Box */}
          <main className="max-w-7xl mx-auto w-full my-auto flex flex-col items-center justify-center py-12">
            <div className="w-full max-w-md glass-strong rounded-3xl p-8 border border-[rgba(212,175,55,0.3)] shadow-2xl text-center space-y-4">
              <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1 font-mono text-[11px] text-[#E8C97A] border border-[rgba(212,175,55,0.3)]">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>University Authentication Portal</span>
              </div>
              <h2 className="font-serif-heading text-xl font-bold text-white">
                Preparing Secure Session
              </h2>
              <p className="text-xs text-[var(--ink-dim)]">
                Connecting to institutional authentication gateway...
              </p>
              <div className="py-6 flex items-center justify-center gap-2">
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-ping" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37] animate-pulse" />
                <div className="w-2 h-2 rounded-full bg-[#D4AF37]" />
              </div>
              <div className="pt-4 border-t border-white/5 flex justify-center gap-3 text-xs font-mono">
                <Link href="/" className="text-[#E8C97A] hover:underline">
                  Return to Home
                </Link>
                <span className="text-zinc-600">•</span>
                <Link href="/compiler" className="text-zinc-400 hover:text-white">
                  Direct Compiler
                </Link>
              </div>
            </div>
          </main>

          {/* Footer Note */}
          <footer className="max-w-7xl mx-auto w-full mt-8 pt-4 border-t border-white/5 text-center text-xs font-mono text-[var(--ink-faint)]">
            Cryptic to Clear • University Tech Campus Academic Platform • Secure TLS &amp; JWT Authentication
          </footer>
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  );
}
