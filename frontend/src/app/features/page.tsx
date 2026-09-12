"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import {
  Zap,
  Bot,
  Gauge,
  Bug,
  BookOpen,
  ArrowRightLeft,
  CheckCircle2,
  Code2,
  Cpu,
  Sparkles,
  ShieldCheck,
} from "lucide-react";

export default function FeaturesPage() {
  const [activeTab, setActiveTab] = useState(0);

  const features = [
    {
      id: "execution",
      icon: Cpu,
      title: "Multi-Tier Execution Engine",
      subtitle: "Instant fallback execution system",
      description:
        "Executes C, C++, Java, and Python code via native local compilers (GCC, G++, JDK, Python), remote APIs (Judge0/Piston), or our instant AI execution fallback.",
      highlights: [
        "Sub-millisecond local execution when binaries are available",
        "Piped stdin/stdout support for interactive program inputs",
        "Timeouts & memory bounds preventing infinite loops",
        "Clean workspace auto-cleanup post execution",
      ],
      codeSnippet: `// Local Compiler & AI Fallback Tier
1. Native GCC/G++/JDK Compilation
2. Piston & Judge0 Remote API Fallbacks
3. Groq AI Simulation Engine`,
    },
    {
      id: "ai-tutor",
      icon: Bot,
      title: "AI Compiler Error Tutor",
      subtitle: "Never get stuck on cryptic error messages",
      description:
        "Automatically analyzes compiler errors and pinpoints exact lines, offering beginner-friendly explanations, step-by-step fix guides, and side-by-side code diffs.",
      highlights: [
        "Structured error output schemas for zero prompt hallucination",
        "One-click 'Apply AI Fix' with instant editor code updates",
        "Undo & Compare Changes with visual diff modal",
        "Best practices & common mistake summaries",
      ],
      codeSnippet: `// Example AI Error Analysis
Line 14: missing ';' before 'return'
Summary: Syntax Error in main loop
Fix: Add a semicolon at the end of line 14`,
    },
    {
      id: "analyzer",
      icon: Gauge,
      title: "Code Quality & Security Analyzer",
      subtitle: "Real-time automated code reviews",
      description:
        "Evaluates readability and maintainability scores while identifying performance bottlenecks, security risks, dead code, and variable naming suggestions.",
      highlights: [
        "0-100 Readability and Maintainability Scoring",
        "OWASP & memory security risk identification",
        "Dead code and duplicate logic detection",
        "Variable & function naming recommendations",
      ],
      codeSnippet: `Readability Score: 92/100
Maintainability: 88/100
Security Check: 0 Vulnerabilities Found
Tip: Rename 'x' to 'userCount' for clarity`,
    },
    {
      id: "debugger",
      icon: Bug,
      title: "Visual Execution Debugger",
      subtitle: "Step-by-step memory and stack visualization",
      description:
        "Simulates step-by-step execution to trace variables, call stack state, memory allocation (Stack/Heap), and line-by-line output progression.",
      highlights: [
        "Step-into, step-over, and reset controls",
        "Real-time Call Stack & Scope inspector",
        "Visual Stack vs Heap memory frame allocation",
        "Interactive step timeline scrubber",
      ],
      codeSnippet: `Step 3 [Line 12]: i = 2
Call Stack: main() -> computeSum()
Variables: { sum: 15, count: 2 }
Memory: [Stack] sum (int) = 15`,
    },
    {
      id: "learning",
      icon: BookOpen,
      title: "Multi-Level Learning Mode",
      subtitle: "Master algorithms from beginner to interview ready",
      description:
        "Breaks down complex code into Beginner, Intermediate, and Advanced explanations, complete with Mermaid diagrams, pseudocode, and practice questions.",
      highlights: [
        "3-tier explanations tailored to your experience level",
        "Auto-generated Mermaid logic flowcharts",
        "Time & Space complexity analysis (Big-O)",
        "Technical interview practice questions & hints",
      ],
      codeSnippet: `Concept: Binary Search Tree Insertion
Time Complexity: O(log N) average, O(N) worst
Space Complexity: O(H) stack depth`,
    },
    {
      id: "converter",
      icon: ArrowRightLeft,
      title: "Polyglot Code Converter",
      subtitle: "Translate logic seamlessly between languages",
      description:
        "Converts source code between C, C++, Java, and Python while preserving logic, idiomatic language structures, and explaining key language differences.",
      highlights: [
        "Accurate syntax and paradigm conversion",
        "Idiomatic pattern translation (e.g. C++ vector to Python list)",
        "Detailed comparison notes highlighting language nuances",
        "Direct one-click loading into the main editor",
      ],
      codeSnippet: `// C++ -> Python Conversion
std::vector<int> nums = {1, 2, 3};
   ↓
nums = [1, 2, 3]`,
    },
  ];

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--syn-keyword)] selection:text-white">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 editor-grid overflow-hidden">
        <div className="blob h-[450px] w-[450px] bg-[var(--syn-keyword)] -top-40 -left-20 opacity-30" />
        <div className="blob h-[400px] w-[400px] bg-[var(--syn-function)] top-20 -right-20 opacity-25" />

        <div className="relative mx-auto max-w-5xl px-5 sm:px-8 text-center">
          <div className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 text-xs font-mono text-[var(--syn-function)] border border-emerald-500/20 mb-6">
            <Sparkles className="h-3.5 w-3.5 text-emerald-400" />
            <span>Built for Students, Engineers & Educators</span>
          </div>

          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.35] py-3">
            An Intelligent IDE Platform That <br />
            <span className="text-gradient inline-block px-3 py-1">Teaches as You Code</span>
          </h1>

          <p className="mt-6 text-lg sm:text-xl text-[var(--ink-dim)] max-w-3xl mx-auto leading-relaxed">
            Explore the powerful tools engineered into Cryptic to Clear — from native local compilers and instant AI error tutoring to step-by-step visual debugging.
          </p>

          <div className="mt-8 flex justify-center gap-4">
            <Link
              href="/compiler"
              className="inline-flex items-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20"
            >
              <Code2 className="h-4 w-4" />
              Launch IDE Compiler
            </Link>
          </div>
        </div>
      </section>

      {/* Interactive Feature Explorer */}
      <section className="relative py-16 mx-auto max-w-7xl px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Navigation Sidebar */}
          <div className="lg:col-span-4 flex flex-col gap-3">
            <h3 className="text-xs font-mono uppercase tracking-wider text-[var(--ink-faint)] px-3 mb-1">
              Core Platform Capabilities
            </h3>
            {features.map((feat, idx) => {
              const Icon = feat.icon;
              const isActive = activeTab === idx;
              return (
                <button
                  key={feat.id}
                  onClick={() => setActiveTab(idx)}
                  className={`flex items-start gap-4 p-4 rounded-xl text-left transition-all duration-300 border cursor-pointer ${
                    isActive
                      ? "glass-strong border-cyan-500/60 shadow-xl shadow-cyan-500/20 scale-[1.03] brightness-125"
                      : "glass border-white/5 hover:border-[var(--syn-keyword)]/40 hover:bg-white/10 hover:scale-[1.02] hover:brightness-125 hover:shadow-lg hover:shadow-purple-500/10"
                  }`}
                >
                  <span
                    className={`p-2.5 rounded-lg ${
                      isActive
                        ? "bg-gradient-to-br from-[var(--syn-keyword)] to-[var(--syn-function)] text-[#0a0d13]"
                        : "bg-white/5 text-[var(--ink-dim)]"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                  </span>
                  <div>
                    <h4 className="font-display font-semibold text-sm text-[var(--ink)]">
                      {feat.title}
                    </h4>
                    <p className="text-xs text-[var(--ink-dim)] mt-0.5">
                      {feat.subtitle}
                    </p>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Feature Display Card */}
          <div className="lg:col-span-8 glass-strong rounded-2xl p-6 sm:p-10 border border-white/10 hover:border-[var(--syn-keyword)]/40 hover:brightness-110 hover:shadow-[0_25px_50px_rgba(108,182,255,0.15)] transition-all duration-300 relative overflow-hidden">
            <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
              {(() => {
                const Icon = features[activeTab].icon;
                return <Icon className="h-64 w-64 text-cyan-400" />;
              })()}
            </div>

            <div className="relative z-10">
              <span className="inline-block font-mono text-xs text-[var(--syn-function)] uppercase tracking-wider mb-2">
                {features[activeTab].subtitle}
              </span>
              <h2 className="font-display text-2xl sm:text-3xl font-bold text-[var(--ink)] mb-4">
                {features[activeTab].title}
              </h2>
              <p className="text-[var(--ink-dim)] text-base leading-relaxed mb-8">
                {features[activeTab].description}
              </p>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div>
                  <h4 className="text-xs font-mono text-[var(--syn-keyword)] uppercase tracking-wider mb-3">
                    Key Advantages
                  </h4>
                  <ul className="flex flex-col gap-2.5">
                    {features[activeTab].highlights.map((h, i) => (
                      <li key={i} className="flex items-start gap-2.5 text-xs sm:text-sm text-[var(--ink-dim)]">
                        <CheckCircle2 className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{h}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div>
                  <h4 className="text-xs font-mono text-[var(--syn-const)] uppercase tracking-wider mb-3">
                    Live Output Spec
                  </h4>
                  <div className="bg-[var(--bg)] rounded-xl p-4 font-mono text-xs text-[var(--syn-string)] border border-[var(--border)] shadow-inner whitespace-pre-wrap leading-relaxed">
                    {features[activeTab].codeSnippet}
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-[var(--border)] flex items-center justify-between">
                <span className="text-xs text-[var(--ink-faint)] font-mono">
                  Supported Languages: C, C++, Java, Python
                </span>
                <Link
                  href="/compiler"
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-[var(--syn-function)] hover:underline"
                >
                  <span>Try in Editor</span>
                  <span>→</span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Security & Reliability Banner */}
      <section className="py-16 mx-auto max-w-7xl px-5 sm:px-8 w-full">
        <div className="glass rounded-2xl p-8 sm:p-12 border border-[#D4AF37]/30 bg-gradient-to-br from-[#D4AF37]/5 via-transparent to-black/40">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-start gap-4 p-5 rounded-xl glass border border-white/5 hover:border-[#D4AF37]/40 hover:scale-[1.02] transition-all duration-300">
              <span className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#E8C97A] border border-[#D4AF37]/25">
                <ShieldCheck className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-base text-white">Isolated Execution</h3>
                <p className="text-xs text-[var(--ink-dim)] mt-1 leading-relaxed">
                  Processes run in isolated temporary workspaces with hard time limiters and memory bounds.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl glass border border-white/5 hover:border-[#D4AF37]/40 hover:scale-[1.02] transition-all duration-300">
              <span className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#E8C97A] border border-[#D4AF37]/25">
                <Zap className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-base text-white">Instant AI Fallback</h3>
                <p className="text-xs text-[var(--ink-dim)] mt-1 leading-relaxed">
                  When local compilers aren&apos;t installed, execution falls back seamlessly to multi-provider AI APIs.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-4 p-5 rounded-xl glass border border-white/5 hover:border-[#D4AF37]/40 hover:scale-[1.02] transition-all duration-300">
              <span className="p-3 rounded-xl bg-[#D4AF37]/10 text-[#E8C97A] border border-[#D4AF37]/25">
                <Bot className="h-6 w-6" />
              </span>
              <div>
                <h3 className="font-display font-semibold text-base text-white">Structured Output Schemas</h3>
                <p className="text-xs text-[var(--ink-dim)] mt-1 leading-relaxed">
                  Strict JSON schema constraints ensure reproducible, accurate AI explanations without hallucinations.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* About Section Combined into Features */}
      <section id="about" className="py-20 border-t border-[rgba(212,175,55,0.2)] bg-black/40 scroll-mt-20">
        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="font-mono text-xs text-[#E8C97A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30">
              // Our Mission &amp; Architecture
            </span>
            <h2 className="font-display text-3xl sm:text-5xl font-extrabold mt-4 text-white">
              About <span className="text-gradient">Cryptic to Clear</span>
            </h2>
            <p className="mt-4 text-base text-zinc-300 leading-relaxed">
              Traditional coding platforms present cryptic compiler stack traces and leave students stranded. Cryptic to Clear was architected from the ground up to turn compiler errors into intuitive learning moments, bridging classroom theory with real-world engineering standards.
            </p>
          </div>

          {/* Three Pillars */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-[#D4AF37]/50 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all">
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E8C97A] inline-block mb-4">
                <Sparkles className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2 font-serif">Pedagogical Design</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Every error diagnosis is systematically deconstructed into root cause, exact line numbers, step-by-step resolution, and verified runnable fix code so learners progress with total confidence.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-[#D4AF37]/50 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all">
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E8C97A] inline-block mb-4">
                <Cpu className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2 font-serif">Hybrid Compilation</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Combines local native toolchains (GCC, G++, JDK, Python) with remote execution APIs and deterministic AI simulation fallbacks for 100% execution uptime and sub-second feedback.
              </p>
            </div>

            <div className="glass rounded-2xl p-8 border border-white/10 hover:border-[#D4AF37]/50 hover:shadow-[0_10px_30px_rgba(212,175,55,0.15)] transition-all">
              <div className="p-3.5 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#E8C97A] inline-block mb-4">
                <ShieldCheck className="h-6 w-6" />
              </div>
              <h3 className="font-display text-xl font-bold text-white mb-2 font-serif">Zero Hallucinations</h3>
              <p className="text-xs text-zinc-300 leading-relaxed">
                Guaranteed by strict JSON output schemas that force LLM execution engines to adhere to typed contracts, preventing fabricated syntax advice and ensuring code correctness.
              </p>
            </div>
          </div>

          {/* Architecture & Tech Stack Box */}
          <div className="glass-strong rounded-3xl p-8 sm:p-12 border border-[rgba(212,175,55,0.3)] shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Code2 className="h-6 w-6 text-[#E8C97A]" />
              <h3 className="font-display text-2xl font-bold text-white font-serif">System Architecture &amp; Tech Stack</h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-xs text-zinc-300">
              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#E8C97A] font-bold">
                  Frontend Architecture
                </h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Next.js 15 App Router with server and client components</li>
                  <li>Monaco Editor supporting C, C++, Java, and Python</li>
                  <li>Framer Motion micro-animations &amp; Black, Gold, White design system</li>
                  <li>Interactive Mermaid.js execution flowcharts &amp; logic diagrams</li>
                  <li>Comprehensive campus direct messaging &amp; peer peer Q&amp;A</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-mono text-xs uppercase tracking-wider text-[#E8C97A] font-bold">
                  Backend Infrastructure
                </h4>
                <ul className="space-y-2 list-disc list-inside">
                  <li>Express.js API with security middleware and JWT authentication</li>
                  <li>Prisma ORM connected to campus relational database</li>
                  <li>Native toolchain process spawner (GCC, G++, OpenJDK, Python 3)</li>
                  <li>Multi-tier AI fallback engine (Groq, NVIDIA NIM, Google Gemini)</li>
                  <li>Faculty assignment management with automated test case evaluation</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
