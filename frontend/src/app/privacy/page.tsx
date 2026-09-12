"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { ShieldCheck, Lock, Eye, FileText, CheckCircle2 } from "lucide-react";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#f7f3eb]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-5 sm:px-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1 text-xs font-mono text-[#E8C97A] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <ShieldCheck className="w-3.5 h-3.5 text-[#E8C97A]" />
            <span>Transparency & Trust</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--ink-dim)] max-w-lg mx-auto">
            Last updated: September 2026. How Cryptic-To-Clear handles your code snippets, analytics, and platform account data.
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-10 border border-white/10 space-y-8 text-sm leading-relaxed text-zinc-300 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <Lock className="w-4 h-4 text-[#D4AF37]" />
              1. Code Privacy & Execution Sandboxing
            </h2>
            <p>
              Code submitted to the Cryptic-To-Clear compiler and interactive debugger is executed strictly in transient, sandboxed process runners. User code is never used to train public machine learning models without explicit authorization.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <Eye className="w-4 h-4 text-[#D4AF37]" />
              2. Data Collection & Analytics
            </h2>
            <p>
              We collect profile handles (e.g., LeetCode, GitHub, CodeChef) strictly to compute campus leaderboard rankings and DevScore metrics. Account credentials such as passwords are encrypted using industry-standard bcrypt hashing.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <FileText className="w-4 h-4 text-[#D4AF37]" />
              3. Doubt Forum & Public Profiles
            </h2>
            <p>
              Doubts posted with &quot;Anonymous Peer&quot; privacy have author names masked from other students. Public forum posts and senior interview experiences are shared within the university developer network to foster collaborative learning.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              4. Data Control & Security Contact
            </h2>
            <p>
              Students and faculty members have the right to request deletion of their profile data and submission histories at any time by contacting{" "}
              <a href="mailto:support@cryptictoclear.io" className="text-[#E8C97A] underline hover:text-white">
                support@cryptictoclear.io
              </a>.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
