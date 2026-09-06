import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Link from "next/link";
import { Terminal, Cpu, Sparkles, Code2, Award, HeartHandshake, Lightbulb } from "lucide-react";

export const metadata = {
  title: "About — Cryptic to Clear",
  description: "Learn about the mission, architecture, and technology behind Cryptic to Clear.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--syn-keyword)] selection:text-white">
      <Navbar />

      {/* Hero */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 editor-grid overflow-hidden">
        <div className="blob h-[400px] w-[400px] bg-[var(--syn-function)] -top-32 -left-20 opacity-25" />
        <div className="blob h-[350px] w-[350px] bg-[var(--syn-keyword)] top-20 -right-20 opacity-20" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <span className="font-mono text-xs text-[var(--syn-function)] uppercase tracking-widest">
            // Our Mission & Vision
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.35] py-3 mt-3">
            Transforming Compiler Errors <br />
            Into <span className="text-gradient inline-block px-3 py-1">Clear Learning Moments</span>
          </h1>
          <p className="mt-6 text-lg text-[var(--ink-dim)] leading-relaxed max-w-2xl mx-auto">
            Traditional online compilers present cryptic stack traces and move on. Cryptic to Clear is built from the ground up to explain why code fails, how to fix it, and how to write production-grade software.
          </p>
        </div>
      </section>

      {/* Core Philosophy Cards */}
      <section className="py-12 mx-auto max-w-7xl px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-cyan-500/50 hover:scale-[1.03] hover:brightness-125 hover:shadow-[0_15px_35px_rgba(6,182,212,0.25)] transition-all duration-300 cursor-pointer">
            <span className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 inline-block mb-4">
              <Lightbulb className="h-6 w-6" />
            </span>
            <h3 className="font-display text-xl font-semibold mb-2">Pedagogical Design</h3>
            <p className="text-sm text-[var(--ink-dim)] leading-relaxed">
              Every error explanation is broken down into summary, reason, line number, step-by-step fix, and runnable solution code so students never get stuck in infinite retry loops.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-emerald-500/50 hover:scale-[1.03] hover:brightness-125 hover:shadow-[0_15px_35px_rgba(16,185,129,0.25)] transition-all duration-300 cursor-pointer">
            <span className="p-3 rounded-xl bg-emerald-500/10 text-emerald-400 inline-block mb-4">
              <Cpu className="h-6 w-6" />
            </span>
            <h3 className="font-display text-xl font-semibold mb-2">Hybrid Compilation</h3>
            <p className="text-sm text-[var(--ink-dim)] leading-relaxed">
              Combines native local C/C++/Java/Python toolchains with remote APIs and LLM execution fallbacks, ensuring lightning execution speed with 100% uptime.
            </p>
          </div>

          <div className="glass rounded-2xl p-8 border border-white/10 hover:border-purple-500/50 hover:scale-[1.03] hover:brightness-125 hover:shadow-[0_15px_35px_rgba(168,85,247,0.25)] transition-all duration-300 cursor-pointer">
            <span className="p-3 rounded-xl bg-purple-500/10 text-purple-400 inline-block mb-4">
              <Award className="h-6 w-6" />
            </span>
            <h3 className="font-display text-xl font-semibold mb-2">Zero Hallucinations</h3>
            <p className="text-sm text-[var(--ink-dim)] leading-relaxed">
              Powered by strict JSON Output Schemas that force underlying AI providers to return deterministic, strictly validated payloads for every debugging step.
            </p>
          </div>
        </div>
      </section>

      {/* Tech Stack Breakdown */}
      <section className="py-16 mx-auto max-w-5xl px-5 sm:px-8 w-full">
        <div className="glass-strong rounded-3xl p-8 sm:p-12 border border-white/10 hover:border-[var(--syn-function)]/40 hover:brightness-110 hover:shadow-[0_20px_45px_rgba(108,182,255,0.15)] transition-all duration-300">
          <div className="flex items-center gap-3 mb-6">
            <Terminal className="h-6 w-6 text-[var(--syn-function)]" />
            <h2 className="font-display text-2xl font-bold">Architecture & Tech Stack</h2>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-8 text-sm text-[var(--ink-dim)]">
            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--syn-keyword)] mb-2">
                Frontend Stack
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Next.js 15 (App Router, Server Components & Client Hydration)</li>
                <li>Monaco Editor with multi-language syntax highlighting</li>
                <li>Framer Motion micro-animations & TailwindCSS v4</li>
                <li>Mermaid.js diagram rendering for algorithm flowcharts</li>
                <li>jsPDF & text export utilities</li>
              </ul>
            </div>

            <div>
              <h4 className="font-mono text-xs uppercase tracking-wider text-[var(--syn-const)] mb-2">
                Backend Stack
              </h4>
              <ul className="space-y-2 list-disc list-inside">
                <li>Express Node.js API server with structured request logging</li>
                <li>Local compiler execution via child process spawn (GCC, G++, JDK, Python)</li>
                <li>Judge0 & Piston execution API connectors</li>
                <li>Multi-provider AI fallback tier (Groq, NVIDIA, Gemini APIs)</li>
                <li>Rate-limiting & central error handling middleware</li>
              </ul>
            </div>
          </div>

          <div className="mt-10 pt-6 border-t border-white/10 flex flex-wrap items-center justify-between gap-4">
            <span className="text-xs font-mono text-[var(--ink-faint)]">
              Supported Languages: C (GCC 9+), C++ (G++ 9+), Java (OpenJDK 11+), Python 3.8+
            </span>
            <Link
              href="/compiler"
              className="inline-flex items-center gap-2 rounded-xl px-5 py-2.5 text-xs font-semibold text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] hover:brightness-110 transition-all"
            >
              <Code2 className="h-4 w-4" />
              <span>Open Online IDE</span>
            </Link>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
