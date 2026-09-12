"use client";

import {
  Play,
  Hammer,
  Trash2,
  Upload,
  Maximize,
  Minimize,
  Loader2,
  PanelRight,
  Gauge,
  Bug,
  GraduationCap,
  ArrowLeftRight,
  Keyboard,
  Send,
  BookOpen,
} from "lucide-react";
import LanguageDropdown from "./LanguageDropdown";
import SettingsPanel from "./SettingsPanel";
import ExportMenu from "./ExportMenu";
import { EditorSettings } from "./CodeEditor";
import { LanguageConfig } from "@/lib/languages";

interface ToolbarProps {
  language: string;
  onLanguageChange: (id: LanguageConfig["id"]) => void;
  allowedLanguages?: string[];
  activeAssignment?: any | null;
  onSubmitAssignment?: () => void;
  isSubmittingAssignment?: boolean;
  onToggleProblemSpecs?: () => void;
  isProblemSpecsOpen?: boolean;
  onRun: () => void;
  onCompile: () => void;
  onClear: () => void;
  onUpload: (file: File) => void;
  isRunning: boolean;
  isCompiling: boolean;
  fullscreen: boolean;
  onToggleFullscreen: () => void;
  settings: EditorSettings;
  onSettingsChange: (s: EditorSettings) => void;
  autoSave: boolean;
  onAutoSaveChange: (v: boolean) => void;
  onToggleAIPanel: () => void;
  aiPanelOpen: boolean;
  onAnalyze: () => void;
  isAnalyzing: boolean;
  onDebug: () => void;
  isDebugging: boolean;
  onExplain: () => void;
  isExplaining: boolean;
  onConvert: () => void;
  onDownloadCode: () => void;
  onCopyCode: () => void;
  onExportPdf: () => void;
  onShareLink: () => void;
  onPrintCode: () => void;
  onDownloadExplanation: () => void;
  onDownloadCorrectedCode: () => void;
  onDownloadExecutionReport: () => void;
  hasExplanation: boolean;
  hasCorrectedCode: boolean;
  hasExecutionResult: boolean;
  onShowShortcuts: () => void;
}

