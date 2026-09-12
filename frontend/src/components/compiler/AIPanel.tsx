"use client";

import { useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Sparkles, Send, X, Bot, User, RotateCcw, AlertCircle, Maximize2, Minimize2 } from "lucide-react";
import type {
  ChatMessage,
  ErrorChatMessage,
  ExplanationChatMessage,
} from "@/lib/chat";
import MarkdownMessage from "./MarkdownMessage";
import ExplanationBubble from "./ExplanationBubble";
import QuickActionsMenu from "./QuickActionsMenu";

interface AIPanelProps {
  onClose?: () => void;
  isFloating?: boolean;
  onToggleFloating?: () => void;
  messages: ChatMessage[];
  busy: boolean;
  inputValue: string;
  onInputChange: (v: string) => void;
  onSend: () => void;
  onQuickAction: (prompt: string) => void;
  onRetry: (msg: ErrorChatMessage) => void;
  getFixState: (id: string) => { applied: boolean; canUndo: boolean };
  onApplyFix: (msg: ExplanationChatMessage) => void;
  onUndoFix: (msg: ExplanationChatMessage) => void;
  onCompareChanges: (msg: ExplanationChatMessage) => void;
  inputId?: string;
}

function LoadingBubble({ label }: { label: string }) {
  return (
    <div className="flex gap-2.5">
      <motion.span
        animate={{ rotate: 360 }}
        transition={{ duration: 1.4, repeat: Infinity, ease: "linear" }}
        className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)]"
      >
        <Sparkles className="h-3 w-3 text-[#0a0d13]" />
      </motion.span>
      <div className="flex-1 space-y-1.5 pt-0.5">
        <p className="text-[12px] text-[var(--ink-faint)]">{label}</p>
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <motion.span
              key={i}
              className="h-1.5 w-1.5 rounded-full bg-[var(--syn-function)]"
              animate={{ opacity: [0.25, 1, 0.25] }}
              transition={{ duration: 1, repeat: Infinity, delay: i * 0.15 }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function ErrorBubble({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
        <AlertCircle className="h-3.5 w-3.5 text-[var(--syn-const)]" />
      </span>
      <div className="glass rounded-lg rounded-tl-sm px-3.5 py-2.5 space-y-2 flex-1">
        <p className="text-[12px] text-[var(--ink-dim)] leading-relaxed">{message}</p>
        <button
          onClick={onRetry}
          className="flex items-center gap-1.5 text-[11.5px] font-mono text-[var(--syn-function)] hover:text-[var(--ink)] transition-colors"
        >
          <RotateCcw className="h-3 w-3" />
          Try again
        </button>
      </div>
    </div>
  );
}

function UserBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
        <User className="h-3.5 w-3.5 text-[var(--syn-function)]" />
      </span>
      <div className="glass-strong rounded-lg rounded-tl-sm px-3.5 py-2.5 text-[12.5px] text-[var(--ink)] leading-relaxed whitespace-pre-wrap">
        {content}
      </div>
    </div>
  );
}

function AssistantTextBubble({ content }: { content: string }) {
  return (
    <div className="flex gap-2.5">
      <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
        <Bot className="h-3.5 w-3.5 text-[var(--syn-keyword)]" />
      </span>
      <div className="glass rounded-lg rounded-tl-sm px-3.5 py-2.5 flex-1 min-w-0">
        <MarkdownMessage content={content} />
      </div>
    </div>
  );
}

