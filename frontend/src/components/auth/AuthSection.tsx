"use client";

import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import LoginForm from "./LoginForm";
import RegisterForm from "./RegisterForm";
import ForgotPassword from "./ForgotPassword";
import { Terminal, ArrowRight, CheckCircle2, Lock, Sparkles, UserCheck } from "lucide-react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";

export default function AuthSection() {
  const [activeTab, setActiveTab] = useState<"login" | "register" | "forgot">("login");
  const { continueAsGuest } = useAuth();
  const router = useRouter();

  const handleOpenCompilerGuest = () => {
    continueAsGuest();
    router.push("/compiler");
  };

  return (
    <section id="auth-access" className="relative py-20 px-5 sm:px-8 border-t border-white/10 bg-[#070b14] overflow-hidden">
      {/* Ambient background lighting */}
      <div className="blob h-[350px] w-[350px] bg-[rgba(212,175,55,0.1)] top-1/4 -left-32 pointer-events-none" />
      <div className="blob h-[350px] w-[350px] bg-[rgba(126,182,255,0.08)] bottom-1/4 -right-32 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] bg-[#0c1322] border border-[#D4AF37]/35 text-[#E8C97A]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold uppercase tracking-wider">Instant Access</span>
          </div>

          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            Start Coding in Seconds
          </h2>

          <p className="text-slate-300 text-sm sm:text-base">
            No signup. No setup. Open the compiler as a guest or sign in to sync your profile and bookmarks.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-8 items-stretch max-w-5xl mx-auto">
          {/* Left Column: Try Without An Account (Top Priority Guest Card) */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0b1120] border border-white/10 p-6 sm:p-8 flex flex-col justify-between shadow-xl space-y-6">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-emerald-500/10 border border-emerald-500/25 text-emerald-400 font-mono text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Instant Guest Mode</span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-2xl font-extrabold text-white">
                  Try it without an account
                </h3>
                <p className="text-slate-300 text-sm">
                  No signup. No setup. Just code.
                </p>
              </div>

              <ul className="space-y-2.5 font-mono text-xs text-slate-300 pt-2 border-t border-white/5">
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Full multi-language compiler (Python, C, C++, Java)</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Real-time AI compiler error explanations</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>One-click suggested fix application</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>Visual Debugger & Learning Mode</span>
                </li>
              </ul>
            </div>

            <div className="space-y-2 pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleOpenCompilerGuest}
                className="w-full btn-gold py-3 px-5 rounded-xl font-mono text-xs font-bold text-black flex items-center justify-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] cursor-pointer"
              >
                <span>Open Compiler</span>
                <ArrowRight className="w-4 h-4 stroke-[2.5]" />
              </button>
              <p className="text-[11px] text-center font-mono text-slate-400">
                Direct access • No card • No installation
              </p>
            </div>
          </div>

          {/* Right Column: Sign In / Create Account */}
          <div className="lg:col-span-6 rounded-2xl bg-[#0b1120] border border-white/10 p-6 sm:p-8 shadow-xl">
            {/* Header / Tabs */}
            <div className="flex items-center justify-between p-1 bg-black/40 rounded-xl border border-white/10 mb-6 font-mono text-xs">
              <button
                type="button"
                onClick={() => setActiveTab("login")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "login"
                    ? "bg-[#D4AF37] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                onClick={() => setActiveTab("register")}
                className={`flex-1 py-2 rounded-lg font-semibold transition-all cursor-pointer ${
                  activeTab === "register"
                    ? "bg-[#D4AF37] text-black shadow-sm font-bold"
                    : "text-slate-400 hover:text-white"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Forms with animation */}
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.15 }}
              >
                {activeTab === "login" && (
                  <LoginForm onSwitchTab={(tab) => setActiveTab(tab)} />
                )}
                {activeTab === "register" && (
                  <RegisterForm onSwitchTab={() => setActiveTab("login")} />
                )}
                {activeTab === "forgot" && (
                  <ForgotPassword onSwitchTab={() => setActiveTab("login")} />
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}
