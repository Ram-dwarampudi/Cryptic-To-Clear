"use client";

import { useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, Play, Terminal, Sparkles, CheckCircle2, Shield } from "lucide-react";
import EditorMockup from "./EditorMockup";

export default function Hero() {
  const router = useRouter();

  useEffect(() => {
    // Eagerly prefetch compiler assets as soon as home page loads
    router.prefetch("/compiler");
  }, [router]);

  return (
    <section className="relative pt-28 sm:pt-36 pb-20 sm:pb-28 overflow-hidden">
      {/* Subtle ambient lighting for deep technical workspace */}
      <div className="blob h-[450px] w-[450px] bg-[rgba(212,175,55,0.14)] -top-36 -left-32 pointer-events-none" />
      <div className="blob h-[400px] w-[400px] bg-[rgba(126,182,255,0.08)] top-20 -right-24 pointer-events-none" />
      <div className="blob h-[320px] w-[320px] bg-[rgba(34,211,238,0.06)] bottom-0 left-1/3 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-12 gap-12 lg:gap-14 items-center">
        {/* Left Column: Product Positioning & Action */}
        <div className="text-center lg:text-left lg:col-span-6 space-y-6">
          {/* Status / Category Pill */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] bg-[#0c1322] border border-[#D4AF37]/35 text-[#E8C97A] shadow-[0_0_15px_rgba(212,175,55,0.12)]"
          >
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span className="font-semibold text-white">Cryptic → Clear</span>
            <span className="text-white/30">•</span>
            <span>Compiler + AI Debugger</span>
          </motion.div>

          {/* Core Headlines */}
          <div className="space-y-3">
            <motion.h1
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.1 }}
              className="text-4xl sm:text-5xl lg:text-[3.6rem] font-extrabold tracking-tight text-white leading-[1.15]"
            >
              Stop Fighting <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-red-400 via-[#E8C97A] to-[#D4AF37] bg-clip-text text-transparent">
                Cryptic Errors.
              </span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
              className="text-xl sm:text-2xl font-semibold text-slate-200 tracking-tight"
            >
              Understand your code. Fix it faster.
            </motion.p>
          </div>

          {/* Supporting Description */}
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.3 }}
            className="text-base sm:text-lg text-[var(--ink-dim)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            AI-powered debugging that turns compiler errors into explanations you can actually understand. Code in Python, C, C++, and Java with instant execution and one-click fixes.
          </motion.p>

          {/* Primary Call to Actions */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            className="pt-2 flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start"
          >
            <Link
              href="/compiler"
              prefetch={true}
              className="btn-gold px-7 py-3.5 text-sm font-bold text-black rounded-xl shadow-[0_0_24px_rgba(212,175,55,0.4)] hover:shadow-[0_0_35px_rgba(232,201,122,0.65)] flex items-center justify-center gap-2.5 w-full sm:w-auto transition-all cursor-pointer"
            >
              <span>Start Coding</span>
              <ArrowRight className="h-4 w-4 stroke-[2.5]" />
            </Link>

            <a
              href="#workflow-demo"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-white bg-white/5 hover:bg-white/10 border border-white/10 hover:border-[#D4AF37]/50 transition-all cursor-pointer w-full sm:w-auto"
            >
              <Play className="h-3.5 w-3.5 text-[#E8C97A] fill-[#E8C97A]" />
              <span>See How It Works</span>
            </a>
          </motion.div>

          {/* Developer Trust Badges & No Signup Notice */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            className="pt-3 flex flex-wrap items-center gap-y-2 gap-x-5 justify-center lg:justify-start font-mono text-[12px]"
          >
            <div className="flex items-center gap-1.5 text-emerald-400 font-semibold bg-emerald-500/10 px-2.5 py-1 rounded-lg border border-emerald-500/20">
              <CheckCircle2 className="w-3.5 h-3.5 shrink-0" />
              <span>No signup required</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-300">
              <Terminal className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
              <span>Python • C • C++ • Java</span>
            </div>

            <div className="flex items-center gap-1.5 text-slate-400">
              <Sparkles className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
              <span>Instant sub-second execution</span>
            </div>
          </motion.div>
        </div>

        {/* Right Column: Interactive IDE Demonstration */}
        <div className="relative lg:col-span-6">
          <EditorMockup />
        </div>
      </div>
    </section>
  );
}
