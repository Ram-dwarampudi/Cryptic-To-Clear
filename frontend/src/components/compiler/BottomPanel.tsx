"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import {
  GripHorizontal,
  Terminal,
  AlertCircle,
  Clock,
  HardDrive,
  CornerDownLeft,
  Sparkles,
  CheckCircle2,
  XCircle,
  Trash2,
  Loader2,
  SlidersHorizontal,
  Copy,
  Check,
  Play,
  FileCheck,
  Lock,
} from "lucide-react";

export type BottomTab = "terminal" | "stdin" | "output" | "errors" | "testcase" | "result";

export interface TerminalLine {
  type: "output" | "input" | "error";
  content: string;
}

export interface TestCaseItem {
  id?: string;
  input: string;
  expectedOutput: string;
  isHidden?: boolean;
  explanation?: string;
  status?: "idle" | "running" | "pass" | "fail" | "error";
  actualOutput?: string;
  error?: string;
  executionTime?: string;
}

interface BottomPanelProps {
  output: string;
  errors: string;
  terminalLines?: TerminalLine[];
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
  // Assignment Mode & Test Cases
  isAssignmentMode?: boolean;
  testCases?: TestCaseItem[];
  onRunTestCases?: () => void;
  isRunningTestCases?: boolean;
  isWaitingForInput?: boolean;
}

