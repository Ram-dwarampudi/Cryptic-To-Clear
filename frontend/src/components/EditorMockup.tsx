"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Sparkles, Play, CheckCircle2, AlertTriangle, RefreshCw, RotateCcw } from "lucide-react";

type LanguageKey = "python" | "c" | "cpp" | "java";

interface LanguageDemo {
  id: LanguageKey;
  filename: string;
  badge: string;
  runtime: string;
  errorLineNumber: number;
  errorConsole: string;
  successConsole: string;
  aiBreakdown: {
    message: string;
    suggestion: string;
  };
  renderLines: (isFixed: boolean, stage: number) => React.ReactNode[];
}

const DEMOS: Record<LanguageKey, LanguageDemo> = {
  python: {
    id: "python",
    filename: "main.py",
    badge: "Python",
    runtime: "Python 3.12",
    errorLineNumber: 3,
    errorConsole: "SyntaxError: '(' was never closed (line 3)",
    successConsole: "Build Success: Hello, Cryptic to Clear! (0.02s)",
    aiBreakdown: {
      message: 'You called print("Hello, Cryptic to Clear!" on line 3 but forgot the closing parenthesis \')\'.',
      suggestion: "Add ')' to close print statement",
    },
    renderLines: (isFixed: boolean, stage: number) => [
      <span key="1">
        <span className="text-[#E8C97A] font-semibold">def</span>{" "}
        <span className="text-[#7EB6FF]">main</span>():
      </span>,
      <span key="2" className="text-[var(--ink-faint)] italic">
        &nbsp;&nbsp;# Greet developer with classic elegance
      </span>,
      <span key="3">
        &nbsp;&nbsp;<span className="text-[#7EB6FF]">print</span>(
        <span className="text-[#9ee6a8]">&quot;Hello, Cryptic to Clear!&quot;</span>
        {isFixed ? (
          <span className="text-[#27c93f] font-bold bg-[#27c93f]/25 px-1 rounded animate-pulse">)</span>
        ) : (
          <span className="text-amber-400 font-bold ml-0.5 px-1 bg-amber-500/20 rounded">
            {"‹! missing ')'"}
          </span>
        )}
      </span>,
      <span key="4" className="text-transparent select-none">
        .
      </span>,
      <span key="5">
        <span className="text-[#7EB6FF]">main</span>()
      </span>,
    ],
  },
  c: {
    id: "c",
    filename: "main.c",
    badge: "C",
    runtime: "GCC 14.2 (C17)",
    errorLineNumber: 4,
    errorConsole: "error: expected ';' before 'return' (line 4)",
    successConsole: "Build Success: Hello, Cryptic to Clear! (0.01s)",
    aiBreakdown: {
      message: "In C, every statement must end with a semicolon ';'. The printf call on line 4 is missing ';'.",
      suggestion: "Add ';' after printf statement",
    },
    renderLines: (isFixed: boolean, stage: number) => [
      <span key="1">
        <span className="text-[#E8C97A] font-semibold">#include</span>{" "}
        <span className="text-[#9ee6a8]">&lt;stdio.h&gt;</span>
      </span>,
      <span key="2" className="text-transparent select-none">
        .
      </span>,
      <span key="3">
        <span className="text-[#E8C97A] font-semibold">int</span>{" "}
        <span className="text-[#7EB6FF]">main</span>(
        <span className="text-[#E8C97A] font-semibold">void</span>) {"{"}
      </span>,
      <span key="4">
        &nbsp;&nbsp;<span className="text-[#7EB6FF]">printf</span>(
        <span className="text-[#9ee6a8]">&quot;Hello, Cryptic to Clear!\\n&quot;</span>)
        {isFixed ? (
          <span className="text-[#27c93f] font-bold bg-[#27c93f]/25 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-amber-400 font-bold ml-0.5 px-1 bg-amber-500/20 rounded">
            {"‹! missing ';'"}
          </span>
        )}
      </span>,
      <span key="5">
        &nbsp;&nbsp;<span className="text-[#E8C97A] font-semibold">return</span>{" "}
        <span className="text-[#ffd866]">0</span>;
      </span>,
      <span key="6">{"}"}</span>,
    ],
  },
  cpp: {
    id: "cpp",
    filename: "main.cpp",
    badge: "C++",
    runtime: "Clang 18 (C++20)",
    errorLineNumber: 4,
    errorConsole: "error: expected ';' before 'return' (line 4)",
    successConsole: "Build Success: Hello, Cryptic to Clear! (0.01s)",
    aiBreakdown: {
      message: "The std::cout stream statement on line 4 is missing its terminating semicolon ';'.",
      suggestion: "Add ';' at end of line 4",
    },
    renderLines: (isFixed: boolean, stage: number) => [
      <span key="1">
        <span className="text-[#E8C97A] font-semibold">#include</span>{" "}
        <span className="text-[#9ee6a8]">&lt;iostream&gt;</span>
      </span>,
      <span key="2" className="text-transparent select-none">
        .
      </span>,
      <span key="3">
        <span className="text-[#E8C97A] font-semibold">int</span>{" "}
        <span className="text-[#7EB6FF]">main</span>() {"{"}
      </span>,
      <span key="4">
        &nbsp;&nbsp;<span className="text-[#7EB6FF]">std::cout</span> &lt;&lt;{" "}
        <span className="text-[#9ee6a8]">&quot;Hello, Cryptic to Clear!&quot;</span> &lt;&lt;{" "}
        <span className="text-[#7EB6FF]">std::endl</span>
        {isFixed ? (
          <span className="text-[#27c93f] font-bold bg-[#27c93f]/25 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-amber-400 font-bold ml-0.5 px-1 bg-amber-500/20 rounded">
            {"‹! missing ';'"}
          </span>
        )}
      </span>,
      <span key="5">
        &nbsp;&nbsp;<span className="text-[#E8C97A] font-semibold">return</span>{" "}
        <span className="text-[#ffd866]">0</span>;
      </span>,
      <span key="6">{"}"}</span>,
    ],
  },
  java: {
    id: "java",
    filename: "Main.java",
    badge: "Java",
    runtime: "OpenJDK 21",
    errorLineNumber: 3,
    errorConsole: "Main.java:3: error: ';' expected",
    successConsole: "Build Success: Hello, Cryptic to Clear! (0.03s)",
    aiBreakdown: {
      message: "Java statements must terminate with a semicolon ';'. Line 3 is missing a trailing ';'.",
      suggestion: "Add ';' after System.out.println statement",
    },
    renderLines: (isFixed: boolean, stage: number) => [
      <span key="1">
        <span className="text-[#E8C97A] font-semibold">public class</span>{" "}
        <span className="text-[#7EB6FF]">Main</span> {"{"}
      </span>,
      <span key="2">
        &nbsp;&nbsp;<span className="text-[#E8C97A] font-semibold">public static void</span>{" "}
        <span className="text-[#7EB6FF]">main</span>(String[] args) {"{"}
      </span>,
      <span key="3">
        &nbsp;&nbsp;&nbsp;&nbsp;<span className="text-[#7EB6FF]">System.out.println</span>(
        <span className="text-[#9ee6a8]">&quot;Hello, Cryptic to Clear!&quot;</span>)
        {isFixed ? (
          <span className="text-[#27c93f] font-bold bg-[#27c93f]/25 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-amber-400 font-bold ml-0.5 px-1 bg-amber-500/20 rounded">
            {"‹! missing ';'"}
          </span>
        )}
      </span>,
      <span key="4">&nbsp;&nbsp;{"}"}</span>,
      <span key="5">{"}"}</span>,
    ],
  },
};

