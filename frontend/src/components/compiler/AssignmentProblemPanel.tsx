"use client";

import React, { useState } from "react";
import { AssignmentItem } from "@/lib/api";
import {
  BookOpen,
  Calendar,
  Clock,
  Code2,
  ChevronLeft,
  ChevronRight,
  Award,
  AlertCircle,
  Copy,
  Check,
  Tag,
  GraduationCap,
  Sparkles,
} from "lucide-react";

interface AssignmentProblemPanelProps {
  assignment: AssignmentItem;
  isOpen: boolean;
  onToggle: () => void;
  onSelectTestCase?: (index: number) => void;
}

export default function AssignmentProblemPanel({
  assignment,
  isOpen,
  onToggle,
  onSelectTestCase,
}: AssignmentProblemPanelProps) {
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);

  const handleCopy = (text: string, idx: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 1500);
  };

  const isRestricted = assignment.languageMode === "RESTRICTED";
  const allowedText =
    isRestricted && assignment.allowedLanguages && assignment.allowedLanguages.length > 0
      ? assignment.allowedLanguages.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ")
      : "Any Supported Language";

  const difficultyColor =
    assignment.difficulty === "easy"
      ? "text-emerald-400 border-emerald-500/30 bg-emerald-500/10"
      : assignment.difficulty === "hard"
      ? "text-rose-400 border-rose-500/30 bg-rose-500/10"
      : "text-amber-400 border-amber-500/30 bg-amber-500/10";

  const revealedCases = (assignment.testCases || []).filter((tc) => !tc.isHidden);
  const hiddenCasesCount = (assignment.testCases || []).filter((tc) => tc.isHidden).length;

  // Formatted deadline
  let deadlineStr = assignment.deadline;
  try {
    const d = new Date(assignment.deadline);
    if (!isNaN(d.getTime())) {
      deadlineStr = d.toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  } catch {
    deadlineStr = assignment.deadline;
  }

  if (!isOpen) {
    return (
      <div className="shrink-0 bg-[#050507] border-r border-white/10 flex flex-col items-center py-4 px-1.5 select-none">
        <button
          onClick={onToggle}
          title="Open Problem Statement & Constraints"
          className="p-2 rounded-xl bg-amber-500/15 text-amber-300 border border-amber-500/30 hover:bg-amber-500/25 transition-colors cursor-pointer flex flex-col items-center gap-1.5"
        >
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="text-[10px] font-mono [writing-mode:vertical-rl] rotate-180 tracking-wider font-bold text-amber-300">
            PROBLEM SPECS
          </span>
          <ChevronRight className="w-3.5 h-3.5 mt-1 text-amber-400" />
        </button>
      </div>
    );
  }

  return (
    <aside className="w-80 md:w-96 shrink-0 bg-[#050507] border-r border-white/10 flex flex-col h-full font-mono text-xs select-none overflow-hidden animate-in slide-in-from-left duration-200">
      {/* Panel Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-white/10 bg-[#0d0d10] shrink-0">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-amber-400" />
          <span className="font-bold text-white text-[13px] tracking-tight">Assignment Specs</span>
        </div>
        <button
          onClick={onToggle}
          title="Collapse problem statement panel"
          className="p-1 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
      </div>

      {/* Scrollable Problem Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4 select-text custom-scrollbar">
        {/* Title & Metadata Badges */}
        <div className="space-y-2">
          <h2 className="text-base font-display font-bold text-white leading-snug">
            {assignment.title}
          </h2>

          <div className="flex flex-wrap items-center gap-1.5 pt-0.5">
            <span
              className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase border ${difficultyColor}`}
            >
              {assignment.difficulty || "Medium"}
            </span>

            <span className="flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/10 text-amber-300 border border-amber-500/30">
              <Award className="w-3 h-3 text-amber-400" />
              <span>{assignment.points || 100} pts</span>
            </span>

            <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-black/60 text-zinc-200 border border-white/15">
              {assignment.className || "Class Section"}
            </span>
          </div>
        </div>

        {/* Due Date & Attempts banner */}
        <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10 text-[11.5px] space-y-1.5">
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Due Date:</span>
            </span>
            <strong className="text-white">{deadlineStr}</strong>
          </div>
          <div className="flex items-center justify-between text-zinc-400">
            <span className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-amber-400/80" />
              <span>Max Attempts:</span>
            </span>
            <strong className="text-white">{assignment.maxAttempts || 5} attempts</strong>
          </div>
        </div>

        {/* Problem Statement */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <span>Problem Description</span>
          </h3>
          <div className="p-3.5 rounded-xl bg-[#0d0d10] border border-white/10 text-[12.5px] leading-relaxed text-zinc-200 font-sans whitespace-pre-wrap">
            {assignment.description || "No description provided."}
          </div>
        </div>

        {/* Instructions / Constraints */}
        {assignment.instructions && (
          <div className="space-y-1.5">
            <h3 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
              <span>Instructions & Constraints</span>
            </h3>
            <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-[12px] leading-relaxed text-amber-200/90 font-sans whitespace-pre-wrap">
              {assignment.instructions}
            </div>
          </div>
        )}

        {/* Allowed Languages */}
        <div className="space-y-1.5">
          <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
            <Code2 className="w-3.5 h-3.5 text-amber-400" />
            <span>Permitted Languages</span>
          </h3>
          <div className="p-2.5 rounded-xl bg-[#0d0d10] border border-white/10 text-[11.5px] text-zinc-300">
            {isRestricted ? (
              <div className="flex items-center gap-1.5 flex-wrap">
                {assignment.allowedLanguages?.map((lang) => (
                  <span
                    key={lang}
                    className="px-2 py-0.5 rounded bg-amber-500/15 text-amber-300 border border-amber-500/30 text-[10.5px] font-bold uppercase"
                  >
                    {lang === "cpp" ? "C++" : lang.toUpperCase()}
                  </span>
                ))}
              </div>
            ) : (
              <span className="text-amber-300 font-medium">Any Supported Language (Python, Java, C, C++, etc.)</span>
            )}
          </div>
        </div>

        {/* Revealed Test Cases / Examples */}
        <div className="space-y-2 pt-1">
          <div className="flex items-center justify-between">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-wider">
              Sample Test Cases ({revealedCases.length})
            </h3>
            {hiddenCasesCount > 0 && (
              <span className="text-[10px] text-amber-400 font-medium bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                🔒 +{hiddenCasesCount} Hidden Tests
              </span>
            )}
          </div>

          {revealedCases.length === 0 ? (
            <div className="p-3 rounded-xl bg-[#0d0d10] border border-white/10 text-[11.5px] text-zinc-400 italic">
              No sample test cases specified. Use the bottom Test Cases tab to test your inputs.
            </div>
          ) : (
            revealedCases.map((tc, idx) => (
              <div
                key={tc.id || idx}
                className="p-3 rounded-xl bg-[#0d0d10] border border-white/10 space-y-2"
              >
                <div className="flex items-center justify-between text-[11px]">
                  <span className="font-bold text-amber-300">Test Case #{idx + 1}</span>
                  {tc.explanation && (
                    <span className="text-[10px] text-zinc-400 italic">{tc.explanation}</span>
                  )}
                </div>

                <div className="space-y-1.5 text-[11px]">
                  <div>
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] mb-0.5">
                      <span>Input (STDIN)</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(tc.input, idx * 2)}
                        className="hover:text-amber-300 cursor-pointer flex items-center gap-1 text-[10px] transition-colors"
                      >
                        {copiedIdx === idx * 2 ? (
                          <Check className="w-2.5 h-2.5 text-amber-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                        <span>{copiedIdx === idx * 2 ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded-lg bg-black border border-white/10 text-white font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {tc.input || "<empty input>"}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-zinc-400 text-[10px] mb-0.5">
                      <span>Expected Output</span>
                      <button
                        type="button"
                        onClick={() => handleCopy(tc.expectedOutput, idx * 2 + 1)}
                        className="hover:text-amber-300 cursor-pointer flex items-center gap-1 text-[10px] transition-colors"
                      >
                        {copiedIdx === idx * 2 + 1 ? (
                          <Check className="w-2.5 h-2.5 text-amber-400" />
                        ) : (
                          <Copy className="w-2.5 h-2.5" />
                        )}
                        <span>{copiedIdx === idx * 2 + 1 ? "Copied" : "Copy"}</span>
                      </button>
                    </div>
                    <pre className="p-2 rounded-lg bg-black border border-amber-500/20 text-amber-300 font-mono text-[11px] overflow-x-auto whitespace-pre-wrap">
                      {tc.expectedOutput || "<empty output>"}
                    </pre>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
}
