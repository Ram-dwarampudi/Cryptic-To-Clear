"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowDown,
  ArrowRight,
  Sparkles,
  AlertCircle,
  CheckCircle2,
  Code2,
  Wand2,
  Terminal,
  Play,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";

interface ErrorScenario {
  id: string;
  lang: string;
  title: string;
  codeSnippet: string;
  crypticError: string;
  clearExplanation: string;
  whyExplanation: string;
  suggestedFix: string;
  fixedCodeSnippet: string;
  output: string;
}

const SCENARIOS: ErrorScenario[] = [
  {
    id: "js-typeerror",
    lang: "JavaScript",
    title: "TypeError (undefined property)",
    codeSnippet: `function greetUser(user) {\n  // Attempting to read property\n  console.log("Hello, " + user.name);\n}\n\ngreetUser();`,
    crypticError: `TypeError: Cannot read properties of undefined (reading 'name')\n    at greetUser (index.js:3:32)\n    at Object.<anonymous> (index.js:6:1)\n    at Module._compile (node:internal/modules/cjs/loader:1376:14)`,
    clearExplanation: "You're trying to access '.name' on a variable ('user') that is undefined because greetUser() was called without any arguments on line 6.",
    whyExplanation: "In JavaScript, passing no argument gives parameters the value 'undefined'. Calling undefined.name throws a runtime TypeError.",
    suggestedFix: "Provide a fallback object or default parameter: function greetUser(user = { name: 'Guest' })",
    fixedCodeSnippet: `function greetUser(user = { name: "Developer" }) {\n  // Default parameter prevents crash\n  console.log("Hello, " + user.name);\n}\n\ngreetUser();`,
    output: "Hello, Developer!\n[Process exited with code 0]",
  },
  {
    id: "py-syntax",
    lang: "Python",
    title: "SyntaxError (Unclosed Parenthesis)",
    codeSnippet: `def calculate_average(nums):\n    total = sum(nums\n    return total / len(nums)\n\nprint(calculate_average([10, 20, 30]))`,
    crypticError: `  File "main.py", line 3\n    return total / len(nums)\n    ^^^^^^\nSyntaxError: invalid syntax`,
    clearExplanation: "The error is pointing to line 3, but the actual bug is on line 2: you opened sum(nums but never closed the parenthesis ')'.",
    whyExplanation: "Python parsers continue looking across line breaks for closing delimiters until an unexpected keyword like 'return' is encountered.",
    suggestedFix: "Add ')' to complete the call: total = sum(nums)",
    fixedCodeSnippet: `def calculate_average(nums):\n    total = sum(nums)\n    return total / len(nums)\n\nprint(calculate_average([10, 20, 30]))`,
    output: "20.0\n[Process completed in 0.02s]",
  },
  {
    id: "c-semicolon",
    lang: "C",
    title: "Expected Semicolon Error",
    codeSnippet: `#include <stdio.h>\n\nint main(void) {\n    int devScore = 95\n    printf("Score: %d\\n", devScore);\n    return 0;\n}`,
    crypticError: `main.c:5:5: error: expected ';' before 'printf'\n    5 |     printf("Score: %d\\n", devScore);\n      |     ^~~~~~`,
    clearExplanation: "Line 4 is missing a semicolon. The compiler only detected the issue when reading 'printf' on line 5.",
    whyExplanation: "In C, semicolons separate consecutive statements. Without ';', the compiler assumes the next token is an extension of the previous expression.",
    suggestedFix: "Append ';' to line 4: int devScore = 95;",
    fixedCodeSnippet: `#include <stdio.h>\n\nint main(void) {\n    int devScore = 95;\n    printf("Score: %d\\n", devScore);\n    return 0;\n}`,
    output: "Score: 95\n[Process completed in 0.01s]",
  },
  {
    id: "cpp-namespace",
    lang: "C++",
    title: "Undeclared Identifier",
    codeSnippet: `#include <iostream>\n\nint main() {\n    cout << "Welcome to Cryptic to Clear!" << endl;\n    return 0;\n}`,
    crypticError: `main.cpp:4:5: error: use of undeclared identifier 'cout'; did you mean 'std::cout'?\n    cout << "Welcome to Cryptic to Clear!" << endl;\n    ^~~~\n    std::cout`,
    clearExplanation: "C++ standard stream objects live inside the 'std' namespace. The compiler cannot find 'cout' unless you prefix it with std:: or use a namespace declaration.",
    whyExplanation: "Unlike C, C++ groups standard library functions into namespaces to avoid naming collisions in large projects.",
    suggestedFix: "Prefix cout and endl with 'std::' or add 'using namespace std;' at the top.",
    fixedCodeSnippet: `#include <iostream>\n\nint main() {\n    std::cout << "Welcome to Cryptic to Clear!" << std::endl;\n    return 0;\n}`,
    output: "Welcome to Cryptic to Clear!\n[Process completed in 0.01s]",
  },
];