const LANGUAGES: LanguageKey[] = ["python", "c", "cpp", "java"];

export default function EditorMockup() {
  // Active language tab
  const [activeLang, setActiveLang] = useState<LanguageKey>("python");

  // Stages:
  // 0: Initial state - displays Hello World code with intentional syntax error highlighted
  // 1: Compiling in progress
  // 2: Error state - Run completed, console shows compiler error & AI Error Breakdown pops up
  // 3: Applying fix & re-compiling
  // 4: Clean build success
  const [stage, setStage] = useState<number>(0);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const currentDemo = DEMOS[activeLang];

  // When language switches, reset to stage 0 (initial error state)
  const handleSelectLang = (lang: LanguageKey) => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setActiveLang(lang);
    setStage(0);
    setIsCompiling(false);
  };

  // Compile & Run handler
  const handleCompileRun = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);

    if (stage === 0) {
      // Run from initial error state -> compile -> reveal error
      setIsCompiling(true);
      setStage(1);
      setTimeout(() => {
        setIsCompiling(false);
        setStage(2);
      }, 700);
    } else if (stage === 2) {
      // In error state, clicking Compile & Run applies fix and succeeds
      handleApplyFix();
    } else if (stage === 4) {
      // Re-run or reset
      setStage(0);
    }
  };

  // Apply fix handler
  const handleApplyFix = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setStage(3);
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setStage(4);
    }, 850);
  };

  // Reset to initial error state
  const handleReset = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setStage(0);
    setIsCompiling(false);
  };

  // Gentle auto-cycle for presentation when untouched
  useEffect(() => {
    if (stage === 4) {
      autoPlayTimer.current = setTimeout(() => {
        // Cycle to next language after 6 seconds of success
        const nextIndex = (LANGUAGES.indexOf(activeLang) + 1) % LANGUAGES.length;
        setActiveLang(LANGUAGES[nextIndex]);
        setStage(0);
      }, 6000);
    }

    return () => {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    };
  }, [stage, activeLang]);

  const isFixed = stage >= 3;
  const lines = currentDemo.renderLines(isFixed, stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, delay: 0.3, ease: "easeOut" }}
      className="relative w-full max-w-[580px] mx-auto select-none"
    >
      {/* Ambient background gold aura behind editor */}
      <div className="absolute -inset-2 bg-gradient-to-r from-[rgba(184,134,11,0.18)] via-[rgba(212,175,55,0.25)] to-[rgba(232,201,122,0.12)] rounded-3xl blur-2xl opacity-75 pointer-events-none" />

      {/* Editor Main Window */}
      <div className="relative glass-strong rounded-2xl overflow-hidden panel-gold-active border border-[rgba(212,175,55,0.38)] shadow-[0_25px_70px_-15px_rgba(0,0,0,0.85)]">
        {/* Top Control Bar & Language Tabs */}
        <div className="flex flex-wrap items-center justify-between gap-2 px-3 sm:px-4 py-2.5 border-b border-[rgba(212,175,55,0.2)] bg-[rgba(10,16,30,0.8)] backdrop-blur-md">
          {/* Left: Window Dots + 4 Language Tabs */}
          <div className="flex items-center gap-2 sm:gap-3 flex-wrap">
            {/* Mac style dots */}
            <div className="flex items-center gap-1.5 mr-1">
              <span className="h-3 w-3 rounded-full bg-[#e0564c]/80 border border-[#e0564c]" />
              <span className="h-3 w-3 rounded-full bg-[#d4af37]/80 border border-[#d4af37]" />
              <span className="h-3 w-3 rounded-full bg-[#27c93f]/80 border border-[#27c93f]" />
            </div>

            {/* Language Tabs for all four languages */}
            <div className="flex items-center gap-1 bg-[rgba(7,11,20,0.6)] p-0.5 rounded-lg border border-[rgba(212,175,55,0.2)]">
              {LANGUAGES.map((lang) => {
                const isActive = activeLang === lang;
                const d = DEMOS[lang];
                return (
                  <button
                    key={lang}
                    onClick={() => handleSelectLang(lang)}
                    className={`px-2.5 py-1 rounded-md text-[11px] font-mono transition-all flex items-center gap-1.5 ${
                      isActive
                        ? "bg-[rgba(212,175,55,0.2)] text-[#f7f3eb] font-bold border border-[rgba(212,175,55,0.45)] shadow-[0_0_10px_rgba(212,175,55,0.2)]"
                        : "text-[var(--ink-dim)] hover:text-[#f7f3eb] hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <span>{d.filename}</span>
                    {isActive && <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Right: Actions (Reset + Glowing Compile / Run Button) */}
          <div className="flex items-center gap-2">
            {stage > 0 && (
              <button
                onClick={handleReset}
                title="Reset Code"
                className="p-1.5 rounded-lg glass text-[var(--ink-dim)] hover:text-[#E8C97A] hover:border-[rgba(212,175,55,0.4)] transition-all"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}

            <button
              onClick={handleCompileRun}
              title="Compile & Run Code"
              className="btn-gold px-3.5 py-1.5 text-[11px] font-bold text-white rounded-lg shadow-[0_0_18px_rgba(212,175,55,0.45)] hover:shadow-[0_0_26px_rgba(232,201,122,0.7)] gap-1.5 transition-all"
            >
              {isCompiling ? (
                <>
                  <RefreshCw className="w-3 h-3 animate-spin text-white" />
                  <span>Compiling...</span>
                </>
              ) : stage === 2 ? (
                <>
                  <Sparkles className="w-3 h-3 text-white" />
                  <span>Fix & Run</span>
                </>
              ) : stage === 4 ? (
                <>
                  <Play className="w-3 h-3 fill-white text-white" />
                  <span>Re-Run</span>
                </>
              ) : (
                <>
                  <Play className="w-3 h-3 fill-white text-white" />
                  <span>Compile & Run</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="p-4 sm:p-5 font-mono text-[13px] leading-relaxed min-h-[200px] bg-[rgba(7,11,20,0.6)]">
          {lines.map((lineContent, index) => {
            const lineNum = index + 1;
            const isErrorLine = lineNum === currentDemo.errorLineNumber;

            return (
              <div
                key={lineNum}
                className={`flex gap-3 sm:gap-4 py-0.5 transition-colors duration-300 ${
                  isErrorLine && !isFixed
                    ? "bg-[rgba(212,175,55,0.12)] border-l-2 border-[#D4AF37] -mx-4 sm:-mx-5 px-4 sm:px-5"
                    : isErrorLine && isFixed
                    ? "bg-[rgba(39,201,63,0.12)] border-l-2 border-[#27c93f] -mx-4 sm:-mx-5 px-4 sm:px-5"
                    : ""
                }`}
              >
                <span className="select-none text-[var(--ink-faint)] w-5 text-right shrink-0">
                  {lineNum}
                </span>
                <span className="text-[var(--ink)] flex-1 overflow-x-auto whitespace-pre">
                  {lineContent}
                </span>
              </div>
            );
          })}
        </div>

        {/* Live Terminal & Status Footer */}
        <div className="px-4 sm:px-5 py-3 border-t border-[rgba(212,175,55,0.2)] bg-[rgba(10,16,30,0.85)] flex items-center justify-between font-mono text-[12px]">
          <div className="flex items-center gap-2 overflow-hidden text-ellipsis whitespace-nowrap">
            <span className="text-[var(--ink-dim)] shrink-0">Console:</span>
            {isCompiling ? (
              <span className="text-[#E8C97A] flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-[#E8C97A]" />
                Compiling program...
              </span>
            ) : stage === 2 ? (
              <span className="text-amber-300 flex items-center gap-1.5 font-medium truncate">
                <AlertTriangle className="w-3.5 h-3.5 text-[#D4AF37] shrink-0" />
                <span>{currentDemo.errorConsole}</span>
              </span>
            ) : stage === 4 ? (
              <span className="text-emerald-400 flex items-center gap-1.5 font-semibold truncate">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span>{currentDemo.successConsole}</span>
              </span>
            ) : (
              <span className="text-[var(--ink-faint)]">
                Ready — click &quot;Compile &amp; Run&quot; to execute
              </span>
            )}
          </div>

          <span className="text-[10px] text-[#c5bba8] tracking-wider uppercase font-semibold shrink-0 ml-2">
            {currentDemo.runtime}
          </span>
        </div>
      </div>

      {/* Floating AI Error Breakdown Popover with Gold Accents */}
      <AnimatePresence>
        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.35, ease: "easeOut" }}
            className="absolute -right-2 sm:-right-6 top-[32%] w-[280px] sm:w-[310px] glass-strong rounded-xl p-4 shadow-2xl border border-[rgba(212,175,55,0.65)] shadow-[0_15px_40px_rgba(212,175,55,0.25)] z-20"
          >
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-1.5 text-[#E8C97A]">
                <Sparkles className="h-4 w-4 animate-pulse text-[#D4AF37]" />
                <span className="text-[12px] font-serif font-bold text-[#E8C97A]">
                  AI Error Breakdown
                </span>
              </div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(212,175,55,0.15)] text-[#E8C97A] border border-[rgba(212,175,55,0.3)]">
                Line {currentDemo.errorLineNumber}
              </span>
            </div>

            <p className="text-[12px] text-[#f7f3eb] leading-relaxed mb-3">
              {currentDemo.aiBreakdown.message}
            </p>

            <div className="flex items-center justify-between pt-2 border-t border-[rgba(212,175,55,0.25)]">
              <span className="text-[10px] text-[#c5bba8] font-mono truncate max-w-[170px]">
                {currentDemo.aiBreakdown.suggestion}
              </span>
              <button
                onClick={handleApplyFix}
                className="btn-gold px-2.5 py-1 text-[10px] font-bold text-white rounded shadow-sm"
              >
                Apply Fix
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error Badge on Window Edge */}
      <AnimatePresence>
        {!isFixed && stage === 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute -left-3 sm:-left-6 top-8 flex items-center gap-1.5 glass rounded-full px-3 py-1 border border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.35)] z-20"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-[#D4AF37]" />
            <span className="text-[11px] font-mono text-[#E8C97A] font-medium">1 syntax warning</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Active Diagnostic Alert Badge during error stage */}
      <AnimatePresence>
        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute -left-3 sm:-left-6 top-8 flex items-center gap-1.5 glass rounded-full px-3 py-1 border border-amber-400 shadow-[0_0_15px_rgba(212,175,55,0.45)] z-20"
          >
            <AlertTriangle className="h-3.5 w-3.5 text-amber-400" />
            <span className="text-[11px] font-mono text-amber-300 font-medium">Build Failed</span>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Success Badge after fix */}
      <AnimatePresence>
        {stage === 4 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, x: -10 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.8, x: -10 }}
            transition={{ duration: 0.3 }}
            className="absolute -left-3 sm:-left-6 top-8 flex items-center gap-1.5 glass rounded-full px-3 py-1 border border-emerald-400 shadow-[0_0_15px_rgba(39,201,63,0.35)] z-20"
          >
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-[11px] font-mono text-emerald-300 font-medium">Clean Build</span>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
