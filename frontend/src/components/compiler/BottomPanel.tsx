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
  Trash2,
  Loader2,
  SlidersHorizontal,
  Copy,
  Check,
} from "lucide-react";

export type BottomTab = "terminal" | "stdin" | "output" | "errors" | "testcase" | "result";

export interface TerminalLine {
  type: "output" | "input" | "error";
  content: string;
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
  activeTab = "output",
  onTabChange,
  executionTime = "—",
  memoryUsage = "—",
  onTriggerAiExplain,
}: BottomPanelProps) {
  const terminalContainerRef = useRef<HTMLDivElement>(null);
  const promptInputRef = useRef<HTMLInputElement>(null);
  const [terminalPrompt, setTerminalPrompt] = useState("");

  // Input history for Up/Down arrow navigation like bash
  const [history, setHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState<number>(-1);

  // Optional Stdin drawer toggle (if user wants to paste bulk stdin beforehand)
  const [showStdinDrawer, setShowStdinDrawer] = useState(false);
  const [copiedOutput, setCopiedOutput] = useState(false);

  // Focus terminal input whenever user clicks anywhere inside the terminal screen
  const focusTerminalInput = useCallback(() => {
    promptInputRef.current?.focus();
  }, []);

  // Auto-focus on mount and when execution status updates
  useEffect(() => {
    promptInputRef.current?.focus();
  }, [status, terminalLines, isRunning]);

  // Auto-scroll to bottom whenever output updates
  useEffect(() => {
    if (terminalContainerRef.current) {
      terminalContainerRef.current.scrollTop = terminalContainerRef.current.scrollHeight;
    }
  }, [terminalLines, errors, isRunning]);

  // Handle Enter key submission
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

  // Keyboard navigation for terminal (Up/Down arrow for history)
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSendPrompt();
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (history.length === 0) return;
      const nextIndex = historyIndex === -1 ? history.length - 1 : Math.max(0, historyIndex - 1);
      setHistoryIndex(nextIndex);
      setTerminalPrompt(history[nextIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
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

  // Last output line (used to show inline prompt hint)
  const lastOutputLine = terminalLines.length > 0
    ? terminalLines[terminalLines.length - 1]
    : null;
  const lastLineIsPrompt = lastOutputLine?.type === "output" &&
    /[:?]\s*$/.test(lastOutputLine.content.trim());

  return (
    <div className="flex h-full flex-col border-t border-[var(--border)] bg-[#070b14] text-[var(--ink)] font-mono select-none overflow-hidden">
      {/* Resizing Drag Handle */}
      <div
        onMouseDown={onResizeStart}
        className="h-2 w-full flex items-center justify-center cursor-row-resize group shrink-0 hover:bg-[var(--border)] transition-colors"
      >
        <GripHorizontal className="h-2 w-8 text-[var(--ink-faint)] group-hover:text-[var(--ink-dim)] transition-colors" />
      </div>

      {/* Terminal Title Bar */}
      <div className="flex items-center justify-between px-3.5 py-2 border-b border-zinc-800/80 shrink-0 bg-[#0c1220] select-none">
        {/* Left: Window Dots & Terminal Label */}
        <div className="flex items-center gap-2.5">
          {/* macOS window dots */}
          <div className="flex items-center gap-1.5 mr-1">
            <span className="w-2.5 h-2.5 rounded-full bg-[#ff5f56] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#ffbd2e] opacity-80" />
            <span className="w-2.5 h-2.5 rounded-full bg-[#27c93f] opacity-80" />
          </div>

          <div className="h-3.5 w-px bg-zinc-800 mr-1" />

          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-200">
            <Terminal className="h-3.5 w-3.5 text-emerald-400" />
            <span>Interactive Terminal</span>
          </div>

          {/* Status Badge */}
          {isRunning ? (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-500/15 border border-amber-500/30 text-amber-300 text-[10.5px]">
              <Loader2 className="h-3 w-3 animate-spin text-amber-400" />
              <span>Running...</span>
            </div>
          ) : isExecutionActive ? (
            hasErrors ? (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-rose-500/15 border border-rose-500/30 text-rose-400 text-[10.5px]">
                <AlertCircle className="h-3 w-3" />
                <span>Process Exited with Error</span>
              </div>
            ) : (
              <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-500/15 border border-emerald-500/30 text-emerald-400 text-[10.5px]">
                <CheckCircle2 className="h-3 w-3" />
                <span>Process Finished</span>
              </div>
            )
          ) : (
            <span className="text-[11px] text-zinc-500">Ready</span>
          )}
        </div>

        {/* Right: Actions & Performance Stats */}
        <div className="flex items-center gap-2">
          {isExecutionActive && !isRunning && (
            <div className="hidden sm:flex items-center gap-2 mr-1">
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">
                <Clock className="h-3 w-3 text-emerald-400" />
                <span>{executionTime !== "—" ? executionTime : "0.05s"}</span>
              </div>
              <div className="flex items-center gap-1 text-[11px] text-zinc-400 bg-zinc-850 px-2 py-0.5 rounded border border-zinc-800">
                <HardDrive className="h-3 w-3 text-sky-400" />
                <span>{memoryUsage !== "—" ? memoryUsage : "8 MB"}</span>
              </div>
            </div>
          )}

          {/* Ask AI to Explain Button if there are errors */}
          {hasErrors && onTriggerAiExplain && (
            <button
              type="button"
              onClick={onTriggerAiExplain}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-[11.5px] shadow-sm transition-all cursor-pointer"
            >
              <Sparkles className="h-3 w-3" />
              <span>Ask AI</span>
            </button>
          )}

          {/* Copy Terminal Output */}
          {output && (
            <button
              type="button"
              onClick={handleCopyTerminal}
              title="Copy terminal output"
              className="p-1 rounded text-zinc-400 hover:text-zinc-200 hover:bg-white/5 transition-colors cursor-pointer"
            >
              {copiedOutput ? (
                <Check className="h-3.5 w-3.5 text-emerald-400" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          )}

          {/* Preset STDIN Toggle Drawer Button */}
          <button
            type="button"
            onClick={() => setShowStdinDrawer((v) => !v)}
            title="Configure pre-set standard input (STDIN)"
            className={`flex items-center gap-1 px-2 py-1 rounded text-[11.5px] transition-colors cursor-pointer border ${
              showStdinDrawer || (input && input.trim().length > 0)
                ? "bg-sky-500/15 text-sky-300 border-sky-500/30"
                : "bg-white/5 text-zinc-400 hover:text-zinc-200 border-zinc-800 hover:bg-white/10"
            }`}
          >
            <SlidersHorizontal className="h-3 w-3" />
            <span className="hidden sm:inline">STDIN</span>
            {input && input.trim().length > 0 && (
              <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
            )}
          </button>

          {/* Clear Terminal Button */}
          <button
            type="button"
            onClick={onClearOutput}
            title="Clear terminal"
            className="flex items-center gap-1 px-2 py-1 rounded text-[11.5px] text-zinc-400 hover:text-zinc-200 bg-white/5 hover:bg-white/10 border border-zinc-800 transition-colors cursor-pointer"
          >
            <Trash2 className="h-3 w-3" />
            <span className="hidden sm:inline">Clear</span>
          </button>
        </div>
      </div>

      {/* Optional Top Drawer: Pre-configured Standard Input (STDIN) */}
      {showStdinDrawer && (
        <div className="bg-[#0b101c] border-b border-zinc-800/80 p-2.5 shrink-0 flex flex-col gap-1.5">
          <div className="flex items-center justify-between text-xs text-zinc-400">
            <span className="font-semibold text-zinc-300 text-[11.5px]">Pre-set Standard Input (Optional)</span>
            <span className="text-[10px] text-zinc-500">Provide input before pressing Run</span>
          </div>
          <textarea
            value={input}
            onChange={(e) => onInputChange?.(e.target.value)}
            placeholder="Type standard input values here (or leave empty to enter values interactively in the terminal)..."
            rows={2}
            className="w-full bg-[#050810] text-zinc-200 placeholder:text-zinc-600 border border-zinc-800 rounded p-2 text-[12px] font-mono outline-none focus:border-emerald-500/60 resize-y min-h-[44px] max-h-[100px]"
          />
        </div>
      )}

      {/* Main Terminal Screen */}
      <div
        ref={terminalContainerRef}
        onClick={focusTerminalInput}
        className="flex-1 p-3.5 bg-[#070b14] overflow-y-auto cursor-text select-text flex flex-col font-mono text-[13px] leading-relaxed"
      >
        {/* Empty State Banner (Before first run) */}
        {!isExecutionActive && !isRunning && (
          <div className="text-zinc-500 select-none pb-3 mb-3 border-b border-zinc-900 leading-relaxed">
            <div className="text-emerald-400 font-bold mb-1">
              Cryptic to Clear Interactive Terminal [v2.4]
            </div>
            <div className="text-zinc-400 text-xs mb-1">
              Interactive terminal session ready.
            </div>
            <div className="text-zinc-500 text-xs">
              Click &quot;Run&quot; above to execute your code. Input prompts will appear right here — type your answer and press Enter.
            </div>
          </div>
        )}

        {/* ─── Terminal Lines (output + echoed input interleaved) ─── */}
        {terminalLines.length > 0 && (
          <div className="flex flex-col gap-0 mb-1">
            {terminalLines.map((line, idx) => {
              if (line.type === "input") {
                // User's typed input — shown in green with a prompt symbol
                return (
                  <div key={idx} className="flex items-center gap-1 text-emerald-400 font-bold leading-snug">
                    <span className="text-emerald-500 select-none">❯</span>
                    <span>{line.content}</span>
                  </div>
                );
              }

              if (line.type === "error") {
                // Error output
                return (
                  <div key={idx} className="my-1 p-2 rounded bg-rose-500/10 border border-rose-500/20 text-rose-300 whitespace-pre-wrap text-[12.5px]">
                    <div className="text-rose-400 font-bold mb-0.5 flex items-center gap-1 text-xs">
                      <AlertCircle className="h-3 w-3" />
                      <span>Error</span>
                    </div>
                    {line.content}
                  </div>
                );
              }

              // Regular stdout line
              const trimmed = line.content.trim();

              // Detect prompt lines (ends with : or ?)
              const isPromptLine = /[:?]\s*$/.test(trimmed) &&
                trimmed.length > 0;

              if (isPromptLine) {
                return (
                  <div key={idx} className="text-zinc-100 leading-snug">
                    {line.content}
                  </div>
                );
              }

              return (
                <div key={idx} className="text-zinc-200 leading-snug whitespace-pre-wrap">
                  {line.content || "\u00a0" /* non-breaking space for empty lines */}
                </div>
              );
            })}
          </div>
        )}

        {/* Running spinner inline */}
        {isRunning && (
          <div className="flex items-center gap-2 text-amber-400 text-xs mt-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>Executing...</span>
          </div>
        )}

        {/* ─── Inline Terminal Input Prompt ─── */}
        {/* Always visible at the bottom so the user can type at any point */}
        <form
          onSubmit={handleSendPrompt}
          className="flex items-center gap-2 mt-1 shrink-0 group"
        >
          {/* Active Terminal Prompt Symbol */}
          <span className={`font-bold select-none text-[13px] flex items-center gap-1 shrink-0 ${
            lastLineIsPrompt ? "text-yellow-400" : "text-emerald-400"
          }`}>
            <span>❯</span>
          </span>

          {/* Borderless, Transparent Input Field */}
          <input
            ref={promptInputRef}
            type="text"
            value={terminalPrompt}
            onChange={(e) => setTerminalPrompt(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={isRunning}
            placeholder={
              isRunning
                ? "Executing..."
                : lastLineIsPrompt
                ? "Type your answer and press Enter..."
                : isExecutionActive
                ? "Type input here and press Enter..."
                : "Type input or click Run..."
            }
            className={`flex-1 bg-transparent border-none outline-none font-mono text-[13px] p-0 m-0 placeholder:text-zinc-600 focus:ring-0 focus:outline-none disabled:opacity-50 ${
              lastLineIsPrompt ? "text-yellow-300 caret-yellow-400" : "text-emerald-400 caret-emerald-400"
            }`}
            autoComplete="off"
            spellCheck={false}
            autoFocus
          />

          {/* Enter keycap button */}
          <button
            type="submit"
            disabled={isRunning || !terminalPrompt.trim()}
            className="flex items-center gap-1 px-2 py-0.5 text-[11px] font-mono rounded bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-400 border border-emerald-500/30 transition-colors disabled:opacity-30 disabled:pointer-events-none cursor-pointer shrink-0"
            title="Press Enter to send input to terminal"
          >
            <span>Enter</span>
            <CornerDownLeft className="h-3 w-3" />
          </button>
        </form>
      </div>
    </div>
  );
}
