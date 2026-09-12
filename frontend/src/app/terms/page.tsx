"use client";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Scale, CheckCircle2, ShieldAlert, Terminal } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37]/30 selection:text-[#f7f3eb]">
      <Navbar />

      <main className="flex-1 pt-32 pb-20 px-5 sm:px-8 max-w-4xl mx-auto w-full">
        {/* Header */}
        <div className="text-center space-y-3 mb-12">
          <div className="inline-flex items-center gap-2 rounded-full glass px-3.5 py-1 text-xs font-mono text-[#E8C97A] border border-[#D4AF37]/30 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <Scale className="w-3.5 h-3.5 text-[#E8C97A]" />
            <span>Platform Agreement</span>
          </div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Terms of Service
          </h1>
          <p className="text-sm text-[var(--ink-dim)] max-w-lg mx-auto">
            Rules and policies governing your usage of the Cryptic-To-Clear compiler, campus doubt forum, and academic tooling.
          </p>
        </div>

        {/* Content Card */}
        <div className="glass-strong rounded-2xl p-6 sm:p-10 border border-white/10 space-y-8 text-sm leading-relaxed text-zinc-300 shadow-xl">
          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <Terminal className="w-4 h-4 text-[#D4AF37]" />
              1. Acceptable Compiler & Runtime Use
            </h2>
            <p>
              Users agree not to utilize the compilation service for malicious activities, including denial-of-service attempts, unauthorized network tunneling, or attempting to compromise execution host infrastructure.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-[#D4AF37]" />
              2. Academic Integrity
            </h2>
            <p>
              Cryptic-To-Clear is an educational aid designed to teach algorithmic concepts and decode compilation errors. Users must comply with their institution&apos;s academic honor code regarding homework submissions and competitive assignments.
            </p>
          </section>

          <section className="space-y-3">
            <h2 className="text-base font-bold text-[#E8C97A] flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-[#D4AF37]" />
              3. Community Conduct
            </h2>
            <p>
              Harassment, spam, or inappropriate language on the senior interview boards, doubt exchange forum, or direct messaging channels will result in immediate suspension of account privileges.
            </p>
          </section>
        </div>
      </main>

      <Footer />
    </div>
  );
}
