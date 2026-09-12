"use client";

import React, { useState } from "react";
import { AssignmentItem } from "@/lib/api";
import { X, BookOpen, Calendar, Code2, CheckCircle2, ChevronRight, AlertCircle, RefreshCw } from "lucide-react";

interface StudentAssignmentsModalProps {
  assignments: AssignmentItem[];
  activeAssignment: AssignmentItem | null;
  onSelectAssignment: (asg: AssignmentItem | null) => void;
  onClose: () => void;
  onRefresh?: () => void | Promise<void>;
  isRefreshing?: boolean;
}

export default function StudentAssignmentsModal({
  assignments,
  activeAssignment,
  onSelectAssignment,
  onClose,
  onRefresh,
  isRefreshing = false,
}: StudentAssignmentsModalProps) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 max-w-xl w-full space-y-5 relative editor-grid max-h-[85vh] overflow-y-auto">
        <div className="absolute top-4 right-4 flex items-center gap-2">
          {onRefresh && (
            <button
              onClick={onRefresh}
              disabled={isRefreshing}
              title="Refresh Assignments"
              className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? "animate-spin text-amber-400" : ""}`} />
            </button>
          )}
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-zinc-400 hover:text-white hover:bg-white/5 cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-amber-400" />
            <h2 className="text-lg font-display font-bold text-white">Course Assignments</h2>
          </div>
          <p className="text-xs font-mono text-zinc-400">
            Select an assignment to load problem specifications and submit code solution
          </p>
        </div>

        {/* Clear Active Assignment Button */}
        {activeAssignment && (
          <div className="p-3 rounded-xl bg-black/80 border border-amber-500/40 flex items-center justify-between font-mono text-xs text-amber-300 shadow-[0_0_15px_rgba(212,175,55,0.15)]">
            <span>Active: <strong className="text-white">{activeAssignment.title}</strong></span>
            <button
              onClick={() => onSelectAssignment(null)}
              className="px-2.5 py-1 rounded bg-white/10 text-white hover:bg-white/20 font-sans cursor-pointer text-[11px]"
            >
              Exit Assignment Mode
            </button>
          </div>
        )}

        <div className="space-y-3 font-mono text-xs">
          {assignments.length === 0 ? (
            <div className="py-8 text-center space-y-3">
              <p className="text-xs text-zinc-400 italic">No assignments currently published.</p>
              {onRefresh && (
                <button
                  onClick={onRefresh}
                  disabled={isRefreshing}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-300 hover:bg-amber-500/25 text-xs font-mono cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin" : ""}`} />
                  <span>Check for New Assignments</span>
                </button>
              )}
            </div>
          ) : (
            assignments.map((asg) => {
              const isSelected = activeAssignment?.id === asg.id;
              const isRestricted = asg.languageMode === "RESTRICTED";
              const allowedText = isRestricted && asg.allowedLanguages && asg.allowedLanguages.length > 0
                ? asg.allowedLanguages.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ")
                : "Any Supported Language";

              return (
                <div
                  key={asg.id}
                  onClick={() => {
                    onSelectAssignment(asg);
                    onClose();
                  }}
                  className={`p-4 rounded-xl border transition-all cursor-pointer space-y-2 ${
                    isSelected
                      ? "bg-black border-amber-400/60 text-white shadow-[0_0_20px_rgba(212,175,55,0.2)]"
                      : "bg-[#0d0d10] border-white/10 hover:border-amber-400/40 hover:bg-white/[0.04]"
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black/60 text-white border border-white/20">
                        {asg.className}
                      </span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        Allowed: {allowedText}
                      </span>
                    </div>

                    <ChevronRight className="w-4 h-4 text-zinc-500 shrink-0" />
                  </div>

                  <h3 className="font-display font-semibold text-sm text-white">{asg.title}</h3>
                  <p className="text-[11px] text-zinc-400 line-clamp-2 font-sans">{asg.description}</p>

                  <div className="flex items-center justify-between pt-2 border-t border-white/10 text-[10px] text-zinc-400">
                    <div className="flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-amber-400" />
                      <span>Due: {new Date(asg.deadline).toLocaleDateString()}</span>
                    </div>
                    {asg.submitted && (
                      <span className="flex items-center gap-1 text-amber-400 font-bold">
                        <CheckCircle2 className="w-3 h-3 text-amber-400" />
                        <span>Submitted</span>
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
