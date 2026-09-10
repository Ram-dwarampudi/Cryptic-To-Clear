"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Play,
  CheckCircle2,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  Copy,
  Check,
  Terminal,
  Code2,
  Wand2,
  ChevronRight,
  ExternalLink,
  Loader2,
} from "lucide-react";
import Link from "next/link";

type LanguageKey = "python" | "c" | "cpp" | "java";

interface LanguageDemo {
  id: LanguageKey;
  filename: string;
  badge: string;
  runtime: string;
  errorLineNumber: number;
  errorType: string;
  errorConsole: string;
  successConsole: string;
  aiBreakdown: {
    title: string;
    summary: string;
    why: string;
    fixText: string;
  };
  renderLines: (isFixed: boolean, stage: number) => React.ReactNode[];
  rawCode: (isFixed: boolean) => string;
}

const DEMOS: Record<LanguageKey, LanguageDemo> = {
  python: {
    id: "python",
    filename: "main.py",
    badge: "Python",
    runtime: "Python 3.12 (CPython)",
    errorLineNumber: 3,
    errorType: "SyntaxError",
    errorConsole: 'SyntaxError: \'(\' was never closed (line 3)\nTraceback (most recent call last):\n  File "main.py", line 3, in <module>',
    successConsole: "Hello, Cryptic to Clear!\n\n[Process completed in 0.02s — Exit Code 0]",
    aiBreakdown: {
      title: "Missing Closing Parenthesis",
      summary: "You called print() on line 3 but forgot the closing ')' character.",
      why: "In Python, every opened parenthesis must be paired and closed before the statement ends.",
      fixText: "Add ')' to close the print statement on line 3.",
    },
    rawCode: (isFixed) =>
      `def main():\n    # Process user greeting\n    print("Hello, Cryptic to Clear!"${isFixed ? ")" : ""}\n\nmain()`,
    renderLines: (isFixed) => [
      <span key="1">
        <span className="text-[#E8C97A] font-semibold">def</span>{" "}
        <span className="text-[#7EB6FF]">main</span>():
      </span>,
      <span key="2" className="text-slate-500 italic">
        &nbsp;&nbsp;# Output developer greeting
      </span>,
      <span key="3">
        &nbsp;&nbsp;<span className="text-[#7EB6FF]">print</span>(
        <span className="text-[#9ee6a8]">&quot;Hello, Cryptic to Clear!&quot;</span>
        {isFixed ? (
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded animate-pulse">)</span>
        ) : (
          <span className="text-red-400 font-bold ml-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[11px]">
            {"‹! SyntaxError: missing ')'"}
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
    errorType: "Compile Error",
    errorConsole: 'main.c:4:42: error: expected \';\' before \'return\'\n    4 |   printf("Hello, Cryptic to Clear!\\n")\n      |                                          ^\n      |                                          ;',
    successConsole: "Hello, Cryptic to Clear!\n\n[Process completed in 0.01s — Exit Code 0]",
    aiBreakdown: {
      title: "Expected Semicolon ';'",
      summary: "In C, every statement must terminate with a semicolon ';'.",
      why: "The compiler parser reached 'return' on line 5 while still expecting the terminating ';' for the printf statement.",
      fixText: "Add ';' to the end of the printf call on line 4.",
    },
    rawCode: (isFixed) =>
      `#include <stdio.h>\n\nint main(void) {\n    printf("Hello, Cryptic to Clear!\\n")${isFixed ? ";" : ""}\n    return 0;\n}`,
    renderLines: (isFixed) => [
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
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-red-400 font-bold ml-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[11px]">
            {"‹! expected ';'"}
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
    errorType: "Compile Error",
    errorConsole: 'main.cpp:4:52: error: expected \';\' after expression\n    4 |   std::cout << "Hello, Cryptic to Clear!" << std::endl\n      |                                                    ^\n      |                                                    ;',
    successConsole: "Hello, Cryptic to Clear!\n\n[Process completed in 0.01s — Exit Code 0]",
    aiBreakdown: {
      title: "Missing Stream Semicolon",
      summary: "The std::cout stream expression on line 4 lacks a terminating ';'.",
      why: "C++ expressions must be terminated with a semicolon before starting the next statement.",
      fixText: "Add ';' after std::endl on line 4.",
    },
    rawCode: (isFixed) =>
      `#include <iostream>\n\nint main() {\n    std::cout << "Hello, Cryptic to Clear!" << std::endl${isFixed ? ";" : ""}\n    return 0;\n}`,
    renderLines: (isFixed) => [
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
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-red-400 font-bold ml-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[11px]">
            {"‹! expected ';'"}
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
    errorType: "SyntaxError",
    errorConsole: 'Main.java:3: error: \';\' expected\n    System.out.println("Hello, Cryptic to Clear!")\n                                                  ^\n1 error',
    successConsole: "Hello, Cryptic to Clear!\n\n[Process completed in 0.03s — Exit Code 0]",
    aiBreakdown: {
      title: "Missing Semicolon",
      summary: "Java statements must terminate with a semicolon ';'.",
      why: "Line 3 is missing a semicolon after the System.out.println() method invocation.",
      fixText: "Append ';' directly after the method argument list.",
    },
    rawCode: (isFixed) =>
      `public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello, Cryptic to Clear!")${isFixed ? ";" : ""}\n    }\n}`,
    renderLines: (isFixed) => [
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
          <span className="text-emerald-400 font-bold bg-emerald-500/20 px-1 rounded animate-pulse">;</span>
        ) : (
          <span className="text-red-400 font-bold ml-1 px-1.5 py-0.5 bg-red-500/20 border border-red-500/30 rounded text-[11px]">
            {"‹! ';' expected"}
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
  const [activeLang, setActiveLang] = useState<LanguageKey>("python");
  // 0: Initial Code with Error
  // 1: Compiling
  // 2: Error Revealed + AI Panel Open
  // 3: Applying Fix
  // 4: Clean Execution
  const [stage, setStage] = useState<number>(0);
  const [isCompiling, setIsCompiling] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);
  const autoPlayTimer = useRef<NodeJS.Timeout | null>(null);

  const currentDemo = DEMOS[activeLang];

  const handleSelectLang = (lang: LanguageKey) => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setActiveLang(lang);
    setStage(0);
    setIsCompiling(false);
  };

  const handleCompileRun = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);

    if (stage === 0) {
      setIsCompiling(true);
      setStage(1);
      setTimeout(() => {
        setIsCompiling(false);
        setStage(2);
      }, 600);
    } else if (stage === 2) {
      handleApplyFix();
    } else if (stage === 4) {
      setStage(0);
    }
  };

  const handleApplyFix = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setStage(3);
    setIsCompiling(true);
    setTimeout(() => {
      setIsCompiling(false);
      setStage(4);
    }, 750);
  };

  const handleReset = () => {
    if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    setStage(0);
    setIsCompiling(false);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(currentDemo.rawCode(stage >= 3));
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard fallback
    }
  };

  useEffect(() => {
    if (stage === 4) {
      autoPlayTimer.current = setTimeout(() => {
        const nextIndex = (LANGUAGES.indexOf(activeLang) + 1) % LANGUAGES.length;
        setActiveLang(LANGUAGES[nextIndex]);
        setStage(0);
      }, 7000);
    }
    return () => {
      if (autoPlayTimer.current) clearTimeout(autoPlayTimer.current);
    };
  }, [stage, activeLang]);

  const isFixed = stage >= 3;
  const lines = currentDemo.renderLines(isFixed, stage);

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, delay: 0.2 }}
      className="relative w-full max-w-[620px] mx-auto select-none"
    >
      {/* Ambient shadow glow */}
      <div className="absolute -inset-1 bg-gradient-to-br from-[#D4AF37]/20 via-cyan-500/10 to-indigo-500/10 rounded-2xl blur-xl opacity-60 pointer-events-none" />

      {/* Main IDE Window Container */}
      <div className="relative rounded-2xl overflow-hidden bg-[#090e1a] border border-white/10 shadow-[0_20px_60px_rgba(0,0,0,0.8)] flex flex-col">
        {/* Top IDE Window Header & Tabs */}
        <div className="flex items-center justify-between px-3.5 py-2.5 bg-[#0e1526] border-b border-white/10">
          {/* Window dots & File Tabs */}
          <div className="flex items-center gap-3 overflow-x-auto scrollbar-none">
            {/* Window control dots */}
            <div className="flex items-center gap-1.5 mr-1 shrink-0">
              <span className="h-3 w-3 rounded-full bg-[#ef4444]/80 border border-[#ef4444]" />
              <span className="h-3 w-3 rounded-full bg-[#f59e0b]/80 border border-[#f59e0b]" />
              <span className="h-3 w-3 rounded-full bg-[#10b981]/80 border border-[#10b981]" />
            </div>

            {/* Language File Tabs */}
            <div className="flex items-center gap-1">
              {LANGUAGES.map((lang) => {
                const isActive = activeLang === lang;
                const d = DEMOS[lang];
                return (
                  <button
                    key={lang}
                    type="button"
                    onClick={() => handleSelectLang(lang)}
                    className={`px-3 py-1 rounded-lg text-[11.5px] font-mono transition-all flex items-center gap-1.5 cursor-pointer shrink-0 ${
                      isActive
                        ? "bg-[#16213b] text-white font-semibold border border-white/15 shadow-sm"
                        : "text-slate-400 hover:text-slate-200 hover:bg-white/5 border border-transparent"
                    }`}
                  >
                    <Code2 className="w-3 h-3 text-[#D4AF37]" />
                    <span>{d.filename}</span>
                    {isActive && (
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Quick Toolbar Actions */}
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleCopyCode}
              title="Copy code"
              className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            </button>

            {stage > 0 && (
              <button
                type="button"
                onClick={handleReset}
                title="Reset Demo"
                className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Code Editor Body */}
        <div className="p-4 sm:p-5 font-mono text-[13px] leading-relaxed min-h-[175px] bg-[#070b14]">
          {lines.map((lineContent, index) => {
            const lineNum = index + 1;
            const isErrorLine = lineNum === currentDemo.errorLineNumber;

            return (
              <div
                key={lineNum}
                className={`flex gap-3 sm:gap-4 py-0.5 transition-colors duration-200 ${
                  isErrorLine && !isFixed
                    ? "bg-red-500/10 border-l-2 border-red-500 -mx-4 sm:-mx-5 px-4 sm:px-5"
                    : isErrorLine && isFixed
                    ? "bg-emerald-500/10 border-l-2 border-emerald-500 -mx-4 sm:-mx-5 px-4 sm:px-5"
                    : ""
                }`}
              >
                <span className="select-none text-slate-600 w-5 text-right shrink-0">
                  {lineNum}
                </span>
                <span className="text-slate-100 flex-1 overflow-x-auto whitespace-pre">
                  {lineContent}
                </span>
              </div>
            );
          })}
        </div>

        {/* IDE Action Bar with Primary Run Button */}
        <div className="px-4 py-2.5 bg-[#0b1120] border-t border-b border-white/10 flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[11px] font-mono text-slate-400">Target:</span>
            <span className="text-[11px] font-mono text-[#E8C97A] font-semibold">
              {currentDemo.runtime}
            </span>
          </div>

          <button
            type="button"
            onClick={handleCompileRun}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-xl font-mono text-xs font-bold transition-all shadow-md cursor-pointer ${
              stage === 2
                ? "bg-gradient-to-r from-[#D4AF37] to-amber-500 text-black hover:opacity-95 shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                : stage === 4
                ? "bg-emerald-500 hover:bg-emerald-400 text-black shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                : "btn-gold text-black shadow-[0_0_18px_rgba(212,175,55,0.35)]"
            }`}
          >
            {isCompiling ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : stage === 2 ? (
              <>
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Fix & Run</span>
              </>
            ) : stage === 4 ? (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run Again</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-black" />
                <span>Run / Compile</span>
              </>
            )}
          </button>
        </div>

        {/* Terminal / Console Pane */}
        <div className="bg-[#050811] p-3.5 sm:p-4 font-mono text-xs">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-white/5 text-[11px] text-slate-500">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-slate-400" />
              <span className="uppercase font-bold tracking-wider text-slate-300">Terminal</span>
            </div>
            <span>
              {stage === 2 ? (
                <span className="text-red-400 flex items-center gap-1 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-red-500 animate-ping" />
                  Exit Code 1 (Error)
                </span>
              ) : stage === 4 ? (
                <span className="text-emerald-400 flex items-center gap-1 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400" />
                  Exit Code 0 (Success)
                </span>
              ) : (
                "Status: Idle"
              )}
            </span>
          </div>

          <div className="min-h-[55px] flex items-center">
            {isCompiling ? (
              <div className="flex items-center gap-2 text-[#E8C97A]">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Executing {currentDemo.filename}...</span>
              </div>
            ) : stage === 2 ? (
              <div className="text-red-300 whitespace-pre-line leading-relaxed font-mono text-[11.5px]">
                {currentDemo.errorConsole}
              </div>
            ) : stage === 4 ? (
              <div className="text-emerald-400 whitespace-pre-line leading-relaxed font-mono font-medium">
                {currentDemo.successConsole}
              </div>
            ) : (
              <div className="text-slate-500 text-[11.5px]">
                Ready. Click <strong className="text-slate-300">Run / Compile</strong> to execute.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* DISTINCTIVE ✦ CRYPTIC AI DEBUGGER POPUP PANEL */}
      <AnimatePresence>
        {stage === 2 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 15 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.94, y: 10 }}
            transition={{ duration: 0.3 }}
            className="absolute -right-2 sm:-right-6 top-[28%] w-[300px] sm:w-[340px] rounded-2xl bg-[#0b1222] border border-[#D4AF37]/50 p-4 shadow-[0_20px_50px_rgba(0,0,0,0.85)] z-20 space-y-3 font-mono"
          >
            {/* AI Panel Header */}
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <div className="flex items-center gap-2 text-[#E8C97A]">
                <Sparkles className="w-4 h-4 text-[#D4AF37] animate-pulse" />
                <span className="text-xs font-bold font-sans tracking-wide text-white">
                  ✦ Cryptic AI Debugger
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-red-500/20 text-red-300 border border-red-500/30">
                Line {currentDemo.errorLineNumber}
              </span>
            </div>

            {/* Error & Plain English Explanation */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center gap-1.5 text-red-400 font-bold">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                <span>{currentDemo.aiBreakdown.title}</span>
              </div>
              <p className="text-slate-300 text-[11.5px] leading-relaxed">
                {currentDemo.aiBreakdown.summary}
              </p>
            </div>

            {/* Why This Happened Section */}
            <div className="p-2 rounded-xl bg-white/[0.04] border border-white/5 space-y-1 text-[11px]">
              <span className="text-slate-400 font-bold uppercase text-[9px] tracking-wider block">
                Why this happened:
              </span>
              <p className="text-slate-300 leading-normal">
                {currentDemo.aiBreakdown.why}
              </p>
            </div>

            {/* Suggested Fix Action */}
            <div className="pt-1 flex items-center justify-between gap-2">
              <button
                type="button"
                onClick={handleApplyFix}
                className="flex-1 btn-gold py-1.5 px-3 rounded-xl text-xs font-bold text-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md"
              >
                <Wand2 className="w-3.5 h-3.5" />
                <span>Apply Fix</span>
              </button>

              <Link
                href="/compiler"
                className="px-2.5 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-300 text-[11px] flex items-center gap-1 border border-white/10"
              >
                <span>Try Live</span>
                <ChevronRight className="w-3 h-3" />
              </Link>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