export default function AIPanel({
  onClose,
  isFloating,
  onToggleFloating,
  messages,
  busy,
  inputValue,
  onInputChange,
  onSend,
  onQuickAction,
  onRetry,
  getFixState,
  onApplyFix,
  onUndoFix,
  onCompareChanges,
  inputId,
}: AIPanelProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement | HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      if (!busy && inputValue.trim()) onSend();
    }
  };

  return (
    <div className="flex h-full flex-col glass-strong border-l border-[var(--border)]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-[var(--border)] select-none">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)]">
            <Sparkles className="h-3.5 w-3.5 text-[#0a0d13]" />
          </span>
          <div>
            <p className="text-[13px] font-medium leading-none flex items-center gap-1.5">
              <span>AI Explanation</span>
              {isFloating && (
                <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30">
                  POP-UP APP
                </span>
              )}
            </p>
            <p className="text-[11px] text-[var(--ink-faint)] font-mono mt-1">
              {busy ? "thinking…" : isFloating ? "drag header to move pop-up" : "ask anything about your code"}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          {onToggleFloating && (
            <button
              onClick={onToggleFloating}
              title={isFloating ? "Dock to right sidebar" : "Pop out as movable app window"}
              className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer"
            >
              {isFloating ? (
                <Minimize2 className="h-3.5 w-3.5 text-[var(--syn-keyword)]" />
              ) : (
                <Maximize2 className="h-3.5 w-3.5 text-[var(--syn-function)]" />
              )}
            </button>
          )}

          {onClose && (
            <button
              onClick={onClose}
              aria-label="Close"
              className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Message list */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto px-4 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex gap-2.5">
            <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/5">
              <Bot className="h-3.5 w-3.5 text-[var(--syn-keyword)]" />
            </span>
            <div className="glass rounded-lg rounded-tl-sm px-3.5 py-2.5 text-[13px] text-[var(--ink-dim)] leading-relaxed">
              Hi, I&apos;m Cryptic to Clear. Ask me anything about your code, try a
              quick action below, or just keep coding — I&apos;ll jump in
              automatically if your build fails.
            </div>
          </div>
        )}

        {messages.map((m) => {
          if (m.kind === "text") {
            return m.role === "user" ? (
              <UserBubble key={m.id} content={m.content} />
            ) : (
              <AssistantTextBubble key={m.id} content={m.content} />
            );
          }
          if (m.kind === "loading") {
            return <LoadingBubble key={m.id} label={m.label} />;
          }
          if (m.kind === "error") {
            return (
              <ErrorBubble key={m.id} message={m.message} onRetry={() => onRetry(m)} />
            );
          }
          // explanation
          const fixState = getFixState(m.id);
          return (
            <ExplanationBubble
              key={m.id}
              explanation={m.explanation}
              fixApplied={fixState.applied}
              canUndo={fixState.canUndo}
              onApplyFix={() => onApplyFix(m)}
              onCompareChanges={() => onCompareChanges(m)}
              onUndoFix={() => onUndoFix(m)}
            />
          );
        })}
      </div>

      {/* Quick actions */}
      <QuickActionsMenu onSelect={onQuickAction} disabled={busy} />

      {/* Modern Full-Width AI Chat Input Box */}
      <div className="p-3 border-t border-[var(--border)] bg-black/20">
        <div className="flex flex-col gap-2 rounded-2xl glass-strong border border-white/10 p-3 focus-within:border-[#D4AF37]/60 focus-within:ring-1 focus-within:ring-[#D4AF37]/30 transition-all shadow-lg shadow-black/30">
          <textarea
            id={inputId}
            value={inputValue}
            onChange={(e) => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={busy}
            rows={2}
            placeholder="Ask Cryptic to Clear… (e.g. 'explain line 12', 'why did it fail?')"
            aria-label="Ask Cryptic to Clear"
            className="ai-input w-full bg-transparent text-[13px] text-[var(--ink)] placeholder:text-[var(--ink-faint)] outline-none border-0 border-none shadow-none ring-0 focus:ring-0 focus:outline-none focus:shadow-none focus:border-none focus-visible:ring-0 focus-visible:outline-none focus-visible:shadow-none focus-visible:border-none resize-none leading-relaxed min-h-[44px] max-h-[160px] overflow-y-auto"
            style={{ border: "none", outline: "none", boxShadow: "none" }}
          />
          <div className="flex items-center justify-between pt-1 text-[11px] text-[var(--ink-faint)] select-none">
            <span className="font-mono text-[10.5px] opacity-70">
              Press <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-zinc-300">Enter ↵</kbd> to send, <kbd className="px-1.5 py-0.5 rounded bg-white/10 font-mono text-[10px] text-zinc-300">Shift+Enter</kbd> for newline
            </span>
            <button
              type="button"
              onClick={onSend}
              disabled={busy || !inputValue.trim()}
              aria-label="Send message"
              className="h-7 w-7 flex items-center justify-center rounded-lg bg-gradient-to-br from-[#D4AF37] to-[#E8C97A] text-[#0a0d13] font-bold disabled:opacity-20 disabled:cursor-not-allowed hover:scale-105 active:scale-95 transition-all cursor-pointer shrink-0 shadow-md shadow-[#D4AF37]/20"
              title="Send to AI"
            >
              <Send className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