export default function Toolbar({
  language,
  onLanguageChange,
  allowedLanguages,
  activeAssignment,
  onSubmitAssignment,
  isSubmittingAssignment,
  onToggleProblemSpecs,
  isProblemSpecsOpen,
  onRun,
  onCompile,
  onClear,
  onUpload,
  isRunning,
  isCompiling,
  fullscreen,
  onToggleFullscreen,
  settings,
  onSettingsChange,
  autoSave,
  onAutoSaveChange,
  onToggleAIPanel,
  aiPanelOpen,
  onAnalyze,
  isAnalyzing,
  onDebug,
  isDebugging,
  onExplain,
  isExplaining,
  onConvert,
  onDownloadCode,
  onCopyCode,
  onExportPdf,
  onShareLink,
  onPrintCode,
  onDownloadExplanation,
  onDownloadCorrectedCode,
  onDownloadExecutionReport,
  hasExplanation,
  hasCorrectedCode,
  hasExecutionResult,
  onShowShortcuts,
}: ToolbarProps) {
  return (
    <div className="flex items-center gap-2 px-3 sm:px-4 py-2.5 glass-strong border-b border-[var(--border)] overflow-x-auto">
      <LanguageDropdown
        value={language}
        onChange={onLanguageChange}
        onlySupported
        allowedLanguages={allowedLanguages}
      />

      <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />

      <button
        onClick={onRun}
        disabled={isRunning}
        className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-black bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 hover:brightness-110 shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:shadow-[0_0_28px_rgba(212,175,55,0.6)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
      >
        {isRunning ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-black" />
        ) : (
          <Play className="h-3.5 w-3.5 fill-black text-black" />
        )}
        Run
      </button>

      {/* Submit Assignment CTA */}
      {activeAssignment && onSubmitAssignment && (
        <button
          onClick={onSubmitAssignment}
          disabled={isSubmittingAssignment || isRunning}
          title="Submit solution for this assignment"
          className="flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-bold text-white bg-black/80 border-2 border-amber-400 hover:bg-amber-500/20 shadow-[0_0_20px_rgba(212,175,55,0.35)] hover:shadow-[0_0_30px_rgba(212,175,55,0.55)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
        >
          {isSubmittingAssignment ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
          ) : (
            <Send className="h-3.5 w-3.5 text-amber-400" />
          )}
          Submit Assignment
        </button>
      )}

      <button
        onClick={onCompile}
        disabled={isCompiling}
        className="flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-[13px] font-semibold text-white bg-black/50 border border-amber-500/30 hover:bg-amber-500/15 hover:border-amber-400/60 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
      >
        {isCompiling ? (
          <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
        ) : (
          <Hammer className="h-3.5 w-3.5 text-amber-400" />
        )}
        Compile
      </button>

      <div className="w-px h-6 bg-[var(--border)] mx-1 shrink-0" />

      <ToolbarIcon title="Clear editor" onClick={onClear}>
        <Trash2 className="h-4 w-4" />
      </ToolbarIcon>

      <label
        title="Upload file"
        aria-label="Upload file"
        className="h-9 w-9 flex items-center justify-center rounded-lg glass hover:bg-white/[0.08] hover:border-amber-400/40 text-[var(--ink-dim)] hover:text-[var(--ink)] transition-all hover:shadow-[0_0_12px_rgba(212,175,55,0.2)] cursor-pointer shrink-0"
      >
        <Upload className="h-4 w-4" />
        <input
          type="file"
          className="hidden"
          accept=".c,.cpp,.java,.py,.js,.ts,.html,.css,.json,.txt"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) {
              onUpload(file);
              e.target.value = "";
            }
          }}
        />
      </label>

      <ToolbarIcon
        title={fullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        onClick={onToggleFullscreen}
      >
        {fullscreen ? (
          <Minimize className="h-4 w-4" />
        ) : (
          <Maximize className="h-4 w-4" />
        )}
      </ToolbarIcon>

      <ExportMenu
        onDownloadCode={onDownloadCode}
        onCopyCode={onCopyCode}
        onExportPdf={onExportPdf}
        onShareLink={onShareLink}
        onPrintCode={onPrintCode}
        onDownloadExplanation={onDownloadExplanation}
        onDownloadCorrectedCode={onDownloadCorrectedCode}
        onDownloadExecutionReport={onDownloadExecutionReport}
        hasExplanation={hasExplanation}
        hasCorrectedCode={hasCorrectedCode}
        hasExecutionResult={hasExecutionResult}
      />

      <div className="flex-1 min-w-2" />

      {/* Assignment Mode: Show Problem Specs Toggle & Hide All AI Tools */}
      {activeAssignment ? (
        <div className="flex items-center gap-2">
          {onToggleProblemSpecs && (
            <button
              onClick={onToggleProblemSpecs}
              title="Toggle Problem Statement & Instructions"
              className={`flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-semibold transition-all shrink-0 cursor-pointer ${
                isProblemSpecsOpen
                  ? "bg-amber-500/20 text-amber-300 border border-amber-400/60 shadow-[0_0_12px_rgba(212,175,55,0.25)]"
                  : "bg-black/40 text-white/80 border border-white/20 hover:bg-white/10 hover:text-white"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-amber-400" />
              <span>Problem Specs</span>
            </button>
          )}

          <div className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-lg bg-black/60 border border-amber-500/30 text-amber-300 text-[11px] font-mono font-semibold">
            <span>Points: {activeAssignment.points || 100}</span>
          </div>
        </div>
      ) : (
        /* Regular Compiler Mode: Black, Gold, White Suite */
        <>
          <button
            onClick={onAnalyze}
            disabled={isAnalyzing}
            title="Analyze code quality"
            className="flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-medium text-white bg-black/40 border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {isAnalyzing ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <Gauge className="h-3.5 w-3.5 text-amber-400" />
            )}
            Analyze
          </button>

          <button
            onClick={onDebug}
            disabled={isDebugging}
            title="Open Visual Debugger"
            className="flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-medium text-white bg-black/40 border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {isDebugging ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <Bug className="h-3.5 w-3.5 text-amber-400" />
            )}
            Debug
          </button>

          <button
            onClick={onExplain}
            disabled={isExplaining}
            title="Learning Mode: explain this code"
            className="flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-medium text-white bg-black/40 border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60 shrink-0 cursor-pointer"
          >
            {isExplaining ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin text-amber-400" />
            ) : (
              <GraduationCap className="h-3.5 w-3.5 text-amber-400" />
            )}
            Explain
          </button>

          <button
            onClick={onConvert}
            title="Convert to another language"
            className="flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-medium text-white bg-black/40 border border-amber-500/30 hover:bg-amber-500/10 hover:border-amber-400/50 shadow-[0_0_12px_rgba(212,175,55,0.15)] transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer"
          >
            <ArrowLeftRight className="h-3.5 w-3.5 text-amber-400" />
            Convert
          </button>

          <button
            onClick={onToggleAIPanel}
            title="Toggle AI Assistant panel"
            className={`hidden md:flex items-center gap-1.5 h-9 rounded-lg px-3 text-[12px] font-mono font-medium transition-all transform hover:scale-[1.02] active:scale-[0.98] shrink-0 cursor-pointer ${
              aiPanelOpen
                ? "bg-amber-500/20 text-amber-300 border border-amber-400/50 shadow-[0_0_15px_rgba(212,175,55,0.35)]"
                : "bg-black/40 text-white/80 border border-white/20 hover:bg-white/10 hover:text-white"
            }`}
          >
            <PanelRight className="h-3.5 w-3.5" />
            AI
          </button>
        </>
      )}

      <button
        onClick={onShowShortcuts}
        title="Keyboard shortcuts"
        aria-label="Show keyboard shortcuts"
        className="h-9 w-9 flex items-center justify-center rounded-lg glass hover:border-[var(--border-strong)] transition-colors text-[var(--ink-dim)] shrink-0"
      >
        <Keyboard className="h-4 w-4" />
      </button>

      <SettingsPanel
        settings={settings}
        onChange={onSettingsChange}
        autoSave={autoSave}
        onAutoSaveChange={onAutoSaveChange}
      />
    </div>
  );
}

function ToolbarIcon({
  title,
  onClick,
  children,
}: {
  title: string;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      title={title}
      aria-label={title}
      onClick={onClick}
      className="h-9 w-9 flex items-center justify-center rounded-lg glass hover:border-[var(--border-strong)] transition-colors text-[var(--ink-dim)] hover:text-[var(--ink)] shrink-0"
    >
      {children}
    </button>
  );
}
