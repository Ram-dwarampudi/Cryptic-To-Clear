"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripHorizontal,
  Terminal,
  FileText,
  AlertCircle,
  Clock,
  HardDrive,
  CornerDownLeft,
  Sparkles,
  CheckCircle2,
} from "lucide-react";

export type BottomTab = "output" | "errors";

interface BottomPanelProps {
  output: string;
  errors: string;
  status: "idle" | "running" | "success" | "error";
  onResizeStart: (e: React.MouseEvent) => void;
  onSubmitInput?: (newInputLine: string) => void;
  onClearOutput?: () => void;
  onStopExecution?: () => void;
  isRunning?: boolean;
  input?: string;
  onInputChange?: (val: string) => void;
  activeTab?: string;
  onTabChange?: (tab: any) => void;
  executionTime?: string;
  memoryUsage?: string;
  onTriggerAiExplain?: () => void;
}

export default function BottomPanel({
  output,
  errors,
  status,
  onResizeStart,
  onSubmitInput,
  onClearOutput,
  onStopExecution,
  isRunning = false,
  input = "",
  onInputChange,
  activeTab = "output",
  onTabChange,
  executionTime = "—",
  memoryUsage = "—",
  onTriggerAiExplain,
}: BottomPanelProps) {
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [terminalPrompt, setTerminalPrompt] = useState("");

  const hasExecutionResult =
    status !== "idle" || output.length > 0 || errors.length > 0;

  // Keep the latest output visible
  useEffect(() => {
    if (hasExecutionResult) {
      terminalEndRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
      });
    }
  }, [output, errors, status, hasExecutionResult]);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalPrompt.trim()) return;
    const valueToSend = terminalPrompt;
    setTerminalPrompt("");
    if (onSubmitInput) {
      onSubmitInput(valueToSend);
    }
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 50);
  };

  const isExecutionActive =
    status !== "idle" || output.length > 0 || errors.length > 0;

  const currentTab = activeTab === "errors" ? "errors" : "output";

  return (
    <div className="flex h-full flex-col border-t border-[var(--border)] bg-[var(--bg-elevated)] text-[var(--ink)] font-sans select-none">
      {/* Drag handle */}
      <div
        onMouseDown={onResizeStart}
        className="h-2 w-full flex items-center justify-center cursor-row-resize group shrink-0 hover:bg-[var(--border)] transition-colors"
      >
        <GripHorizontal className="h-2 w-8 text-[var(--ink-faint)] group-hover:text-[var(--ink-dim)] transition-colors" />
      </div>

      {/* Header Bar with Tabs */}
      <div className="flex items-center justify-between px-4 py-2 border-b border-[var(--border)] shrink-0 bg-[var(--panel)]">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => onTabChange?.("output")}
            className={`px-3.5 py-1 text-[12.5px] font-semibold rounded-lg transition-all flex items-center gap-2 cursor-pointer ${
              currentTab === "output"
                ? "bg-[var(--bg)] text-[var(--ink)] shadow-sm border border-[var(--border)]"
                : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Console (Output & Input)</span>
            {output && <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />}
          </button>

          <button
            type="button"
            onClick={() => onTabChange?.("errors")}
            className={`flex items-center gap-1.5 px-3.5 py-1 rounded-lg text-[12.5px] font-semibold transition-all cursor-pointer ${
              currentTab === "errors"
                ? "bg-[var(--bg)] text-[var(--ink)] shadow-sm border border-[var(--border)]"
                : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5"
            }`}
          >
            <AlertCircle
              className={`h-3.5 w-3.5 ${
                errors ? "text-rose-400" : "text-gray-400"
              }`}
            />
            <span>Errors & Diagnostics</span>
            {errors && (
              <span className="px-1.5 py-0.2 rounded-full text-[9px] bg-rose-500/20 text-rose-300 font-bold border border-rose-500/30">
                !
              </span>
            )}
          </button>
        </div>

        {/* Status Metrics & Action Controls */}
        <div className="flex items-center gap-3">
          {hasExecutionResult && !isRunning && (
            <div className="hidden sm:flex items-center gap-2.5 text-[11px] font-mono text-[var(--ink-dim)] border-r border-[var(--border)] pr-3">
              <span className="flex items-center gap-1" title="Execution Time">
                <Clock className="h-3 w-3 text-cyan-400" />
                {executionTime}
              </span>
              <span className="flex items-center gap-1" title="Memory Used">
                <HardDrive className="h-3 w-3 text-indigo-400" />
                {memoryUsage}
              </span>
            </div>
          )}

          {isRunning && onStopExecution && (
            <button
              type="button"
              onClick={() => onTabChange?.("errors")}
              className={`px-3 py-1 text-[12px] font-medium rounded-md transition-colors flex items-center gap-1.5 cursor-pointer ${
                currentTab === "errors"
                  ? "bg-[var(--bg)] text-[var(--syn-const)] shadow-sm font-semibold"
                  : "text-[var(--syn-const)]/70 hover:text-[var(--syn-const)]"
              }`}
            >
              <span>Errors</span>
              <span className="h-2 w-2 rounded-full bg-[var(--syn-const)] ml-1" />
            </button>
          )}

          <button
            type="button"
            onClick={onClearOutput}
            className="px-3 py-1 text-[12px] font-medium text-[var(--ink-dim)] hover:text-[var(--ink)] glass border border-[var(--border)] rounded-md transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Console Tab View (LeetCode Style: Combined Output & STDIN Input) */}
      <div
        className={`flex-1 p-3 bg-[var(--bg)] overflow-y-auto flex-col font-mono text-[13px] gap-3 ${
          currentTab === "output" ? "flex" : "hidden"
        }`}
      >
        {/* STDIN Input Block (LeetCode Style Top Box) */}
        <div className="rounded-xl border border-[var(--border)] bg-[var(--panel)] p-3 shrink-0">
          <div className="flex items-center justify-between mb-1.5">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-[var(--ink)]">
              <FileText className="h-3.5 w-3.5 text-cyan-400" />
              <span>Input (STDIN)</span>
            </div>
            <span className="text-[10px] text-[var(--ink-faint)]">
              Standard input for program execution
            </span>
          </div>
          <textarea
            value={input}
            onChange={(e) => onInputChange?.(e.target.value)}
            placeholder="Type standard input (STDIN) here before running your program..."
            rows={2}
            className="w-full bg-[var(--bg)] text-[var(--ink)] placeholder:text-[var(--ink-faint)] border border-[var(--border)] rounded-lg p-2.5 font-mono text-[12px] outline-none focus:border-[var(--syn-function)] transition-colors resize-y min-h-[50px] max-h-[120px]"
          />
        </div>

        {/* Execution Output Section */}
        <div
          onClick={() => {
            if (isExecutionActive) promptInputRef.current?.focus();
          }}
          className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--bg-elevated)] p-3 overflow-y-auto flex flex-col cursor-text selection:bg-blue-500/30 select-text min-h-[120px]"
        >
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-[var(--border)] text-xs font-semibold text-[var(--ink-dim)]">
            <div className="flex items-center gap-1.5">
              <Terminal className="h-3.5 w-3.5 text-emerald-400" />
              <span>Execution Terminal Output</span>
            </div>
            {isRunning && (
              <span className="text-[11px] text-amber-400 font-mono animate-pulse">
                Running...
              </span>
            )}
          </div>

          {errors && (
            <pre className="whitespace-pre-wrap text-[var(--syn-const)] font-mono text-[12.5px] leading-relaxed mb-2">
              {errors}
            </pre>
          )}

          {output ? (
            <div className="font-mono text-[13px] leading-relaxed whitespace-pre-wrap">
              {output.split("\n").map((line, idx) => {
                const trimmed = line.trim();
                if (trimmed.startsWith(">")) {
                  return (
                    <div key={idx} className="text-[var(--syn-function)] font-bold">
                      {line}
                    </div>
                  );
                }

                const promptMatch = line.match(/^(.+?[:?=>$]\s*)(\S+.*)$/);
                const isPromptText =
                  promptMatch &&
                  /^(enter|input|type|please|what|how|select|choose)\b|[:?=>$]$/i.test(
                    promptMatch[1].trim()
                  );
                const isResultHeader =
                  promptMatch &&
                  /^(name|age|cgpa|score|result|output|total|sum|diff|product|count):/i.test(
                    promptMatch[1].trim()
                  );

                if (promptMatch && isPromptText && !isResultHeader) {
                  return (
                    <div key={idx} className="text-[var(--ink)]">
                      <span>{promptMatch[1]}</span>
                      <span className="text-[var(--syn-function)] font-bold">
                        {promptMatch[2]}
                      </span>
                    </div>
                  );
                }

                return (
                  <div key={idx} className="text-[var(--ink)]">
                    {line}
                  </div>
                );
              })}
            </div>
          ) : (
            status === "idle" && (
              <div className="text-[var(--ink-faint)] italic select-none text-xs my-auto text-center py-4">
                Output will appear here after execution...
              </div>
            )
          )}

          {isExecutionActive && (
            <form
              onSubmit={handleSendPrompt}
              className="flex items-center gap-2 mt-auto pt-2 border-t border-[var(--border)] shrink-0 font-mono"
            >
              <span className="text-[var(--syn-string)] font-bold text-[13px] shrink-0">
                $
              </span>
              <input
                ref={promptInputRef}
                type="text"
                value={terminalPrompt}
                onChange={(e) => setTerminalPrompt(e.target.value)}
                disabled={isRunning}
                placeholder={isRunning ? "Executing..." : "Enter input..."}
                className="flex-1 bg-transparent text-[var(--ink)] font-mono text-[13px] placeholder:text-[var(--ink-faint)] border-none outline-none focus:ring-0 p-0 disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={isRunning || !terminalPrompt.trim()}
                className="flex items-center gap-1 px-2.5 py-1 text-[11px] font-mono rounded bg-[var(--syn-string)]/20 hover:bg-[var(--syn-string)]/30 text-[var(--syn-string)] border border-[var(--syn-string)]/30 transition-colors disabled:opacity-40 cursor-pointer shrink-0"
              >
                <span>Enter</span>
                <CornerDownLeft className="h-3 w-3 text-[var(--syn-string)]" />
              </button>
            </form>
          )}

          <div ref={terminalEndRef} />
        </div>
      </div>

      {/* Errors Tab View */}
      <div
        className={`flex-1 p-4 font-mono text-[13px] bg-[var(--bg)] overflow-y-auto select-text flex-col ${
          currentTab === "errors" ? "flex" : "hidden"
        }`}
      >
        {errors ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 rounded-xl bg-rose-500/10 border border-rose-500/20">
              <div className="flex items-center gap-2 text-rose-300 font-bold text-xs">
                <AlertCircle className="h-4 w-4" />
                <span>Compiler / Runtime Diagnostics</span>
              </div>

              {onTriggerAiExplain && (
                <button
                  onClick={onTriggerAiExplain}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                >
                  <Sparkles className="h-3.5 w-3.5" />
                  <span>Ask AI to Explain & Fix</span>
                </button>
              )}
            </div>

            <pre className="whitespace-pre-wrap text-rose-300 bg-[var(--bg-elevated)] p-4 rounded-xl border border-rose-500/20 leading-relaxed overflow-x-auto text-[12.5px]">
              {errors}
            </pre>
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center py-10 text-[var(--ink-faint)] italic select-none">
            <CheckCircle2 className="h-8 w-8 mb-2 text-emerald-400 opacity-40" />
            <p>No compilation or runtime errors reported.</p>
          </div>
        )}
        <div ref={terminalEndRef} />
      </div>
    </div>
  );
}
