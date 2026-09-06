"use client";

import { useState } from "react";
import { motion, AnimatePresence, useDragControls } from "framer-motion";
import {
  X,
  RotateCcw,
  Lightbulb,
  Workflow,
  FileCode2,
  Timer,
  HelpCircle,
  Briefcase,
  Link2,
  Eye,
  EyeOff,
  GripHorizontal,
  Minus,
  Maximize2,
  Minimize2,
  Move,
} from "lucide-react";
import type { LearningContent } from "@/lib/api";
import MermaidDiagram from "./MermaidDiagram";

type Level = "beginner" | "intermediate" | "advanced";

const LEVELS: { id: Level; label: string }[] = [
  { id: "beginner", label: "Beginner" },
  { id: "intermediate", label: "Intermediate" },
  { id: "advanced", label: "Advanced" },
];

function Card({
  icon: Icon,
  title,
  accent,
  children,
  className = "",
}: {
  icon: React.ComponentType<{ className?: string; style?: React.CSSProperties }>;
  title: string;
  accent: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`glass rounded-xl p-4 ${className}`}>
      <div className="flex items-center gap-2 mb-2.5">
        <Icon className="h-4 w-4" style={{ color: accent }} />
        <h3 className="text-[12.5px] font-medium text-[var(--ink)]">{title}</h3>
      </div>
      {children}
    </div>
  );
}

