"use client";

import { useState, useRef, useEffect } from "react";
import {
  GripHorizontal,
  Terminal,
  SquareCode,
  AlertCircle,
  Clock,
  HardDrive,
  CornerDownLeft,
  Sparkles,
  CheckCircle2,
  Copy,
  Check,
  Plus,
  Trash2,
  Loader2,
} from "lucide-react";

export type BottomTab = "testcase" | "result" | "output" | "errors";

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

  // LeetCode active tab: "testcase" | "result"
  const [internalTab, setInternalTab] = useState<"testcase" | "result">("result");

  // Synchronize internal tab with external activeTab
  useEffect(() => {
    if (activeTab === "testcase") {
      setInternalTab("testcase");
    } else if (activeTab === "output" || activeTab === "errors" || activeTab === "result") {
      setInternalTab("result");
    }
  }, [activeTab]);

  // When execution starts or produces output, automatically switch to Test Result
  useEffect(() => {
    if (isRunning || (status !== "idle" && (output || errors))) {
      setInternalTab("result");
      onTabChange?.("output");
    }
  }, [isRunning, status, output, errors]);

  // Multiple Testcases support (LeetCode style Case 1, Case 2, etc.)
  const [cases, setCases] = useState<string[]>(() => [input || ""]);
  const [activeCaseIdx, setActiveCaseIdx] = useState(0);

  // Sync external input changes into current active case
  useEffect(() => {
    if (input !== cases[activeCaseIdx]) {
      setCases((prev) => {
        const next = [...prev];
        next[activeCaseIdx] = input;
        return next;
      });
    }
  }, [input]);

  const handleSelectCase = (idx: number) => {
    setActiveCaseIdx(idx);
    const caseVal = cases[idx] || "";
    onInputChange?.(caseVal);
  };

  const handleAddCase = () => {
    const nextCases = [...cases, ""];
    setCases(nextCases);
    setActiveCaseIdx(nextCases.length - 1);
    onInputChange?.("");
  };

  const handleDeleteCase = (idxToDelete: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (cases.length <= 1) return;
    const nextCases = cases.filter((_, i) => i !== idxToDelete);
    const nextIdx = Math.min(activeCaseIdx, nextCases.length - 1);
    setCases(nextCases);
    setActiveCaseIdx(nextIdx);
    onInputChange?.(nextCases[nextIdx]);
  };

  const handleCaseInputChange = (val: string) => {
    const nextCases = [...cases];
    nextCases[activeCaseIdx] = val;
    setCases(nextCases);
    onInputChange?.(val);
  };

  // Copy buttons state
  const [copiedInput, setCopiedInput] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  const handleCopyInput = () => {
    const textToCopy = cases[activeCaseIdx] || "";
    navigator.clipboard.writeText(textToCopy);
    setCopiedInput(true);
    setTimeout(() => setCopiedInput(false), 1500);
  };

  const handleCopyOutput = () => {
    navigator.clipboard.writeText(output || "");
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 1500);
  };

  // Keep latest output visible
  useEffect(() => {
    if (output || errors) {
      terminalEndRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" });
    }
  }, [output, errors]);

  const handleSendPrompt = (e: React.FormEvent) => {
    e.preventDefault();
    if (!terminalPrompt.trim()) return;
    const val = terminalPrompt;
    setTerminalPrompt("");
    if (onSubmitInput) {
      onSubmitInput(val);
    }
    setTimeout(() => {
      promptInputRef.current?.focus();
    }, 50);
  };

  const isExecutionActive = status !== "idle" || output.length > 0 || errors.length > 0;
  const hasErrors = Boolean(errors && errors.trim().length > 0);

  return (
    <div className="flex h-full flex-col border-t border-[var(--border)] bg-[#101626] text-[var(--ink)] font-sans select-none overflow-hidden">
      {/* Resizing Drag Handle */}
      <div
        onMouseDown={onResizeStart}
        className="h-2 w-full flex items-center justify-center cursor-row-resize group shrink-0 hover:bg-[var(--border)] transition-colors"
      >
        <GripHorizontal className="h-2 w-8 text-[var(--ink-faint)] group-hover:text-[var(--ink-dim)] transition-colors" />
      </div>

      {/* LeetCode Style Top Console Navigation Bar */}
      <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] shrink-0 bg-[#0b101c]">
        {/* Left: Testcase & Test Result Tabs */}
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            onClick={() => {
              setInternalTab("testcase");
              onTabChange?.("testcase");
            }}
            className={`px-3 py-1 text-[12.5px] font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              internalTab === "testcase"
                ? "bg-[#192237] text-[var(--ink)] shadow-sm border border-[var(--border)]"
                : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5"
            }`}
          >
            <SquareCode className="h-3.5 w-3.5 text-emerald-400" />
            <span>Testcase</span>
          </button>

          <button
            type="button"
            onClick={() => {
              setInternalTab("result");
              onTabChange?.("output");
            }}
            className={`px-3 py-1 text-[12.5px] font-semibold rounded-md transition-all flex items-center gap-2 cursor-pointer ${
              internalTab === "result"
                ? "bg-[#192237] text-[var(--ink)] shadow-sm border border-[var(--border)]"
                : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5"
            }`}
          >
            <Terminal className="h-3.5 w-3.5 text-sky-400" />
            <span>Test Result</span>
            {status !== "idle" && (
              <span
                className={`h-1.5 w-1.5 rounded-full ${
                  isRunning
                    ? "bg-amber-400 animate-ping"
                    : hasErrors
                    ? "bg-rose-400"
                    : "bg-emerald-400"
                }`}
              />
            )}
          </button>
        </div>

        {/* Right: Status Pills & Action Buttons */}
        <div className="flex items-center gap-2.5">
          {/* Status Indicator */}
          {isRunning && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[11.5px] font-mono">
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              <span>Running...</span>
            </div>
          )}

          {!isRunning && isExecutionActive && (
            <div className="hidden sm:flex items-center gap-2">
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-300">
                <Clock className="h-3 w-3 text-emerald-400" />
                <span>{executionTime !== "—" ? executionTime : "0.05s"}</span>
              </div>
              <div className="flex items-center gap-1 px-2 py-0.5 rounded bg-zinc-800/80 border border-zinc-700/60 text-[11px] font-mono text-zinc-300">
                <HardDrive className="h-3 w-3 text-sky-400" />
                <span>{memoryUsage !== "—" ? memoryUsage : "8 MB"}</span>
              </div>
            </div>
          )}

          {/* Clear Output button */}
          <button
            type="button"
            onClick={onClearOutput}
            className="px-2.5 py-0.5 text-[11.5px] font-medium text-[var(--ink-dim)] hover:text-[var(--ink)] bg-white/5 hover:bg-white/10 border border-[var(--border)] rounded transition-colors cursor-pointer"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Main Console Content Body */}
      <div className="flex-1 p-3 bg-[#080d17] overflow-y-auto flex flex-col font-mono text-[13px]">
        {/* ========================================================= */}
        {/* TAB 1: LEETCODE TESTCASE (INPUT) VIEW                     */}
        {/* ========================================================= */}
        {internalTab === "testcase" && (
          <div className="flex flex-col h-full gap-3">
            {/* Case Selector Tabs (Case 1, Case 2, +) */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 shrink-0">
              {cases.map((_, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSelectCase(idx)}
                  className={`group flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeCaseIdx === idx
                      ? "bg-[#1c273e] text-white border border-zinc-700 shadow-sm"
                      : "bg-[#0e1422] text-zinc-400 hover:text-zinc-200 hover:bg-[#141c2e] border border-transparent"
                  }`}
                >
                  <span>Case {idx + 1}</span>
                  {cases.length > 1 && (
                    <span
                      onClick={(e) => handleDeleteCase(idx, e)}
                      className="opacity-0 group-hover:opacity-100 hover:text-rose-400 p-0.5 rounded transition-opacity"
                      title="Remove testcase"
                    >
                      <Trash2 className="h-3 w-3" />
                    </span>
                  )}
                </button>
              ))}

              <button
                type="button"
                onClick={handleAddCase}
                className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold text-zinc-400 hover:text-white bg-[#0e1422] hover:bg-[#141c2e] border border-dashed border-zinc-700/80 transition-all cursor-pointer"
                title="Add Testcase"
              >
                <Plus className="h-3.5 w-3.5" />
              </button>
            </div>

            {/* Testcase Input Card */}
            <div className="flex-1 flex flex-col rounded-xl border border-[var(--border)] bg-[#0e1422] p-3 overflow-hidden">
              <div className="flex items-center justify-between pb-2 mb-2 border-b border-zinc-800/80 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-[#182136] text-zinc-300 font-mono text-[11px] font-bold border border-zinc-700/50">
                    stdin =
                  </span>
                  <span className="text-zinc-400 text-[11px]">Standard Input Stream</span>
                </div>
                <button
                  type="button"
                  onClick={handleCopyInput}
                  className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer transition-colors"
                >
                  {copiedInput ? (
                    <>
                      <Check className="h-3.5 w-3.5 text-emerald-400" />
                      <span className="text-emerald-400">Copied</span>
                    </>
                  ) : (
                    <>
                      <Copy className="h-3.5 w-3.5" />
                      <span>Copy</span>
                    </>
                  )}
                </button>
              </div>

              <textarea
                value={cases[activeCaseIdx] || ""}
                onChange={(e) => handleCaseInputChange(e.target.value)}
                placeholder="Enter input values here (e.g. 5 or each value on a new line)..."
                className="flex-1 w-full bg-[#070b14] text-zinc-100 placeholder:text-zinc-600 border border-zinc-800/80 rounded-lg p-3 font-mono text-[13px] outline-none focus:border-zinc-600 transition-colors resize-none leading-relaxed"
              />

              <div className="pt-2 text-[11px] text-zinc-500 flex items-center justify-between">
                <span>Input is passed directly to Scanner, input(), cin, etc.</span>
                <span className="text-[10px] text-zinc-600">Case {activeCaseIdx + 1} of {cases.length}</span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================= */}
        {/* TAB 2: LEETCODE TEST RESULT (OUTPUT) VIEW                 */}
        {/* ========================================================= */}
        {internalTab === "result" && (
          <div className="flex flex-col h-full gap-3 overflow-y-auto">
            {/* Empty State: Not run yet */}
            {!isExecutionActive && !isRunning && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center select-none">
                <div className="h-10 w-10 rounded-full bg-zinc-850 border border-zinc-800 flex items-center justify-center mb-3">
                  <Terminal className="h-5 w-5 text-zinc-400" />
                </div>
                <p className="text-sm font-semibold text-zinc-300">You must run your code first</p>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm">
                  Click the &quot;Run&quot; button in the top toolbar to compile and execute your program against the testcase.
                </p>
              </div>
            )}

            {/* Loading State: Running */}
            {isRunning && (
              <div className="flex-1 flex flex-col items-center justify-center py-12 text-center select-none">
                <Loader2 className="h-8 w-8 animate-spin text-amber-400 mb-3" />
                <p className="text-sm font-semibold text-zinc-300">Executing code against testcase...</p>
                <p className="text-xs text-zinc-500 mt-1">Please wait while the compiler runs.</p>
              </div>
            )}

            {/* Completed Execution Result */}
            {!isRunning && isExecutionActive && (
              <div className="flex flex-col gap-3">
                {/* LeetCode Status Banner Header */}
                <div className="flex flex-wrap items-center justify-between gap-2 pb-2 border-b border-zinc-800/80">
                  <div className="flex items-center gap-3">
                    {hasErrors ? (
                      <div className="flex items-center gap-2 text-rose-400">
                        <AlertCircle className="h-5 w-5" />
                        <span className="text-base font-bold tracking-tight">
                          {errors.toLowerCase().includes("compilation")
                            ? "Compile Error"
                            : "Runtime Error"}
                        </span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-emerald-400">
                        <CheckCircle2 className="h-5 w-5" />
                        <span className="text-base font-bold tracking-tight">Accepted</span>
                      </div>
                    )}

                    <div className="flex items-center gap-2 text-[12px] font-mono text-zinc-400">
                      <span className="bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded text-zinc-300">
                        Runtime: {executionTime !== "—" ? executionTime : "0.05s"}
                      </span>
                      <span className="bg-zinc-800/80 border border-zinc-700/50 px-2 py-0.5 rounded text-zinc-300">
                        Memory: {memoryUsage !== "—" ? memoryUsage : "8 MB"}
                      </span>
                    </div>
                  </div>

                  {/* AI Explain Button for Errors */}
                  {hasErrors && onTriggerAiExplain && (
                    <button
                      type="button"
                      onClick={onTriggerAiExplain}
                      className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs shadow-md transition-all cursor-pointer"
                    >
                      <Sparkles className="h-3.5 w-3.5" />
                      <span>Ask AI to Explain & Fix</span>
                    </button>
                  )}
                </div>

                {/* Case Selector Tabs for Result */}
                <div className="flex items-center gap-1.5">
                  {cases.map((_, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSelectCase(idx)}
                      className={`px-3 py-0.5 rounded text-xs font-semibold transition-all cursor-pointer ${
                        activeCaseIdx === idx
                          ? "bg-[#1c273e] text-white border border-zinc-700"
                          : "bg-[#0e1422] text-zinc-400 hover:text-zinc-200"
                      }`}
                    >
                      Case {idx + 1}
                    </button>
                  ))}
                </div>

                {/* Input Section (LeetCode Style) */}
                <div className="rounded-xl border border-[var(--border)] bg-[#0e1422] p-3">
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 text-xs font-semibold text-zinc-400">
                    <span className="tracking-wider uppercase text-[11px]">Input</span>
                    <button
                      type="button"
                      onClick={handleCopyInput}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {copiedInput ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Copy
                        </span>
                      )}
                    </button>
                  </div>
                  <div className="bg-[#070b14] text-zinc-200 border border-zinc-800/80 rounded-lg p-2.5 font-mono text-[12.5px] whitespace-pre-wrap">
                    {cases[activeCaseIdx] && cases[activeCaseIdx].trim().length > 0 ? (
                      cases[activeCaseIdx]
                    ) : (
                      <span className="text-zinc-600 italic">No input provided</span>
                    )}
                  </div>
                </div>

                {/* Output (Stdout) Section (LeetCode Style) */}
                <div
                  onClick={() => {
                    if (isExecutionActive) promptInputRef.current?.focus();
                  }}
                  className="rounded-xl border border-[var(--border)] bg-[#0e1422] p-3 cursor-text"
                >
                  <div className="flex items-center justify-between pb-1.5 mb-1.5 text-xs font-semibold text-zinc-400">
                    <span className="tracking-wider uppercase text-[11px]">Output</span>
                    <button
                      type="button"
                      onClick={handleCopyOutput}
                      className="flex items-center gap-1 text-[11px] text-zinc-400 hover:text-zinc-200 cursor-pointer"
                    >
                      {copiedOutput ? (
                        <span className="text-emerald-400 flex items-center gap-1">
                          <Check className="h-3 w-3" /> Copied
                        </span>
                      ) : (
                        <span className="flex items-center gap-1">
                          <Copy className="h-3 w-3" /> Copy
                        </span>
                      )}
                    </button>
                  </div>

                  <div className="bg-[#070b14] text-zinc-100 border border-zinc-800/80 rounded-lg p-3 font-mono text-[13px] leading-relaxed whitespace-pre-wrap select-text min-h-[60px]">
                    {output && output.trim().length > 0 ? (
                      output.split("\n").map((line, idx) => {
                        const trimmed = line.trim();
                        if (trimmed.startsWith(">")) {
                          return (
                            <div key={idx} className="text-sky-400 font-bold">
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
                            <div key={idx} className="text-zinc-200">
                              <span>{promptMatch[1]}</span>
                              <span className="text-sky-400 font-bold">{promptMatch[2]}</span>
                            </div>
                          );
                        }

                        return (
                          <div key={idx} className="text-zinc-200">
                            {line}
                          </div>
                        );
                      })
                    ) : (
                      <span className="text-zinc-600 italic">No standard output printed</span>
                    )}

                    {/* Interactive Input Form if active */}
                    {isExecutionActive && (
                      <form
                        onSubmit={handleSendPrompt}
                        className="flex items-center gap-2 mt-3 pt-2 border-t border-zinc-800"
                      >
                        <span className="text-emerald-400 font-bold text-[13px]">$</span>
                        <input
                          ref={promptInputRef}
                          type="text"
                          value={terminalPrompt}
                          onChange={(e) => setTerminalPrompt(e.target.value)}
                          disabled={isRunning}
                          placeholder={isRunning ? "Executing..." : "Enter stdin value..."}
                          className="flex-1 bg-transparent text-zinc-100 font-mono text-[13px] placeholder:text-zinc-600 border-none outline-none focus:ring-0 p-0"
                        />
                        <button
                          type="submit"
                          disabled={isRunning || !terminalPrompt.trim()}
                          className="flex items-center gap-1 px-2.5 py-0.5 text-[11px] font-mono rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-40 cursor-pointer"
                        >
                          <span>Send</span>
                          <CornerDownLeft className="h-3 w-3" />
                        </button>
                      </form>
                    )}
                  </div>
                </div>

                {/* Error Section (if errors exist) */}
                {hasErrors && (
                  <div className="rounded-xl border border-rose-500/30 bg-rose-950/20 p-3">
                    <div className="flex items-center justify-between pb-1.5 mb-1.5 text-xs font-semibold text-rose-400">
                      <span className="tracking-wider uppercase text-[11px] flex items-center gap-1.5">
                        <AlertCircle className="h-3.5 w-3.5" />
                        Diagnostics & Errors
                      </span>
                    </div>
                    <pre className="bg-[#070b14] text-rose-300 border border-rose-500/20 rounded-lg p-3 font-mono text-[12.5px] leading-relaxed whitespace-pre-wrap select-text overflow-x-auto">
                      {errors}
                    </pre>
                  </div>
                )}

                <div ref={terminalEndRef} />
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