export default function CrypticWorkflowShowcase() {
  const [selectedScenario, setSelectedScenario] = useState<ErrorScenario>(SCENARIOS[0]);
  const [isFixed, setIsFixed] = useState(false);

  const handleSelectScenario = (s: ErrorScenario) => {
    setSelectedScenario(s);
    setIsFixed(false);
  };

  return (
    <section id="workflow-demo" className="relative py-20 sm:py-28 px-5 sm:px-8 border-t border-white/10 bg-[#070b14] overflow-hidden">
      {/* Background ambient lighting */}
      <div className="blob h-[400px] w-[400px] bg-[rgba(212,175,55,0.1)] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-none" />

      <div className="mx-auto max-w-7xl relative">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-14 space-y-3">
          <div className="inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 font-mono text-[12px] bg-[#0c1322] border border-[#D4AF37]/35 text-[#E8C97A]">
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span className="font-semibold uppercase tracking-wider">The Core Value Proposition</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight">
            How <span className="bg-gradient-to-r from-red-400 via-[#E8C97A] to-emerald-400 bg-clip-text text-transparent">Cryptic → Clear</span> Works
          </h2>

          <p className="text-slate-300 text-base sm:text-lg max-w-2xl mx-auto">
            Real compiler error messages are notoriously cryptic. Watch how Cryptic to Clear translates confusing build failures into plain English and one-click fixes.
          </p>

          {/* Scenario Selector Pills */}
          <div className="pt-4 flex flex-wrap justify-center gap-2">
            {SCENARIOS.map((s) => (
              <button
                key={s.id}
                type="button"
                onClick={() => handleSelectScenario(s)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-mono transition-all cursor-pointer ${
                  selectedScenario.id === s.id
                    ? "bg-[#D4AF37] text-black font-bold shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                    : "bg-white/5 hover:bg-white/10 text-slate-300 border border-white/10"
                }`}
              >
                <span>{s.lang}: {s.title}</span>
              </button>
            ))}
          </div>
        </div>

        {/* 3-Stage Transformation Pipeline */}
        <div className="grid lg:grid-cols-3 gap-6 relative items-stretch">
          {/* STAGE 1: CRYPTIC */}
          <div className="rounded-2xl bg-[#0c1322] border border-red-500/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-red-500/20">
                <div className="flex items-center gap-2 text-red-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-red-500/20 text-xs font-bold font-mono">
                    01
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Cryptic Compiler Error
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-red-500/20 text-red-300 border border-red-500/30">
                  Raw Output
                </span>
              </div>

              {/* Code Snippet with Error */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[11px] text-slate-400 block font-semibold">User Code:</span>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-200 overflow-x-auto whitespace-pre font-mono text-[12px] leading-relaxed">
                  {selectedScenario.codeSnippet}
                </div>
              </div>

              {/* Raw Error Trace */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[11px] text-red-400 block font-semibold">Compiler Diagnostics:</span>
                <div className="p-3 rounded-xl bg-red-950/30 border border-red-500/30 text-red-300 font-mono text-[11px] leading-relaxed whitespace-pre overflow-x-auto">
                  {selectedScenario.crypticError}
                </div>
              </div>
            </div>

            {/* Down / Right Indicator */}
            <div className="pt-4 flex items-center justify-center text-red-400">
              <span className="text-[11px] font-mono flex items-center gap-1.5 opacity-80">
                <span>Confusing Stack Trace</span>
                <ArrowRight className="w-3.5 h-3.5 hidden lg:inline" />
                <ArrowDown className="w-3.5 h-3.5 lg:hidden" />
              </span>
            </div>
          </div>

          {/* STAGE 2: CLEAR */}
          <div className="rounded-2xl bg-[#0e1628] border border-[#D4AF37]/50 p-6 flex flex-col justify-between shadow-[0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden ring-1 ring-[#D4AF37]/30">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20">
                <div className="flex items-center gap-2 text-[#E8C97A]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#D4AF37]/20 text-xs font-bold font-mono">
                    02
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider text-white">
                    ✦ Clear AI Explanation
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[rgba(212,175,55,0.15)] text-[#E8C97A] border border-[rgba(212,175,55,0.3)]">
                  Plain English
                </span>
              </div>

              {/* Diagnosis Callout */}
              <div className="p-4 rounded-xl bg-black/40 border border-[#D4AF37]/30 space-y-2.5">
                <div className="flex items-start gap-2 text-xs text-white leading-relaxed">
                  <Sparkles className="w-4 h-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <p className="font-medium text-[12.5px]">{selectedScenario.clearExplanation}</p>
                </div>

                <div className="pt-2 border-t border-white/10 space-y-1">
                  <span className="text-[10px] uppercase font-mono text-slate-400 font-bold tracking-wider">
                    Why this happens:
                  </span>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">
                    {selectedScenario.whyExplanation}
                  </p>
                </div>
              </div>

              {/* Suggested Action Preview */}
              <div className="space-y-1 font-mono text-xs">
                <span className="text-[11px] text-[#E8C97A] font-semibold block">Suggested Solution:</span>
                <p className="text-xs text-slate-200 bg-white/[0.04] p-3 rounded-xl border border-white/10 leading-relaxed">
                  {selectedScenario.suggestedFix}
                </p>
              </div>
            </div>

            {/* Interactive Apply Fix Button */}
            <div className="pt-4 space-y-2">
              <button
                type="button"
                onClick={() => setIsFixed(!isFixed)}
                className={`w-full py-2.5 px-4 rounded-xl font-mono text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer ${
                  isFixed
                    ? "bg-emerald-500 text-black shadow-lg hover:bg-emerald-400"
                    : "btn-gold text-black shadow-[0_0_20px_rgba(212,175,55,0.35)]"
                }`}
              >
                {isFixed ? (
                  <>
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Fix Applied ✓ (Click to reset)</span>
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4" />
                    <span>[ Apply Fix ✓ ]</span>
                  </>
                )}
              </button>

              <p className="text-[11px] text-center font-mono text-slate-400">
                Click button to preview patch & clean execution &rarr;
              </p>
            </div>
          </div>

          {/* STAGE 3: SUCCESS */}
          <div className="rounded-2xl bg-[#09121d] border border-emerald-500/30 p-6 flex flex-col justify-between shadow-xl relative overflow-hidden">
            <div className="space-y-4">
              {/* Header */}
              <div className="flex items-center justify-between pb-3 border-b border-emerald-500/20">
                <div className="flex items-center gap-2 text-emerald-400">
                  <span className="flex h-6 w-6 items-center justify-center rounded-lg bg-emerald-500/20 text-xs font-bold font-mono">
                    03
                  </span>
                  <span className="font-mono text-xs font-bold uppercase tracking-wider">
                    Program Executed
                  </span>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  {isFixed ? "Success" : "Pending Fix"}
                </span>
              </div>

              {/* Resolved Code */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[11px] text-slate-400 block font-semibold">Clean Patched Code:</span>
                <div className="p-3 rounded-xl bg-black/60 border border-white/10 text-slate-200 overflow-x-auto whitespace-pre font-mono text-[12px] leading-relaxed">
                  {isFixed ? selectedScenario.fixedCodeSnippet : selectedScenario.codeSnippet}
                </div>
              </div>

              {/* Successful Terminal Output */}
              <div className="space-y-1.5 font-mono text-xs">
                <span className="text-[11px] text-emerald-400 block font-semibold">Execution Output:</span>
                <div className={`p-3 rounded-xl border font-mono text-[11.5px] leading-relaxed whitespace-pre overflow-x-auto transition-all ${
                  isFixed
                    ? "bg-emerald-950/30 border-emerald-500/40 text-emerald-300"
                    : "bg-black/40 border-white/10 text-slate-500 italic"
                }`}>
                  {isFixed
                    ? selectedScenario.output
                    : "Click '[ Apply Fix ✓ ]' in the center card to run this code cleanly."}
                </div>
              </div>
            </div>

            {/* Action to compiler */}
            <div className="pt-4 flex items-center justify-between border-t border-white/10">
              <span className="text-xs font-mono text-slate-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                <span>Zero Latency Loop</span>
              </span>

              <Link
                href="/compiler"
                className="btn-gold py-1.5 px-3.5 rounded-xl font-mono text-xs font-bold text-black flex items-center gap-1.5"
              >
                <span>Open Compiler</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