function RevealQuestion({
  question,
  hint,
  accent,
}: {
  question: string;
  hint: string;
  accent: string;
}) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="space-y-2.5">
      <p className="text-[12px] text-[var(--ink-dim)] leading-relaxed">{question}</p>
      <button
        onClick={() => setRevealed((v) => !v)}
        className="flex items-center gap-1.5 text-[11px] font-mono transition-colors cursor-pointer"
        style={{ color: accent }}
      >
        {revealed ? <EyeOff className="h-3 w-3" /> : <Eye className="h-3 w-3" />}
        {revealed ? "Hide hint" : "Show hint"}
      </button>
      <AnimatePresence initial={false}>
        {revealed && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="overflow-hidden"
          >
            <p className="text-[11.5px] text-[var(--ink-dim)] leading-relaxed rounded-md bg-black/20 p-2.5">
              {hint}
            </p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

interface LearningModeModalProps {
  open: boolean;
  onClose: () => void;
  language: string;
  status: "loading" | "success" | "error";
  content: LearningContent | null;
  errorMessage: string | null;
  onRetry: () => void;
  onExploreTopic: (topic: string) => void;
}

export default function LearningModeModal({
  open,
  onClose,
  language,
  status,
  content,
  errorMessage,
  onRetry,
  onExploreTopic,
}: LearningModeModalProps) {
  const dragControls = useDragControls();
  const [level, setLevel] = useState<Level>("beginner");
  const [isMinimized, setIsMinimized] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [isTranslucent, setIsTranslucent] = useState(false);

  if (!open) return null;

  const levelContent: Record<Level, string> = content
    ? {
        beginner: content.beginnerExplanation,
        intermediate: content.intermediateExplanation,
        advanced: content.advancedExplanation,
      }
    : { beginner: "", intermediate: "", advanced: "" };

  if (isMinimized) {
    return (
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 20 }}
          className="fixed z-50 bottom-6 right-6 flex items-center gap-3 p-2.5 pl-3.5 glass-strong rounded-full border border-[var(--syn-keyword)]/50 shadow-[0_15px_40px_rgba(0,0,0,0.6)] backdrop-blur-xl select-none"
        >
          <span className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] shadow-md">
            <Lightbulb className="h-4 w-4 text-[#0a0d13]" />
          </span>
          <div className="flex flex-col pr-1">
            <span className="text-[12px] font-medium text-[var(--ink)]">Learning Mode</span>
            {content?.topic ? (
              <span className="text-[10px] font-mono text-[var(--ink-faint)] truncate max-w-[150px]">
                {content.topic}
              </span>
            ) : (
              <span className="text-[10px] font-mono text-[var(--ink-faint)]">Active Lesson</span>
            )}
          </div>
          <div className="flex items-center gap-1.5 ml-1 border-l border-[var(--border)] pl-2.5">
            <button
              onClick={() => setIsMinimized(false)}
              title="Expand Pop-up App"
              className="h-7 px-3 flex items-center gap-1.5 rounded-full text-[11px] font-mono bg-[var(--syn-keyword)]/20 text-[var(--syn-keyword)] border border-[var(--syn-keyword)]/40 hover:bg-[var(--syn-keyword)]/30 transition-colors cursor-pointer font-medium"
            >
              <Maximize2 className="h-3 w-3" />
              Restore
            </button>
            <button
              onClick={onClose}
              title="Close"
              className="h-7 w-7 flex items-center justify-center rounded-full text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </motion.div>
      </AnimatePresence>
    );
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          drag
          dragControls={dragControls}
          dragListener={false}
          dragMomentum={false}
          dragElastic={0.05}
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className={`fixed z-50 top-16 left-6 sm:left-12 ${
            isExpanded ? "w-[860px] h-[780px]" : "w-[560px] h-[660px]"
          } max-w-[94vw] max-h-[88vh] flex flex-col ${
            isTranslucent ? "bg-[#0d1117]/65 backdrop-blur-md" : "glass-strong backdrop-blur-xl"
          } rounded-2xl border border-[var(--syn-keyword)]/40 shadow-[0_25px_70px_rgba(0,0,0,0.75)] overflow-hidden transition-[width,height,background-color] duration-200`}
          role="dialog"
          aria-label="Learning Mode Pop-up App"
        >
          {/* Draggable Header */}
          <div
            onPointerDown={(e) => dragControls.start(e)}
            className="flex items-center justify-between px-4 sm:px-5 py-3 border-b border-[var(--border)] shrink-0 select-none cursor-grab active:cursor-grabbing bg-black/20 hover:bg-black/30 transition-colors"
          >
            <div className="flex items-center gap-2.5">
              <GripHorizontal className="h-4 w-4 text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors" />
              <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] shadow-md">
                <Lightbulb className="h-3.5 w-3.5 text-[#0a0d13]" />
              </span>
              <div>
                <div className="flex items-center gap-2">
                  <p className="text-[13.5px] font-medium text-[var(--ink)]">Learning Mode</p>
                  <span className="px-1.5 py-0.5 text-[9px] font-mono rounded bg-purple-500/20 text-purple-300 font-bold border border-purple-500/30 flex items-center gap-1">
                    <Move className="h-2.5 w-2.5" /> POP-UP APP
                  </span>
                </div>
                <p className="text-[11px] font-mono text-[var(--ink-faint)] mt-0.5">
                  {content ? `drag header to move • ${content.topic}` : "drag header to move pop-up window"}
                </p>
              </div>
            </div>

            {/* Window Action Controls */}
            <div className="flex items-center gap-1" onPointerDown={(e) => e.stopPropagation()}>
              <button
                onClick={() => setIsTranslucent((v) => !v)}
                title={isTranslucent ? "Solid Background" : "Translucent Background"}
                className={`h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors cursor-pointer ${
                  isTranslucent ? "bg-purple-500/30 text-purple-200" : "hover:bg-white/10"
                }`}
              >
                <Eye className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={() => setIsExpanded((v) => !v)}
                title={isExpanded ? "Collapse Width" : "Expand Width"}
                className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer"
              >
                {isExpanded ? <Minimize2 className="h-3.5 w-3.5" /> : <Maximize2 className="h-3.5 w-3.5" />}
              </button>
              <button
                onClick={() => setIsMinimized(true)}
                title="Minimize Window"
                className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Minus className="h-3.5 w-3.5" />
              </button>
              <button
                onClick={onClose}
                title="Close"
                className="h-7 w-7 flex items-center justify-center rounded-md text-[var(--ink-faint)] hover:text-[var(--ink)] hover:bg-white/10 transition-colors cursor-pointer ml-1"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {status === "loading" && (
              <div className="flex items-center justify-center py-16">
                <div className="flex items-center gap-3">
                  <motion.span
                    animate={{ rotate: 360 }}
                    transition={{ duration: 1.2, repeat: Infinity, ease: "linear" }}
                    className="h-6 w-6 rounded-full border-2 border-[var(--syn-keyword)] border-t-transparent"
                  />
                  <p className="text-[13px] text-[var(--ink-dim)]">Preparing your lesson…</p>
                </div>
              </div>
            )}

            {status === "error" && (
              <div className="glass rounded-xl p-5 space-y-3">
                <p className="text-[13px] text-[var(--ink)] font-medium">Couldn&apos;t generate this lesson</p>
                <p className="text-[12px] text-[var(--ink-dim)] leading-relaxed">{errorMessage}</p>
                <button
                  onClick={onRetry}
                  className="flex items-center gap-1.5 text-[12px] font-mono text-[var(--syn-function)] hover:text-[var(--ink)] transition-colors cursor-pointer"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  Try again
                </button>
              </div>
            )}

            {status === "success" && content && (
              <>
                {/* Level selector + explanation */}
                <div className="glass rounded-xl p-4">
                  <div className="flex items-center gap-1 rounded-lg glass p-1 w-fit mb-3">
                    {LEVELS.map((l) => (
                      <button
                        key={l.id}
                        onClick={() => setLevel(l.id)}
                        className={`rounded-md px-3 py-1.5 text-[11.5px] font-mono transition-colors cursor-pointer ${
                          level === l.id
                            ? "bg-white/10 text-[var(--ink)] font-medium"
                            : "text-[var(--ink-faint)] hover:text-[var(--ink-dim)]"
                        }`}
                      >
                        {l.label}
                      </button>
                    ))}
                  </div>
                  <AnimatePresence mode="wait">
                    <motion.p
                      key={level}
                      initial={{ opacity: 0, y: 4 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -4 }}
                      transition={{ duration: 0.15 }}
                      className="text-[12.5px] text-[var(--ink-dim)] leading-relaxed"
                    >
                      {levelContent[level]}
                    </motion.p>
                  </AnimatePresence>
                </div>

                {/* Real-life example + Complexity */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card icon={Lightbulb} title="Real-Life Example" accent="var(--syn-cursor)">
                    <p className="text-[12px] text-[var(--ink-dim)] leading-relaxed">
                      {content.realLifeExample}
                    </p>
                  </Card>
                  <Card icon={Timer} title="Complexity Analysis" accent="var(--syn-const)">
                    <div className="flex gap-2 mb-2">
                      <span className="rounded-full bg-[var(--syn-function)]/15 text-[var(--syn-function)] text-[11px] font-mono px-2.5 py-1">
                        Time: {content.complexityAnalysis.timeComplexity}
                      </span>
                      <span className="rounded-full bg-[var(--syn-const)]/15 text-[var(--syn-const)] text-[11px] font-mono px-2.5 py-1">
                        Space: {content.complexityAnalysis.spaceComplexity}
                      </span>
                    </div>
                    <p className="text-[12px] text-[var(--ink-dim)] leading-relaxed">
                      {content.complexityAnalysis.explanation}
                    </p>
                  </Card>
                </div>

                {/* Flowchart */}
                <Card icon={Workflow} title="Flowchart" accent="var(--syn-keyword)">
                  <MermaidDiagram definition={content.flowchartMermaid} />
                </Card>

                {/* Pseudocode */}
                <Card icon={FileCode2} title="Pseudo Code" accent="var(--syn-string)">
                  <pre className="rounded-md bg-black/30 p-3 overflow-x-auto font-mono text-[11.5px] text-[var(--syn-string)] whitespace-pre-wrap">
                    {(content.pseudoCode || "").replace(/\\n/g, "\n")}
                  </pre>
                </Card>

                {/* Practice + Interview questions */}
                <div className="grid sm:grid-cols-2 gap-4">
                  <Card icon={HelpCircle} title="Practice Question" accent="var(--syn-function)">
                    <RevealQuestion
                      question={content.practiceQuestion.question}
                      hint={content.practiceQuestion.hint}
                      accent="var(--syn-function)"
                    />
                  </Card>
                  <Card icon={Briefcase} title="Interview Question" accent="var(--syn-keyword)">
                    <RevealQuestion
                      question={content.interviewQuestion.question}
                      hint={content.interviewQuestion.hint}
                      accent="var(--syn-keyword)"
                    />
                  </Card>
                </div>

                {/* Related topics */}
                <Card icon={Link2} title="Related Topics" accent="var(--syn-string)">
                  <div className="flex flex-wrap gap-2">
                    {content.relatedTopics.map((topic) => (
                      <button
                        key={topic}
                        onClick={() => onExploreTopic(topic)}
                        className="rounded-full glass px-3 py-1.5 text-[11.5px] font-mono text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-[var(--border-strong)] transition-colors cursor-pointer"
                      >
                        {topic}
                      </button>
                    ))}
                  </div>
                </Card>
              </>
            )}
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