export default function BottomPanel({
  output,
  errors,
  terminalLines = [],
  status,
  onResizeStart,
  onSubmitInput,
  onClearOutput,
  onStopExecution,
  isRunning = false,
  input = "",
  onInputChange,
  activeTab: controlledActiveTab,
  onTabChange,
  executionTime = "—",
  memoryUsage = "—",
  onTriggerAiExplain,
  isAssignmentMode = false,
  testCases = [],
  onRunTestCases,
  isRunningTestCases = false,
  isWaitingForInput = false,
}: BottomPanelProps) {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [terminalPrompt, setTerminalPrompt] = useState("");

  // Internal tab state if not controlled externally
  const [internalTab, setInternalTab] = useState<"testcase" | "result" | "terminal">(
    isAssignmentMode ? "testcase" : "terminal"
  );
  const currentTab = isAssignmentMode ? internalTab : (controlledActiveTab || "terminal");

  const setTab = (tab: "testcase" | "result" | "terminal") => {
    setInternalTab(tab);
    onTabChange?.(tab);
  };

  // Selected testcase tab index
  const [selectedCaseIdx, setSelectedCaseIdx] = useState(0);
  const [selectedResultIdx, setSelectedResultIdx] = useState(0);

  // Input history for Up/Down arrow navigation like bash
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Optional Stdin drawer toggle
  const [showStdinDrawer, setShowStdinDrawer] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Focus terminal input
  const focusTerminalInput = useCallback(() => {
    promptInputRef.current?.focus();
  }, []);

  // Auto-focus on mount and when execution status updates or waiting for input
  useEffect(() => {
    if (currentTab === "terminal") {
      promptInputRef.current?.focus();
    }
  }, [status, terminalLines, isRunning, currentTab, isWaitingForInput]);

  // Auto-scroll to bottom whenever output updates in terminal
  useEffect(() => {
    if (currentTab === "terminal" && terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLines, errors, isRunning, currentTab]);

  // Handle Enter key submission in terminal
  const handleSendPrompt = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!terminalPrompt.trim()) return;

    const val = terminalPrompt;
    setTerminalPrompt("");
    setHistory((prev) => [...prev, val]);
    setHistoryIndex(-1);

    if (onSubmitInput) {
      onSubmitInput(val);
    }

    setTimeout(() => {
      promptInputRef.current?.focus();
      if (terminalContainerRef.current) {
        terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
      }
    }, 50);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendPrompt();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      if (history[nextIndex] !== undefined) {
        setHistoryIndex(nextIndex);
        setTerminalPrompt(history[nextIndex]);
      }
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      const nextIndex = historyIndex + 1;
      if (nextIndex >= history.length) {
        setHistoryIndex(-1);
        setTerminalPrompt("");
      } else {
        setHistoryIndex(nextIndex);
        setTerminalPrompt(history[nextIndex]);
      }
    }
  };

  const handleCopyTerminal = () => {
    navigator.clipboard.writeText(output || "");
    setCopiedOutput(true);
    setTimeout(() => setCopiedOutput(false), 1500);
  };

  const isExecutionActive = status !== "idle" || terminalLines.length > 0 || errors.length > 0;
  const hasErrors = Boolean(errors && errors.trim().length > 0);

  const revealedCases = testCases.filter((tc) => !tc.isHidden);
  const hiddenCases = testCases.filter((tc) => tc.isHidden);

  const testCasesRan = testCases.some((tc) => tc.status && tc.status !== "idle");
  const passedRevealed = revealedCases.filter((tc) => tc.status === "pass").length;
  const allRevealedPassed = revealedCases.length > 0 && passedRevealed === revealedCases.length;

  return (
    <div className="flex h-full flex-col border-t border-[var(--border)] bg-[#050507] text-[var(--ink)] font-mono select-none overflow-hidden">
      {/* Resizing Drag Handle */}
      <div
        onMouseDown={onResizeStart}
        className="h-2 w-full flex items-center justify-center cursor-row-resize group shrink-0 hover:bg-[var(--border)] transition-colors"
      >
        <GripHorizontal className="h-2 w-8 text-[var(--ink-faint)] group-hover:text-amber-400 transition-colors" />
      </div>

      {/* Top Header & Tabs */}
      <div className="flex items-center justify-between px-3.5 py-1.5 border-b border-white/10 shrink-0 bg-[#0d0d10] select-none">
        {/* Left: Window Dots & Navigation Tabs */}
        <div className="flex items-center gap-2">
          {/* macOS window dots */}
          <div className="hidden sm:flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-white/20" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400/40" />
            <span className="w-2.5 h-2.5 rounded-full bg-amber-400" />
          </div>

          <div className="hidden sm:block h-3.5 w-px bg-white/10 mr-1" />

          {/* If in Assignment Mode: Show Tabs for Test Cases, Test Results, and Terminal */}
          {isAssignmentMode ? (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setTab("testcase")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === "testcase"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <SlidersHorizontal className="h-3.5 w-3.5 text-amber-400" />
                <span>Test Cases</span>
                <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-amber-500/20 text-amber-300">
                  {revealedCases.length}
                </span>
              </button>

              <button
                type="button"
                onClick={() => setTab("result")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === "result"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <FileCheck className="h-3.5 w-3.5 text-amber-400" />
                <span>Test Results</span>
                {testCasesRan && (
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                      allRevealedPassed
                        ? "bg-amber-500/20 text-amber-300"
                        : "bg-white/10 text-zinc-300"
                    }`}
                  >
                    {passedRevealed}/{revealedCases.length}
                  </span>
                )}
              </button>

              <button
                type="button"
                onClick={() => setTab("terminal")}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  currentTab === "terminal"
                    ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <Terminal className="h-3.5 w-3.5 text-amber-400" />
                <span>Terminal</span>
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1.5 text-xs font-semibold text-white">
              <Terminal className="h-3.5 w-3.5 text-amber-400" />
              <span>Interactive Terminal</span>
            </div>
          )}

          {/* Status Badge */}
          {isRunning || isRunningTestCases ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10.5px]">
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              <span>Running...</span>
            </div>
          ) : null}
        </div>

        {/* Right: Actions & Performance Stats */}
        <div className="flex items-center gap-2">
          {/* Run Test Cases Button when in Assignment Mode */}
          {isAssignmentMode && onRunTestCases && (
            <button
              type="button"
              onClick={onRunTestCases}
              disabled={isRunning || isRunningTestCases}
              className="flex items-center gap-1.5 px-3 py-1 rounded-lg bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:brightness-110 text-black font-bold text-xs shadow-[0_0_15px_rgba(212,175,55,0.35)] transition-all disabled:opacity-50 cursor-pointer"
            >
              {isRunningTestCases ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
              ) : (
                <Play className="h-3.5 w-3.5 fill-black text-black" />
              )}
              <span>Run Tests</span>
            </button>
          )}

          {isWaitingForInput && (
            <div className="flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 font-bold text-[11px] border border-amber-500/40 animate-pulse mr-1">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
              <span>Waiting for input</span>
            </div>
          )}

          {isExecutionActive && !isRunning && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="flex items-center gap-1 text-[11px] text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                <Clock className="h-3 w-3 text-amber-400" />
                <span>{executionTime !== "—" ? executionTime : "0.05s"}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-300 bg-black/60 px-2 py-0.5 rounded border border-white/10">
                <HardDrive className="h-3 w-3 text-amber-400" />
                <span>{memoryUsage !== "—" ? memoryUsage : "8 MB"}</span>
              </div>
            </div>
          )}

          {/* Ask AI Button: ONLY in regular mode, NEVER in Assignment Mode */}
          {!isAssignmentMode && hasErrors && onTriggerAiExplain && (
            <button
              type="button"
              onClick={onTriggerAiExplain}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-black/60 border border-amber-500/40 hover:bg-amber-500/20 text-amber-300 font-bold text-[11.5px] shadow-[0_0_12px_rgba(212,175,55,0.2)] transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3 text-amber-400" />
              <span>Ask AI</span>
            </button>
          )}

          {/* Copy Terminal Output */}
          {output && (
            <button
              type="button"
              onClick={handleCopyTerminal}
              title="Copy terminal output"
              className="p-1 rounded text-zinc-400 hover:text-white hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copiedOutput ? (
                <Check className="h-3.5 w-3.5 text-amber-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Preset STDIN Drawer Button (in terminal tab) */}
          {currentTab === "terminal" && (
            <button
              type="button"
              onClick={() => setShowStdinDrawer((v) => !v)}
              title="Configure pre-set standard input (STDIN)"
              className={`flex items-center gap-1 px-2 py-1 rounded text-[11.5px] transition-colors cursor-pointer border ${
                showStdinDrawer || (input && input.trim().length > 0)
                  ? "bg-amber-500/15 text-amber-300 border-amber-500/30"
                  : "bg-white/5 text-zinc-400 hover:text-white border-white/10 hover:bg-white/10"
              }`}
            >
              <SlidersHorizontal className="h-3 w-3 text-amber-400" />
              <span className="hidden sm:inline">STDIN</span>
              {input && input.trim().length > 0 && (
                <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
              )}
            </button>
          )}

          {/* Clear Button */}
          <button
            type="button"
            onClick={onClearOutput}
            title="Clear terminal"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11.5px] text-zinc-400 hover:text-white bg-white/5 hover:bg-white/10 border border-white/10 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* ─── TAB 1: TEST CASES VIEW ─── */}
      {isAssignmentMode && currentTab === "testcase" && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#050507] overflow-hidden">
          {/* Test Case Subtabs */}
          <div className="flex items-center gap-1.5 px-3 py-2 border-b border-white/10 bg-[#0d0d10] overflow-x-auto shrink-0">
            {revealedCases.map((tc, idx) => (
              <button
                key={tc.id || idx}
                type="button"
                onClick={() => setSelectedCaseIdx(idx)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                  selectedCaseIdx === idx
                    ? "bg-black text-amber-300 border border-amber-400/50 shadow-sm"
                    : "text-zinc-400 hover:text-white hover:bg-white/5"
                }`}
              >
                <span>Case {idx + 1}</span>
                {tc.status === "pass" && <CheckCircle2 className="w-3 h-3 text-amber-400" />}
                {tc.status === "fail" && <XCircle className="w-3 h-3 text-rose-400" />}
              </button>
            ))}

            {hiddenCases.length > 0 && (
              <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 text-xs font-mono">
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{hiddenCases.length} Hidden {hiddenCases.length === 1 ? "Test" : "Tests"}</span>
              </div>
            )}
          </div>

          {/* Active Test Case Content */}
          {revealedCases.length > 0 && revealedCases[selectedCaseIdx] ? (
            <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs select-text custom-scrollbar">
              {revealedCases[selectedCaseIdx].explanation && (
                <div className="text-zinc-400 text-[11.5px] italic">
                  Note: {revealedCases[selectedCaseIdx].explanation}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-bold text-white">Input (STDIN)</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(revealedCases[selectedCaseIdx].input)}
                      className="hover:text-amber-300 cursor-pointer text-[10px] text-zinc-500 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-black border border-white/10 text-white font-mono text-[12px] min-h-[70px] whitespace-pre-wrap overflow-x-auto">
                    {revealedCases[selectedCaseIdx].input || "<empty input>"}
                  </pre>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-zinc-400 text-[11px]">
                    <span className="font-bold text-amber-300">Expected Output</span>
                    <button
                      type="button"
                      onClick={() => navigator.clipboard.writeText(revealedCases[selectedCaseIdx].expectedOutput)}
                      className="hover:text-amber-300 cursor-pointer text-[10px] text-zinc-500 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                  <pre className="p-3 rounded-xl bg-black border border-amber-500/30 text-amber-300 font-mono text-[12px] min-h-[70px] whitespace-pre-wrap overflow-x-auto">
                    {revealedCases[selectedCaseIdx].expectedOutput || "<empty output>"}
                  </pre>
                </div>
              </div>

              {hiddenCases.length > 0 && (
                <div className="p-2.5 rounded-xl bg-black/60 border border-amber-500/20 text-zinc-300 text-[11px] flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 shrink-0 text-amber-400" />
                  <span>
                    The assignment also contains <strong>{hiddenCases.length} hidden test cases</strong> to evaluate edge cases. Hidden test results are evaluated automatically upon submission.
                  </span>
                </div>
              )}
            </div>
          ) : (
            <div className="p-8 text-center text-zinc-500 text-xs italic">
              No sample test cases provided for this assignment.
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 2: TEST RESULTS VIEW ─── */}
      {isAssignmentMode && currentTab === "result" && (
        <div className="flex-1 flex flex-col min-h-0 bg-[#050507] overflow-hidden">
          {!testCasesRan ? (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center gap-3">
              <FileCheck className="w-10 h-10 text-amber-400/60" />
              <div className="space-y-1">
                <h4 className="text-white font-semibold text-sm">No Test Results Yet</h4>
                <p className="text-zinc-400 text-xs max-w-sm">
                  Click &quot;Run Tests&quot; above to execute your solution against the assignment test cases and verify output correctness.
                </p>
              </div>
              {onRunTestCases && (
                <button
                  type="button"
                  onClick={onRunTestCases}
                  disabled={isRunning || isRunningTestCases}
                  className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:brightness-110 text-black font-bold text-xs shadow-[0_0_15px_rgba(212,175,55,0.35)] cursor-pointer"
                >
                  <Play className="w-3.5 h-3.5 fill-black text-black" />
                  <span>Run Test Cases</span>
                </button>
              )}
            </div>
          ) : (
            <div className="flex-1 flex flex-col min-h-0">
              {/* Results Summary Header */}
              <div className="px-4 py-2.5 border-b border-white/10 bg-[#0d0d10] flex items-center justify-between shrink-0">
                <div className="flex items-center gap-3">
                  <div
                    className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${
                      allRevealedPassed
                        ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                        : "bg-white/10 text-zinc-300 border border-white/15"
                    }`}
                  >
                    {allRevealedPassed ? (
                      <CheckCircle2 className="w-3.5 h-3.5 text-amber-400" />
                    ) : (
                      <XCircle className="w-3.5 h-3.5 text-zinc-400" />
                    )}
                    <span>{allRevealedPassed ? "Accepted" : "Wrong Answer"}</span>
                  </div>

                  <span className="text-xs font-mono text-white">
                    <strong className="text-amber-300">{passedRevealed}</strong> of <strong>{revealedCases.length}</strong> revealed test cases passed
                  </span>
                </div>

                {hiddenCases.length > 0 && (
                  <span className="text-[11px] text-amber-300 bg-black/60 px-2 py-0.5 rounded border border-amber-500/20">
                    +{hiddenCases.length} Hidden Cases will be evaluated on submit
                  </span>
                )}
              </div>

              {/* Case Tabs for Results */}
              <div className="flex items-center gap-1.5 px-3 py-1.5 border-b border-white/10 bg-[#0d0d10] overflow-x-auto shrink-0">
                {revealedCases.map((tc, idx) => (
                  <button
                    key={tc.id || idx}
                    type="button"
                    onClick={() => setSelectedResultIdx(idx)}
                    className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-xs font-mono font-medium transition-all cursor-pointer ${
                      selectedResultIdx === idx
                        ? "bg-black text-amber-300 border border-amber-400/50"
                        : "text-zinc-400 hover:text-white"
                    }`}
                  >
                    <span>Case {idx + 1}</span>
                    {tc.status === "pass" ? (
                      <CheckCircle2 className="w-3 h-3 text-amber-400" />
                    ) : (
                      <XCircle className="w-3 h-3 text-zinc-400" />
                    )}
                  </button>
                ))}
              </div>

              {/* Selected Result Detail */}
              {revealedCases[selectedResultIdx] && (
                <div className="flex-1 p-4 overflow-y-auto space-y-3 font-mono text-xs select-text custom-scrollbar">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[11px] font-bold">Input (STDIN)</span>
                      <pre className="p-2.5 rounded-xl bg-black border border-white/10 text-white font-mono text-[11.5px] min-h-[60px] whitespace-pre-wrap overflow-x-auto">
                        {revealedCases[selectedResultIdx].input || "<empty input>"}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <span className="text-zinc-400 text-[11px] font-bold">Expected Output</span>
                      <pre className="p-2.5 rounded-xl bg-black border border-amber-500/20 text-amber-300 font-mono text-[11.5px] min-h-[60px] whitespace-pre-wrap overflow-x-auto">
                        {revealedCases[selectedResultIdx].expectedOutput || "<empty output>"}
                      </pre>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-[11px]">
                        <span className="text-zinc-400 font-bold">Your Actual Output</span>
                        <span
                          className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                            revealedCases[selectedResultIdx].status === "pass"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-white/10 text-zinc-300"
                          }`}
                        >
                          {revealedCases[selectedResultIdx].status === "pass" ? "MATCH" : "MISMATCH"}
                        </span>
                      </div>
                      <pre
                        className={`p-2.5 rounded-xl font-mono text-[11.5px] min-h-[60px] whitespace-pre-wrap overflow-x-auto border ${
                          revealedCases[selectedResultIdx].status === "pass"
                            ? "bg-black border-amber-500/40 text-amber-200"
                            : "bg-black border-white/20 text-zinc-300"
                        }`}
                      >
                        {revealedCases[selectedResultIdx].actualOutput || "<no output>"}
                      </pre>
                    </div>
                  </div>

                  {revealedCases[selectedResultIdx].error && (
                    <div className="p-2.5 rounded-xl bg-black/80 border border-white/20 text-zinc-200 text-[11.5px]">
                      <strong className="text-amber-400">Error details:</strong> {revealedCases[selectedResultIdx].error}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ─── TAB 3: TERMINAL VIEW (Default for regular compiler) ─── */}
      {(!isAssignmentMode || currentTab === "terminal") && (
        <>
          {/* Optional Top Drawer: Pre-configured Standard Input (STDIN) */}
          {showStdinDrawer && (
            <div className="bg-[#0d0d10] border-b border-white/10 p-2.5 shrink-0 flex flex-col gap-1.5">
              <div className="flex items-center justify-between text-xs text-zinc-400">
                <span className="font-semibold text-white text-[11.5px]">
                  Pre-set Standard Input (Optional)
                </span>
                <span className="text-[10px] text-zinc-500">Provide input before pressing Run</span>
              </div>
              <textarea
                value={input}
                onChange={(e) => onInputChange?.(e.target.value)}
                placeholder="Type standard input values here (or leave empty to enter values interactively in the terminal)..."
                rows={2}
                className="w-full bg-black text-white placeholder:text-zinc-600 border border-white/15 rounded p-2 text-[12px] font-mono outline-none focus:border-amber-400/60 resize-y min-h-[44px] max-h-[100px]"
              />
            </div>
          )}

          {/* Main Terminal Screen */}
          <div
            ref={terminalContainerRef}
            onClick={focusTerminalInput}
            className="flex-1 p-3.5 bg-[#050507] overflow-y-auto cursor-text select-text flex flex-col font-mono text-[13px] leading-relaxed custom-scrollbar"
          >
            {/* Empty State Banner (Before first run) */}
            {!isExecutionActive && !isRunning && (
              <div className="text-zinc-400 select-none pb-3 mb-3 border-b border-white/10 leading-relaxed">
                <div className="text-amber-400 font-bold mb-1">
                  Cryptic to Clear Interactive Terminal [v2.4]
                </div>
                <div className="text-zinc-300 text-xs mb-1">
                  Interactive terminal session ready.
                </div>
                <div className="text-zinc-400 text-xs">
                  Click &quot;Run&quot; above to execute your code. Input prompts will appear right here — type your answer and press Enter.
                </div>
              </div>
            )}

            {/* Terminal Lines (output + echoed input interleaved) */}
            {terminalLines.length > 0 && (
              <div className="flex flex-col gap-0 mb-1">
                {terminalLines.map((line, idx) => {
                  if (line.type === "input") {
                    return (
                      <div key={idx} className="flex items-center gap-1 text-amber-400 font-bold leading-snug">
                        <span className="text-amber-400 select-none">❯</span>
                        <span className="text-white">{line.content}</span>
                      </div>
                    );
                  }

                  if (line.type === "error") {
                    return (
                      <div key={idx} className="my-1 p-2 rounded bg-black/80 border border-white/20 text-zinc-200 whitespace-pre-wrap text-[12.5px]">
                        <div className="text-amber-400 font-bold mb-0.5 flex items-center gap-1 text-xs">
                          <AlertCircle className="h-3 w-3" />
                          <span>Error</span>
                        </div>
                        {line.content}
                      </div>
                    );
                  }

                  return (
                    <span key={idx} className="text-white whitespace-pre-wrap break-all leading-relaxed">
                      {line.content}
                    </span>
                  );
                })}
              </div>
            )}

            {/* Direct stdout/stderr if terminalLines is empty */}
            {terminalLines.length === 0 && output && (
              <pre className="text-white whitespace-pre-wrap break-all leading-relaxed mb-2 font-mono">
                {output}
              </pre>
            )}
            {terminalLines.length === 0 && errors && (
              <div className="my-1 p-2 rounded bg-black/80 border border-white/20 text-zinc-200 whitespace-pre-wrap text-[12.5px]">
                {errors}
              </div>
            )}

            {/* Finished execution hint (without blocking the input prompt) */}
            {!isRunning && isExecutionActive && !isWaitingForInput && (
              <div className="text-zinc-500 text-[11.5px] mt-2 mb-1 select-none flex items-center gap-1.5">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-400/80" />
                <span>Program execution completed. Enter input or click &quot;Run&quot; to re-execute.</span>
              </div>
            )}

            {/* Always-Active Interactive Terminal Prompt Line */}
            <form
              onSubmit={handleSendPrompt}
              className={`flex items-center gap-2 mt-auto pt-2.5 border-t shrink-0 select-text transition-colors ${
                isWaitingForInput
                  ? "border-amber-500/50 bg-amber-500/[0.04] -mx-3.5 px-3.5 py-1.5 rounded-b"
                  : "border-white/10"
              }`}
            >
              <div className="flex items-center gap-1 select-none shrink-0">
                <span className="text-amber-400 font-bold text-sm">❯</span>
                {isWaitingForInput && (
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400 animate-ping" />
                )}
              </div>
              <input
                ref={promptInputRef}
                type="text"
                value={terminalPrompt}
                onChange={(e) => setTerminalPrompt(e.target.value)}
                onKeyDown={handleKeyDown}
                disabled={isRunning}
                placeholder={
                  isRunning
                    ? "Running program..."
                    : isWaitingForInput
                    ? "Program waiting for input... type and press Enter"
                    : "Type input and press Enter..."
                }
                autoComplete="off"
                spellCheck={false}
                className="terminal-input flex-1 bg-transparent border-0 border-none outline-none ring-0 shadow-none focus:ring-0 focus:outline-none focus:shadow-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-none focus-visible:border-none text-[var(--ink)] placeholder:text-zinc-500 text-[13px] font-mono caret-amber-400 disabled:opacity-60 px-1 py-0.5"
                style={{ border: "none", outline: "none", boxShadow: "none" }}
              />
              <button
                type="submit"
                disabled={!terminalPrompt.trim() || isRunning}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-amber-500/20 text-amber-300 border border-amber-500/40 text-[11px] font-bold hover:bg-amber-500/30 disabled:opacity-30 transition-all cursor-pointer shadow-sm shrink-0"
              >
                {isRunning ? (
                  <>
                    <Loader2 className="h-3 w-3 animate-spin text-amber-300" />
                    <span>Sending</span>
                  </>
                ) : (
                  <>
                    <span>Send</span>
                    <CornerDownLeft className="h-2.5 w-2.5" />
                  </>
                )}
              </button>
            </form>
          </div>
        </>
      )}
    </div>
  );
}
