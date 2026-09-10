"use client";

import { motion } from "framer-motion";
import { Terminal, BrainCircuit, Sparkles, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    label: "Step 01",
    title: "Write & Instant Compile",
    desc: "Experience zero latency execution. Cryptic to Clear runs your code in real-time across Python, JavaScript, C++, and Java without local environment headaches.",
    icon: Terminal,
    accent: "#E8C97A",
    highlight: "Sub-second Compilation",
  },
  {
    step: "02",
    label: "Step 02",
    title: "Intelligent Diagnostics",
    desc: "Obscure stack traces are decoded into plain English. The AI pinpoints the exact line number, syntax oversight, and conceptual reasoning.",
    icon: BrainCircuit,
    accent: "#D4AF37",
    highlight: "Plain-English Clarification",
  },
  {
    step: "03",
    label: "Step 03",
    title: "One-Click Refinement",
    desc: "Inspect side-by-side proposed fixes. Apply the verified solution with a single click and watch your compiler output turn emerald green instantly.",
    icon: Sparkles,
    accent: "#B8860B",
    highlight: "Verified Solution Patch",
  },
];

export default function FeatureHighlights() {
  return (
    <section id="features-preview" className="relative py-24 sm:py-32 overflow-hidden">
      {/* Background ambient lighting */}
      <div className="blob h-[380px] w-[380px] bg-[rgba(212,175,55,0.12)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.6 }}
          className="text-center max-w-3xl mx-auto mb-16"
        >
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-4 font-mono text-[12px] text-[#E8C97A] border border-[rgba(212,175,55,0.3)] shadow-[0_0_15px_rgba(212,175,55,0.12)]">
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            THE THREE-STEP PROCESS
          </div>

          <h2 className="font-serif-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-[var(--ink)] leading-[1.36] py-3">
            From Cryptic Error to{" "}
            <span className="text-gold-gradient font-serif italic inline-block px-2 py-0.5">
              Flawless
            </span>{" "}
            <span className="text-gold-gradient font-serif italic inline-block px-2 py-0.5">
              Clarity
            </span>
          </h2>

          <p className="mt-4 font-elaborate-sub text-base sm:text-lg text-[var(--ink-dim)] max-w-2xl mx-auto leading-relaxed">
            A seamless three-stage loop designed to keep developers immersed in creative flow rather than frustrated by cryptic build diagnostics.
          </p>

          {/* Thin gold decorative divider */}
          <div className="gold-divider w-32 mx-auto mt-6" />
        </motion.div>

        {/* Three Process Cards */}
        <div className="grid md:grid-cols-3 gap-8 relative">
          {STEPS.map((s, i) => {
            const IconComponent = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-60px" }}
                transition={{ duration: 0.5, delay: i * 0.15 }}
                whileHover={{ y: -8 }}
                className="relative glass-strong rounded-2xl p-7 sm:p-8 border border-[rgba(212,175,55,0.22)] hover:border-[rgba(212,175,55,0.65)] hover:shadow-[0_20px_50px_rgba(212,175,55,0.18)] transition-all duration-300 group flex flex-col justify-between"
              >
                <div>
                  {/* Top card bar: Step badge + Gold icon */}
                  <div className="flex items-center justify-between mb-6">
                    <span className="font-serif font-bold text-2xl text-[rgba(212,175,55,0.6)] group-hover:text-[#E8C97A] transition-colors">
                      {s.step}
                    </span>

                    <div className="flex items-center justify-center h-12 w-12 rounded-xl bg-[rgba(212,175,55,0.12)] border border-[rgba(212,175,55,0.35)] shadow-[0_0_15px_rgba(212,175,55,0.15)] group-hover:scale-110 group-hover:border-[rgba(212,175,55,0.7)] group-hover:shadow-[0_0_22px_rgba(212,175,55,0.35)] transition-all duration-300">
                      <IconComponent className="h-6 w-6 text-[#E8C97A]" />
                    </div>
                  </div>

                  {/* Step Title in Serif */}
                  <h3 className="font-serif-heading text-xl font-bold mb-3 text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                    {s.title}
                  </h3>

                  {/* Thin gold divider */}
                  <div className="h-px w-full bg-gradient-to-r from-[rgba(212,175,55,0.4)] to-transparent my-3.5" />

                  {/* Description in Clean Sans-serif */}
                  <p className="font-elaborate-sub text-sm text-[var(--ink-dim)] leading-relaxed group-hover:text-[var(--ink)] transition-colors">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Highlight Tag */}
                <div className="mt-6 pt-4 border-t border-[rgba(212,175,55,0.15)] flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[#E8C97A]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span>{s.highlight}</span>
                  </div>

                  <span className="text-[11px] font-mono text-[var(--ink-faint)] group-hover:text-[#E8C97A] group-hover:translate-x-1 transition-all">
                    &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Call to action phrase banner with gold accents */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="mt-14 text-center"
        >
          <Link
            href="/compiler"
            className="inline-flex items-center gap-3 text-sm font-serif font-bold text-[#E8C97A] hover:text-[#f7f3eb] group transition-colors"
          >
            <span>Experience the classic refinement of Cryptic to Clear</span>
            <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>
      </div>
    </section>
  );
}
