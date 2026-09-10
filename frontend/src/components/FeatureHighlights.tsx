"use client";

import { motion } from "framer-motion";
import { Terminal, BrainCircuit, Wand2, ArrowRight, CheckCircle2, Code2 } from "lucide-react";
import Link from "next/link";

const STEPS = [
  {
    step: "01",
    phase: "WRITE",
    title: "Write in a Multi-Language Editor",
    desc: "Code with full syntax highlighting, keyboard shortcuts, and zero-configuration runtimes across Python, C, C++, and Java.",
    icon: Terminal,
    accent: "#E8C97A",
    highlight: "Zero Setup Required",
  },
  {
    step: "02",
    phase: "UNDERSTAND",
    title: "Get Clear Explanations of Compiler Errors",
    desc: "Obscure compiler outputs, syntax faults, and stack traces are translated into plain-English diagnoses explaining what happened and why.",
    icon: BrainCircuit,
    accent: "#D4AF37",
    highlight: "Plain-English Diagnostics",
  },
  {
    step: "03",
    phase: "FIX",
    title: "Apply the Suggested Fix and Run Again",
    desc: "Review verified solution patches side-by-side. Apply fixes with one click directly into your code and watch your terminal turn clean.",
    icon: Wand2,
    accent: "#10b981",
    highlight: "One-Click Fix Application",
  },
];

export default function FeatureHighlights() {
  return (
    <section id="features-preview" className="relative py-20 sm:py-28 px-5 sm:px-8 border-t border-white/10 bg-[#060a14] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="blob h-[380px] w-[380px] bg-[rgba(212,175,55,0.1)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="relative mx-auto max-w-7xl">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-60px" }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-14 space-y-3"
        >
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] bg-[#0c1322] border border-[#D4AF37]/35 text-[#E8C97A]">
            <Code2 className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold uppercase tracking-wider">The Three-Step Workflow</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            Write <span className="text-[#E8C97A]">→</span> Understand <span className="text-emerald-400">→</span> Fix
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto leading-relaxed">
            AI-powered coding and debugging, built to make errors understandable and debugging lightning-fast.
          </p>
        </motion.div>

        {/* Three Process Cards */}
        <div className="grid md:grid-cols-3 gap-6 relative">
          {STEPS.map((s, i) => {
            const IconComponent = s.icon;
            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-40px" }}
                transition={{ duration: 0.4, delay: i * 0.1 }}
                className="relative rounded-2xl bg-[#0c1322] border border-white/10 hover:border-[#D4AF37]/50 hover:shadow-[0_15px_40px_rgba(212,175,55,0.12)] p-6 sm:p-7 flex flex-col justify-between transition-all duration-200 group"
              >
                <div>
                  {/* Step number badge & Icon */}
                  <div className="flex items-center justify-between mb-5">
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-extrabold text-2xl text-slate-500 group-hover:text-[#E8C97A] transition-colors">
                        {s.step}
                      </span>
                      <span className="font-mono text-xs font-bold text-slate-400 uppercase tracking-wider">
                        — {s.phase}
                      </span>
                    </div>

                    <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-white/5 border border-white/10 group-hover:border-[#D4AF37]/50 group-hover:scale-105 transition-all">
                      <IconComponent className="h-5 w-5 text-[#E8C97A]" />
                    </div>
                  </div>

                  {/* Title */}
                  <h3 className="text-lg font-bold text-white mb-2.5 group-hover:text-[#E8C97A] transition-colors">
                    {s.title}
                  </h3>

                  {/* Description */}
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {s.desc}
                  </p>
                </div>

                {/* Bottom Highlight Pill */}
                <div className="mt-6 pt-4 border-t border-white/5 flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-emerald-400">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span>{s.highlight}</span>
                  </div>

                  <span className="text-xs font-mono text-slate-500 group-hover:text-[#E8C97A] group-hover:translate-x-1 transition-all">
                    &rarr;
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* CTA Footer */}
        <div className="mt-12 text-center">
          <Link
            href="/compiler"
            className="inline-flex items-center gap-2 font-mono text-xs font-bold text-[#E8C97A] hover:text-white transition-colors group"
          >
            <span>Launch Compiler to test your code</span>
            <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>
      </div>
    </section>
  );
}
