"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import dynamic from "next/dynamic";
import { GripVertical, Bot, X } from "lucide-react";
import Navbar from "@/components/Navbar";
import Toolbar from "@/components/compiler/Toolbar";
import BottomPanel, { BottomTab } from "@/components/compiler/BottomPanel";
import AssignmentProblemPanel from "@/components/compiler/AssignmentProblemPanel";
import { EditorSettings } from "@/components/compiler/CodeEditor";
import { LANGUAGES, LanguageId, LanguageConfig, getLanguage } from "@/lib/languages";
import { getStoredTheme, Theme } from "@/lib/theme";
import {
  executeCode,
  explainError,
  sendChatMessage,
  analyzeCode,
  CodeAnalysis,
  generateTrace,
  ExecutionTrace,
  learnCode,
  LearningContent,
  fetchStudentAssignments,
  submitStudentAssignment,
  AssignmentItem,
} from "@/lib/api";
import { changedLineNumbers } from "@/lib/diff";
import {
  downloadTextFile,
  formatExplanationMarkdown,
  formatExecutionReport,
  exportTextAsPdf,
  printPlainText,
  buildShareUrl,
  decodeShareState,
} from "@/lib/exportUtils";
import {
  ChatMessage,
  ErrorChatMessage,
  ExplanationChatMessage,
  buildApiHistory,
  makeId,
} from "@/lib/chat";
import { useAuth } from "@/context/AuthContext";

function EditorSkeleton() {
  return (
    <div className="flex h-full w-full flex-col gap-2.5 bg-[#0d1117] p-5 font-mono select-none">
      <div className="flex items-center gap-2 text-xs text-emerald-400 font-mono mb-2">
        <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
        <span>Loading Editor Engine...</span>
      </div>
      {Array.from({ length: 14 }).map((_, i) => (
        <div
          key={i}
          className="h-3 rounded animate-pulse bg-white/5"
          style={{
            width: `${[75, 45, 88, 35, 65, 50, 80, 40, 60, 45, 70, 30, 85, 55][i % 14]}%`,
            animationDelay: `${i * 40}ms`,
          }}
        />
      ))}
    </div>
  );
}

function ModalSkeleton() {
  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 sm:p-8">
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-2xl h-72 glass-strong rounded-xl shadow-2xl animate-pulse" />
    </div>
  );
}

const CodeEditor = dynamic(() => import("@/components/compiler/CodeEditor"), {
  ssr: false,
  loading: EditorSkeleton,
});
const DiffModal = dynamic(() => import("@/components/compiler/DiffModal"), {
  ssr: false,
  loading: ModalSkeleton,
});
const AnalyzerModal = dynamic(() => import("@/components/compiler/AnalyzerModal"), {
  ssr: false,
  loading: ModalSkeleton,
});
const VisualDebugger = dynamic(() => import("@/components/compiler/VisualDebugger"), {
  ssr: false,
  loading: ModalSkeleton,
});
const LearningModeModal = dynamic(() => import("@/components/compiler/LearningModeModal"), {
  ssr: false,
  loading: ModalSkeleton,
});
const ConverterModal = dynamic(() => import("@/components/compiler/ConverterModal"), {
  ssr: false,
  loading: ModalSkeleton,
});
const ShortcutsModal = dynamic(() => import("@/components/compiler/ShortcutsModal"), {
  ssr: false,
});
const AIPanel = dynamic(() => import("@/components/compiler/AIPanel"), {
  ssr: false,
});
const StudentAssignmentsModal = dynamic(
  () => import("@/components/compiler/StudentAssignmentsModal"),
  { ssr: false }
);

const STORAGE_KEY = "codementor:compiler:v1";
const CHAT_STORAGE_KEY = "codementor:chat:v1";
const NAVBAR_H = 64;

interface PersistedState {
  language: string;
  code: Record<string, string>;
  settings: EditorSettings;
  autoSave: boolean;
}

interface FixState {
  applied: boolean;
  preSnapshot: string | null;
}

function defaultCodeMap(): Record<string, string> {
  const map: Record<string, string> = {};
  LANGUAGES.forEach((l) => (map[l.id] = l.template));
  return map;
}

// Execution engine reports time in seconds (as a string, e.g. "0.012") and memory in
// kilobytes. The UI shows friendlier units.
function formatTime(time: string | null): string {
  if (!time) return "—";
  const seconds = parseFloat(time);
  if (Number.isNaN(seconds)) return "—";
  return `${Math.round(seconds * 1000)} ms`;
}

function formatMemory(memoryKb: number | null): string {
  if (!memoryKb && memoryKb !== 0) return "—";
  return `${(memoryKb / 1024).toFixed(2)} MB`;
}

export default function CompilerPage() {
  const [language, setLanguage] = useState<string>("c");
  const [codeMap, setCodeMap] = useState<Record<string, string>>(
    defaultCodeMap()
  );
  const [settings, setSettings] = useState<EditorSettings>({
    theme: "vs-dark",
    fontSize: 14,
    wordWrap: true,
    minimap: true,
    lineNumbers: true,
    bracketMatching: true,
  });
  const [autoSave, setAutoSave] = useState(true);
  const [saveNote, setSaveNote] = useState("");

  const [aiPanelOpen, setAiPanelOpen] = useState(true);
  const [aiOverlayOpen, setAiOverlayOpen] = useState(false);
  const [showAiAssistPrompt, setShowAiAssistPrompt] = useState(false);

  // Permanent AI chat
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput] = useState("");
  const [chatBusy, setChatBusy] = useState(false);

  // "Apply AI Fix" bookkeeping
  const [fixState, setFixState] = useState<Record<string, FixState>>({});
  const [highlightLines, setHighlightLines] = useState<number[]>([]);
  const [diffTarget, setDiffTarget] = useState<ExplanationChatMessage | null>(null);

  const [analyzerOpen, setAnalyzerOpen] = useState(false);
  const [analyzerStatus, setAnalyzerStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [analysis, setAnalysis] = useState<CodeAnalysis | null>(null);
  const [analyzerError, setAnalyzerError] = useState<string | null>(null);

  const [debuggerOpen, setDebuggerOpen] = useState(false);
  const [debugStatus, setDebugStatus] = useState<"loading" | "success" | "error">("loading");
  const [trace, setTrace] = useState<ExecutionTrace | null>(null);
  const [debugError, setDebugError] = useState<string | null>(null);
  const [debugStepIndex, setDebugStepIndex] = useState(0);
  const [debugPlaying, setDebugPlaying] = useState(false);
  const [debugLanguage, setDebugLanguage] = useState<string | null>(null);

  const [learningOpen, setLearningOpen] = useState(false);
  const [learningStatus, setLearningStatus] = useState<"loading" | "success" | "error">(
    "loading"
  );
  const [learningContent, setLearningContent] = useState<LearningContent | null>(null);
  const [learningError, setLearningError] = useState<string | null>(null);

  const [converterOpen, setConverterOpen] = useState(false);

  const [bottomTab, setBottomTab] = useState<BottomTab>("output");
  const [bottomHeight, setBottomHeight] = useState(240);
  const [aiPanelWidth, setAiPanelWidth] = useState(360);
  const [input, setInput] = useState("");
  const [output, setOutput] = useState("");
  const [errors, setErrors] = useState("");
  const [executionTime, setExecutionTime] = useState("—");
  const [memoryUsage, setMemoryUsage] = useState("—");
  const [status, setStatus] = useState<"idle" | "running" | "success" | "error">(
    "idle"
  );
  const [isRunning, setIsRunning] = useState(false);
  const [isCompiling, setIsCompiling] = useState(false);

  // Interactive terminal lines — built incrementally so it feels like a real shell
  const [terminalLines, setTerminalLines] = useState<{ type: "output" | "input" | "error"; content: string }[]>([]);
  const [exportNote, setExportNote] = useState("");
  const [fullscreen, setFullscreen] = useState(false);
  const [shortcutsOpen, setShortcutsOpen] = useState(false);
  const [aiFloating, setAiFloating] = useState(false);

  // Test Cases State
  const [testCases, setTestCases] = useState<any[]>([]);
  const activeExecutionController = useRef<AbortController | null>(null);

  // Student Assignment State
  const { user, token } = useAuth();
  const [studentAssignments, setStudentAssignments] = useState<AssignmentItem[]>([]);
  const [isRefreshingAssignments, setIsRefreshingAssignments] = useState(false);
  const [activeAssignment, setActiveAssignment] = useState<AssignmentItem | null>(null);
  const [showAssignmentModal, setShowAssignmentModal] = useState(false);
  const [isSubmittingAssignment, setIsSubmittingAssignment] = useState(false);
  const [isProblemSpecsOpen, setIsProblemSpecsOpen] = useState(true);
  const [submissionResultModal, setSubmissionResultModal] = useState<{
    success: boolean;
    message: string;
    score?: number;
  } | null>(null);

  const showExportNote = (message: string) => {
    setExportNote(message);
    setTimeout(() => setExportNote(""), 2000);
  };

  const containerRef = useRef<HTMLDivElement>(null);
  const resizing = useRef(false);
  const aiResizing = useRef(false);

  const refreshAssignments = useCallback(async () => {
    setIsRefreshingAssignments(true);
    try {
      const res = await fetchStudentAssignments(token);
      if (res.success && res.data) {
        setStudentAssignments(res.data);
      }
    } finally {
      setIsRefreshingAssignments(false);
    }
  }, [token]);

  // Fetch course assignments on mount and whenever authentication state changes
  useEffect(() => {
    refreshAssignments();
  }, [user, token, refreshAssignments]);

  // Re-fetch latest assignments whenever student opens the selector modal
  useEffect(() => {
    if (showAssignmentModal) {
      refreshAssignments();
    }
  }, [showAssignmentModal, refreshAssignments]);

  const handleSelectAssignment = useCallback((asg: AssignmentItem | null) => {
    setActiveAssignment(asg);
    if (asg) {
      setIsProblemSpecsOpen(true);
      setAiPanelOpen(false);

      if (asg.testCases && asg.testCases.length > 0) {
        setTestCases(
          asg.testCases.map((tc, idx) => ({
            id: tc.id || `tc_${idx + 1}`,
            input: tc.input || "",
            expectedOutput: tc.expectedOutput || "",
            isHidden: !!tc.isHidden,
            explanation: tc.explanation || "",
            status: "idle",
            actualOutput: "",
            error: "",
            executionTime: "—",
          }))
        );
      } else {
        setTestCases([]);
      }

      const targetLang = asg.preferredLanguage
        ? asg.preferredLanguage.toLowerCase()
        : asg.allowedLanguages && asg.allowedLanguages.length > 0
        ? asg.allowedLanguages[0].toLowerCase()
        : null;

      if (targetLang && targetLang !== language) {
        setLanguage(targetLang);
      }
      setBottomTab("testcase");
    } else {
      setTestCases([]);
      setBottomTab("terminal");
    }
  }, [language]);

  const handleAssignmentSubmit = useCallback(async () => {
    if (!activeAssignment) return;
    setIsSubmittingAssignment(true);

    const code = codeMap[language] || "";

    // Strict Assignment Language & Code Validation
    const requiredLangs = (
      activeAssignment.preferredLanguage
        ? [activeAssignment.preferredLanguage]
        : activeAssignment.allowedLanguages && activeAssignment.allowedLanguages.length > 0
        ? activeAssignment.allowedLanguages
        : activeAssignment.languageMode === "RESTRICTED" && activeAssignment.allowedLanguages
        ? activeAssignment.allowedLanguages
        : []
    ).map((l) => l.toLowerCase());

    if (requiredLangs.length > 0) {
      const reqReadable = requiredLangs.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(" or ");

      // Check 1: Compiler dropdown language selection
      if (!requiredLangs.includes(language.toLowerCase())) {
        setSubmissionResultModal({
          success: false,
          message: `Submission Rejected: This assignment strictly requires ${reqReadable}. Your current compiler language is ${language.toUpperCase()}. Please switch to ${reqReadable} and write your solution.`,
        });
        setIsSubmittingAssignment(false);
        return;
      }

      // Check 2: Actual source code language detection
      const detectedCode = detectLanguageFromCode(code);
      if (detectedCode && !requiredLangs.includes(detectedCode.toLowerCase())) {
        const detReadable = detectedCode === "cpp" ? "C++" : detectedCode.toUpperCase();
        setSubmissionResultModal({
          success: false,
          message: `Submission Rejected: Detected code language appears to be ${detReadable}, but this assignment strictly requires ${reqReadable}. Please write your solution in ${reqReadable}.`,
        });
        setIsSubmittingAssignment(false);
        return;
      }
    }

    const casesToEvaluate =
      testCases.length > 0 ? testCases : activeAssignment.testCases || [];

    let passedCount = 0;
    const totalCount = casesToEvaluate.length;
    const updated = [...casesToEvaluate];

    setBottomTab("result");

    for (let i = 0; i < totalCount; i++) {
      const tc = casesToEvaluate[i];
      const execRes = await executeCode({
        language,
        sourceCode: code,
        stdin: tc.input || "",
      });

      if (!execRes.success) {
        updated[i] = {
          ...tc,
          status: "error",
          actualOutput: "",
          error: execRes.message || "Execution error",
          executionTime: "0 ms",
        };
      } else {
        const isOk = !execRes.compileError && !execRes.runtimeError;
        const actual = (execRes.output || "").trim();
        const expected = (tc.expectedOutput || "").trim();
        const passed = isOk && actual === expected;

        if (passed) passedCount++;

        updated[i] = {
          ...tc,
          status: passed ? "pass" : isOk ? "fail" : "error",
          actualOutput: execRes.output || "",
          error: execRes.compileError || execRes.runtimeError || "",
          executionTime: formatTime(execRes.time),
        };
      }
    }

    if (totalCount > 0) {
      setTestCases(updated);
    }

    const maxPoints = activeAssignment.points || 100;
    const computedScore =
      totalCount > 0 ? Math.round((passedCount / totalCount) * maxPoints) : 100;
    const subStatus =
      totalCount === 0 || passedCount === totalCount
        ? "Success"
        : passedCount > 0
        ? "Partial"
        : "Wrong Answer";

    const res = await submitStudentAssignment(activeAssignment.id, {
      language,
      sourceCode: code,
      status: subStatus,
      score: computedScore,
      executionTime: "0.05s",
      compilerErrors: "",
      aiExplanation: "",
    });

    if (res.success) {
      setSubmissionResultModal({
        success: true,
        message: `Assignment "${activeAssignment.title}" submitted!\n${
          totalCount > 0
            ? `${passedCount} of ${totalCount} test cases passed. Score: ${computedScore}/${maxPoints}`
            : `Score: ${computedScore}/${maxPoints}`
        }`,
        score: res.data?.score ?? computedScore,
      });
      fetchStudentAssignments().then((r) => r.success && r.data && setStudentAssignments(r.data));
    } else {
      setSubmissionResultModal({
        success: false,
        message: res.message || "Assignment submission rejected.",
      });
    }
    setIsSubmittingAssignment(false);
  }, [activeAssignment, language, codeMap, testCases]);

  // Load persisted editor state on mount (one-time hydration from
  // localStorage, which only exists client-side, so an effect is correct here)
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    const currentTheme = getStoredTheme();
    setSettings((s) => ({ ...s, theme: currentTheme === "light" ? "light" : "vs-dark" }));

    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed: PersistedState = JSON.parse(raw);
        setLanguage(parsed.language ?? "c");
        setCodeMap({ ...defaultCodeMap(), ...parsed.code });
        setSettings((s) => ({
          ...s,
          ...parsed.settings,
          theme: currentTheme === "light" ? "light" : "vs-dark",
        }));
        setAutoSave(parsed.autoSave ?? true);
      }
    } catch {
      // ignore corrupted storage
    }

    const handleThemeChange = (e: Event) => {
      const customEvent = e as CustomEvent<{ theme: Theme }>;
      const t = customEvent.detail?.theme || getStoredTheme();
      setSettings((s) => ({ ...s, theme: t === "light" ? "light" : "vs-dark" }));
    };

    window.addEventListener("themechange", handleThemeChange);
    return () => window.removeEventListener("themechange", handleThemeChange);
  }, []);

  // Load chat history for this session (sessionStorage, so it clears when
  // the tab closes — matching "chat history during the session").
  useEffect(() => {
    try {
      const raw = window.sessionStorage.getItem(CHAT_STORAGE_KEY);
      if (raw) {
        const parsed: ChatMessage[] = JSON.parse(raw);
        setMessages(parsed.filter((m) => m.kind !== "loading"));
      }
    } catch {
      // ignore corrupted storage
    }
  }, []);

  // A shared link (?share=...) takes priority over localStorage — this is
  // what makes "Share Link" actually work for whoever opens it.
  useEffect(() => {
    try {
      const params = new URLSearchParams(window.location.search);
      const shared = params.get("share");
      if (shared) {
        const decoded = decodeShareState(shared);
        if (decoded) {
          setLanguage(decoded.language);
          setCodeMap((m) => ({ ...m, [decoded.language]: decoded.sourceCode }));
          showExportNote("Loaded shared code");
        }
      }
    } catch {
      // ignore malformed share links
    }
  }, []);
  /* eslint-enable react-hooks/set-state-in-effect */

  // Persist chat history as it grows.
  useEffect(() => {
    try {
      window.sessionStorage.setItem(
        CHAT_STORAGE_KEY,
        JSON.stringify(messages.filter((m) => m.kind !== "loading"))
      );
    } catch {
      // ignore quota errors
    }
  }, [messages]);

  // Auto save (editor code)
  useEffect(() => {
    if (!autoSave) return;
    const handle = setTimeout(() => {
      try {
        const payload: PersistedState = { language, code: codeMap, settings, autoSave };
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(payload));
        setSaveNote("Saved");
        const clear = setTimeout(() => setSaveNote(""), 1500);
        return () => clearTimeout(clear);
      } catch {
        // ignore quota errors
      }
    }, 500);
    return () => clearTimeout(handle);
  }, [language, codeMap, settings, autoSave]);

  // Fullscreen listener
  useEffect(() => {
    const onFsChange = () =>
      setFullscreen(document.fullscreenElement === containerRef.current);
    document.addEventListener("fullscreenchange", onFsChange);
    return () => document.removeEventListener("fullscreenchange", onFsChange);
  }, []);

  // Layout panel resizers (bottom panel height & AI assistant width)
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      if (resizing.current) {
        const nextHeight = rect.bottom - e.clientY;
        setBottomHeight(Math.min(Math.max(nextHeight, 120), rect.height * 0.75));
      }
      if (aiResizing.current) {
        const nextWidth = rect.right - e.clientX;
        setAiPanelWidth(Math.min(Math.max(nextWidth, 260), Math.floor(rect.width * 0.55)));
      }
    };
    const onUp = () => {
      resizing.current = false;
      aiResizing.current = false;
    };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };
  }, []);

  // Visual Debugger "Continue" auto-play
  useEffect(() => {
    if (!debugPlaying || !trace) return;
    const id = setInterval(() => {
      setDebugStepIndex((i) => {
        if (i >= trace.steps.length - 1) {
          setDebugPlaying(false);
          return i;
        }
        return i + 1;
      });
    }, 800);
    return () => clearInterval(id);
  }, [debugPlaying, trace]);

  const currentLang = getLanguage(language);
  const code = codeMap[language] ?? currentLang.template;

  const openAiPanel = () => {
    setAiPanelOpen(true);
    if (typeof window !== "undefined" && window.innerWidth < 768) {
      setAiOverlayOpen(true);
    }
  };

  // Detect language from code content using comprehensive scoring heuristics
  const detectLanguageFromCode = useCallback((code: string): LanguageId | null => {
    const c = code.trim();
    if (!c || c.length < 6) return null;

    const hasInclude = /#\s*include\b/i.test(c);
    const hasDefine = /#\s*define\b/i.test(c);
    const hasPreprocessor = hasInclude || hasDefine;

    let javaScore = 0;
    let pythonScore = 0;
    let cppScore = 0;
    let cScore = 0;

    // --- Decisive C++ Indicators ---
    const hasCppHeader = /#\s*include\s*[<"]\s*(iostream|vector|string|algorithm|map|set|queue|stack|deque|numeric|utility|cmath|bits\/stdc\+\+(\.h)?|fstream|sstream|iomanip|list|tuple|unordered_map|unordered_set|memory|functional|chrono)\s*[>"]/i.test(c);
    const hasCppKeywords = /\b(using\s+namespace\s+std|std\s*::|cout\s*<<|cin\s*>>|cerr\s*<<|nullptr|template\s*<)\b/.test(c);

    if (hasCppHeader) cppScore += 25;
    if (hasCppKeywords) cppScore += 20;
    if (/\bclass\s+\w+\s*\{[\s\S]*?(public|private|protected)\s*:/i.test(c)) cppScore += 15;
    if (/\b(vector|map|set|unordered_map|pair|tuple)\s*<[\w\s,<>]+>\s*\w+/.test(c)) cppScore += 10;
    if (/\b(new\s+\w+(\[|\()|delete\s+(\[\]|\w+))/.test(c) && !/java/i.test(c)) cppScore += 8;

    // --- C Indicators (Only if NO exclusive C++ header / keywords) ---
    const hasCHeader = /#\s*include\s*[<"]\s*(stdio|stdlib|string|math|ctype|stdbool|limits|time|conio|assert|float|stddef|stdint)\.h\s*[>"]/i.test(c);
    if (hasCHeader && !hasCppHeader && !hasCppKeywords) cScore += 25;
    if (hasInclude && !hasCppHeader && !hasCppKeywords && cppScore === 0) cScore += 10;
    if (/\b(printf|scanf)\s*\(/i.test(c) && !hasCppKeywords && !/\bSystem\./.test(c)) cScore += 8;
    if (/\b(int|void)\s+main\s*\([^)]*\)/.test(c) && !hasCppHeader && !hasCppKeywords) cScore += 6;
    if (/\b(malloc|calloc|realloc|free)\s*\(/i.test(c) && !hasCppKeywords) cScore += 6;
    if (/\b(getch|clrscr)\s*\(\s*\)/i.test(c)) cScore += 6;
    if (/\b(struct|typedef\s+struct)\s+\w+/.test(c) && !hasCppKeywords) cScore += 5;

    // --- Java Heuristics (Strictly disqualified if #include or #define present) ---
    if (!hasPreprocessor) {
      if (/\bimport\s+(java|javax)\./i.test(c)) javaScore += 25;
      if (/\bpackage\s+[\w.]+;/i.test(c)) javaScore += 15;
      if (/\bpublic\s+(final\s+|abstract\s+)?class\s+\w+/i.test(c)) javaScore += 20;
      if (/\b(public\s+)?static\s+void\s+main\s*\(\s*String\s*(\[\s*\]\s*\w+|\w+\s*\[\s*\])/.test(c)) javaScore += 25;
      if (/\bSystem\.(out|err)\.(println|print|printf)\s*\(/i.test(c)) javaScore += 20;
      if (/\bnew\s+Scanner\s*\(\s*System\.in\s*\)/i.test(c)) javaScore += 20;
      if (/\b(Scanner|BufferedReader|StringBuilder|ArrayList|HashMap|Integer|Double|Boolean)\b/.test(c) && /;\s*$/m.test(c)) javaScore += 8;
      if (/\bclass\s+\w+\s*\{/i.test(c) && /;\s*$/m.test(c)) javaScore += 10;
      if (/\b(public|private|protected)\s+(static\s+)?(int|void|String|boolean|double|float|long|char)\s+\w+\s*\(/i.test(c)) javaScore += 10;
    }

    // --- Python Heuristics (Strictly disqualified if #include or #define present) ---
    if (!hasPreprocessor) {
      if (/^\s*def\s+\w+\s*\([^)]*\)\s*:/m.test(c)) pythonScore += 20;
      if (/^\s*class\s+\w+(\([^)]*\))?\s*:/m.test(c)) pythonScore += 15;
      if (/\bif\s+__name__\s*==\s*['"]__main__['"]\s*:/m.test(c)) pythonScore += 25;
      if (/^\s*(from\s+[\w.]+\s+import|import\s+(sys|os|math|random|json|re|datetime|collections|typing|numpy|pandas))\b/m.test(c)) pythonScore += 15;
      if (/^\s*elif\s+.*:/m.test(c) || /^\s*else\s*:/m.test(c)) pythonScore += 8;
      if (/\bfor\s+\w+\s+in\s+[^:]+:/m.test(c)) pythonScore += 12;
      if (/\bwhile\s+[^:]+:/m.test(c)) pythonScore += 10;
      if (/\bprint\s*\(/.test(c) && !/;\s*$/m.test(c) && !/\bSystem\./.test(c)) pythonScore += 10;
      if (/\binput\s*\(/.test(c) && !/\bScanner\b/.test(c)) pythonScore += 10;
      if (/\b(True|False|None)\b/.test(c) && !/;\s*$/m.test(c)) pythonScore += 6;
      if (/^\s*#\s+[^\n]*/m.test(c) && !hasInclude) pythonScore += 4;
      if (!/[{};]/.test(c) && (pythonScore > 0 || /:\s*$/.test(c))) pythonScore += 6;
    }

    const scores = [
      { lang: "c" as LanguageId, score: cScore },
      { lang: "cpp" as LanguageId, score: cppScore },
      { lang: "java" as LanguageId, score: javaScore },
      { lang: "python" as LanguageId, score: pythonScore },
    ];

    scores.sort((a, b) => b.score - a.score);

    if (scores[0].score >= 4 && scores[0].score > scores[1].score) {
      return scores[0].lang;
    }

    return null;
  }, []);

  const handleCodeChange = useCallback(
    (value: string) => {
      // Clear AI fix highlight lines when user makes manual edit
      setHighlightLines([]);

      // Auto-detect language according to the written code
      const detected = detectLanguageFromCode(value);
      
      const requiredLangs = (
        activeAssignment?.preferredLanguage
          ? [activeAssignment.preferredLanguage]
          : activeAssignment?.allowedLanguages && activeAssignment.allowedLanguages.length > 0
          ? activeAssignment.allowedLanguages
          : activeAssignment?.languageMode === "RESTRICTED" && activeAssignment.allowedLanguages
          ? activeAssignment.allowedLanguages
          : []
      ).map((l) => l.toLowerCase());

      const isRestricted = requiredLangs.length > 0;
      const isAllowed = !isRestricted || (detected ? requiredLangs.includes(detected.toLowerCase()) : true);

      if (detected && detected !== language) {
        if (isAllowed) {
          setLanguage(detected);
          setCodeMap((m) => ({ ...m, [detected]: value }));
          const matched = LANGUAGES.find((l) => l.id === detected);
          showExportNote(`Language detected: ${matched?.label ?? detected.toUpperCase()}`);
        } else {
          // Keep in current language slot and warn user
          setCodeMap((m) => ({ ...m, [language]: value }));
          const detReadable = detected === "cpp" ? "C++" : detected.toUpperCase();
          const reqReadable = requiredLangs.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(" or ");
          showExportNote(`Notice: Code appears to be ${detReadable}, but this assignment requires ${reqReadable}`);
        }
      } else {
        setCodeMap((m) => ({ ...m, [language]: value }));
      }
    },
    [language, activeAssignment, detectLanguageFromCode]
  );

  const handleLanguageChange = (id: LanguageConfig["id"]) => {
    setLanguage(id);
    setHighlightLines([]);
  };

  // ---- Permanent AI chat -------------------------------------------------

  const sendChat = useCallback(
    async (text: string) => {
      const trimmed = text.trim();
      if (!trimmed || chatBusy) return;

      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        kind: "text",
        timestamp: Date.now(),
        content: trimmed,
      };
      const loadingId = makeId();
      const loadingMsg: ChatMessage = {
        id: loadingId,
        role: "assistant",
        kind: "loading",
        timestamp: Date.now(),
        label: "Thinking…",
      };

      const apiMessages = [...buildApiHistory(messages), { role: "user" as const, content: trimmed }];

      setMessages((m) => [...m, userMsg, loadingMsg]);
      setChatInput("");
      setChatBusy(true);
      openAiPanel();

      const result = await sendChatMessage({ language, sourceCode: code, messages: apiMessages });

      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? result.success
              ? ({
                id: loadingId,
                role: "assistant",
                kind: "text",
                timestamp: Date.now(),
                content: result.reply,
              } as ChatMessage)
              : ({
                id: loadingId,
                role: "assistant",
                kind: "error",
                timestamp: Date.now(),
                message: result.message,
                retry: { type: "chat", text: trimmed },
              } as ChatMessage)
            : msg
        )
      );
      setChatBusy(false);
    },
    [chatBusy, language, code, messages]
  );

  const triggerAIExplain = useCallback(
    async (compilerError: string, forLanguage: string, forSourceCode: string) => {
      const userMsg: ChatMessage = {
        id: makeId(),
        role: "user",
        kind: "text",
        timestamp: Date.now(),
        content: `Compilation failed. Please explain this error:\n\n\`\`\`\n${compilerError}\n\`\`\``,
      };
      const loadingId = makeId();
      const loadingMsg: ChatMessage = {
        id: loadingId,
        role: "assistant",
        kind: "loading",
        timestamp: Date.now(),
        label: "Analyzing your error…",
      };

      setMessages((m) => [...m, userMsg, loadingMsg]);
      setChatBusy(true);
      openAiPanel();

      const result = await explainError({
        language: forLanguage,
        error: compilerError,
        sourceCode: forSourceCode,
      });

      setMessages((m) =>
        m.map((msg) =>
          msg.id === loadingId
            ? result.success
              ? ({
                id: loadingId,
                role: "assistant",
                kind: "explanation",
                timestamp: Date.now(),
                explanation: result.explanation,
                sourceLanguage: forLanguage,
              } as ChatMessage)
              : ({
                id: loadingId,
                role: "assistant",
                kind: "error",
                timestamp: Date.now(),
                message: result.message,
                retry: {
                  type: "explain",
                  compilerError,
                  language: forLanguage,
                  sourceCode: forSourceCode,
                },
              } as ChatMessage)
            : msg
        )
      );
      setChatBusy(false);
    },
    []
  );

  const handleRetry = (msg: ErrorChatMessage) => {
    setChatBusy(true);
    setMessages((m) =>
      m.map((x) =>
        x.id === msg.id
          ? ({
            id: msg.id,
            role: "assistant",
            kind: "loading",
            timestamp: Date.now(),
            label: msg.retry.type === "chat" ? "Thinking…" : "Analyzing your error…",
          } as ChatMessage)
          : x
      )
    );

    (async () => {
      if (msg.retry.type === "chat") {
        const apiMessages = buildApiHistory(messages.filter((x) => x.id !== msg.id));
        const result = await sendChatMessage({ language, sourceCode: code, messages: apiMessages });
        setMessages((m) =>
          m.map((x) =>
            x.id === msg.id
              ? result.success
                ? ({ id: msg.id, role: "assistant", kind: "text", timestamp: Date.now(), content: result.reply } as ChatMessage)
                : ({ id: msg.id, role: "assistant", kind: "error", timestamp: Date.now(), message: result.message, retry: msg.retry } as ChatMessage)
              : x
          )
        );
      } else {
        const { compilerError, language: retryLang, sourceCode } = msg.retry;
        const result = await explainError({ language: retryLang, error: compilerError, sourceCode });
        setMessages((m) =>
          m.map((x) =>
            x.id === msg.id
              ? result.success
                ? ({
                  id: msg.id,
                  role: "assistant",
                  kind: "explanation",
                  timestamp: Date.now(),
                  explanation: result.explanation,
                  sourceLanguage: retryLang,
                } as ChatMessage)
                : ({ id: msg.id, role: "assistant", kind: "error", timestamp: Date.now(), message: result.message, retry: msg.retry } as ChatMessage)
              : x
          )
        );
      }
      setChatBusy(false);
    })();
  };

  const getFixState = (id: string) => {
    const s = fixState[id];
    return { applied: s?.applied ?? false, canUndo: !!(s?.applied && s?.preSnapshot !== null) };
  };

  const handleApplyFix = (msg: ExplanationChatMessage) => {
    const targetLang = msg.sourceLanguage;
    const before = codeMap[targetLang] ?? getLanguage(targetLang).template;
    if (targetLang !== language) setLanguage(targetLang);
    setCodeMap((m) => ({ ...m, [targetLang]: msg.explanation.correctCode }));
    setFixState((fs) => ({ ...fs, [msg.id]: { applied: true, preSnapshot: before } }));
    setHighlightLines(changedLineNumbers(before, msg.explanation.correctCode));
  };

  const handleUndoFix = (msg: ExplanationChatMessage) => {
    const s = fixState[msg.id];
    if (!s?.applied || s.preSnapshot === null) return;
    const targetLang = msg.sourceLanguage;
    if (targetLang !== language) setLanguage(targetLang);
    setCodeMap((m) => ({ ...m, [targetLang]: s.preSnapshot as string }));
    setFixState((fs) => ({ ...fs, [msg.id]: { applied: false, preSnapshot: null } }));
    setHighlightLines([]);
  };

  const handleCompareChanges = (msg: ExplanationChatMessage) => {
    setDiffTarget(msg);
  };

  const handleAnalyze = useCallback(async () => {
    setAnalyzerOpen(true);
    setAnalyzerStatus("loading");
    setAnalyzerError(null);

    const result = await analyzeCode({ language, sourceCode: code });

    if (result.success) {
      setAnalysis(result.analysis);
      setAnalyzerStatus("success");
    } else {
      setAnalyzerError(result.message);
      setAnalyzerStatus("error");
    }
  }, [language, code]);

  const handleDebug = useCallback(async () => {
    setDebuggerOpen(true);
    setDebugStatus("loading");
    setDebugError(null);
    setDebugStepIndex(0);
    setDebugPlaying(false);
    setDebugLanguage(language);

    const result = await generateTrace({ language, sourceCode: code, stdin: input });

    if (result.success) {
      setTrace(result.trace);
      setDebugStatus("success");
    } else {
      setDebugError(result.message);
      setDebugStatus("error");
    }
  }, [language, code, input]);

  const handleDebugStepInto = () => {
    setDebugStepIndex((i) => Math.min(i + 1, (trace?.steps.length ?? 1) - 1));
  };

  const handleDebugStepOver = () => {
    setDebugStepIndex((i) => {
      const steps = trace?.steps ?? [];
      if (steps.length === 0) return i;
      const currentDepth = steps[i]?.callStack.length ?? 0;
      for (let j = i + 1; j < steps.length; j++) {
        if (steps[j].callStack.length <= currentDepth) return j;
      }
      return steps.length - 1;
    });
  };

  const handleDebugReset = () => {
    setDebugStepIndex(0);
    setDebugPlaying(false);
  };

  const handleDebugTogglePlay = () => {
    setDebugPlaying((p) => !p);
  };

  const handleDebugJumpToStep = (index: number) => {
    setDebugStepIndex(index);
    setDebugPlaying(false);
  };

  const handleExplain = useCallback(async () => {
    setLearningOpen(true);
    setLearningStatus("loading");
    setLearningError(null);

    const result = await learnCode({ language, sourceCode: code });

    if (result.success) {
      setLearningContent(result.content);
      setLearningStatus("success");
    } else {
      setLearningError(result.message);
      setLearningStatus("error");
    }
  }, [language, code]);

  const handleExploreTopic = (topic: string) => {
    setLearningOpen(false);
    void sendChat(`Explain the topic "${topic}" and how it relates to my current code.`);
  };

  const handleUseConvertedInEditor = (languageId: string, convertedCode: string) => {
    setCodeMap((m) => ({ ...m, [languageId]: convertedCode }));
    setLanguage(languageId);
    setHighlightLines([]);
    setConverterOpen(false);
  };

  // ---- Run / Compile / Test Cases / Termination ---------------------------

  const handleStopExecution = useCallback(() => {
    if (activeExecutionController.current) {
      activeExecutionController.current.abort();
      activeExecutionController.current = null;
    }
    setIsRunning(false);
    setIsCompiling(false);
    setStatus("idle");
    setErrors("Execution terminated by user.");
  }, []);

  const handleRunTestCases = useCallback(
    async (casesToRun?: any[]) => {
      const targetCases = casesToRun || testCases;
      if (!targetCases || targetCases.length === 0) return;

      const revealed = targetCases.filter((tc) => !tc.isHidden);
      if (revealed.length === 0) return;

      const requiredLangs = (
        activeAssignment?.preferredLanguage
          ? [activeAssignment.preferredLanguage]
          : activeAssignment?.allowedLanguages && activeAssignment.allowedLanguages.length > 0
          ? activeAssignment.allowedLanguages
          : activeAssignment?.languageMode === "RESTRICTED" && activeAssignment.allowedLanguages
          ? activeAssignment.allowedLanguages
          : []
      ).map((l) => l.toLowerCase());

      if (requiredLangs.length > 0) {
        const reqReadable = requiredLangs.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(" or ");
        if (!requiredLangs.includes(language.toLowerCase())) {
          showExportNote(`Notice: This assignment requires ${reqReadable}. Current: ${language.toUpperCase()}`);
        }
      }

      setBottomTab("result");
      setIsRunning(true);
      setStatus("running");

      const code = codeMap[language] || "";
      const updated = [...targetCases];

      for (let i = 0; i < updated.length; i++) {
        if (updated[i].isHidden) continue;

        updated[i] = { ...updated[i], status: "running" };
        setTestCases([...updated]);

        const result = await executeCode({
          language,
          sourceCode: code,
          stdin: updated[i].input,
        });

        if (!result.success) {
          updated[i] = {
            ...updated[i],
            status: "error",
            actualOutput: "",
            error: result.message || "Execution error",
            executionTime: "0 ms",
          };
        } else {
          const actual = (result.output || "").trim();
          const expected = (updated[i].expectedOutput || "").trim();
          const passed = !result.compileError && actual === expected;
          updated[i] = {
            ...updated[i],
            status: passed ? "pass" : "fail",
            actualOutput: result.output || "",
            error: result.compileError || result.runtimeError || "",
            executionTime: formatTime(result.time),
          };
        }
        setTestCases([...updated]);
      }
      setIsRunning(false);
      setStatus("success");
    },
    [testCases, language, codeMap, activeAssignment]
  );

  // Track active execution session inputs so previous run data is never saved or leaked across runs
  const [sessionInput, setSessionInput] = useState("");

  const handleRun = useCallback(async () => {
    if (!currentLang.judge0Supported) {
      setBottomTab("errors");
      setStatus("error");
      setErrors(
        `${currentLang.label} execution isn't connected to the backend yet.\nSupported right now: C, C++, Java, Python.`
      );
      return;
    }

    // Reset session input cleanly on new run
    setSessionInput("");
    setIsRunning(true);
    setStatus("running");
    setBottomTab("output");
    setOutput("");
    setErrors("");
    // Clear terminal for fresh run
    setTerminalLines([]);

    // Execute with initial preset input (if any)
    const initialStdin = input || "";

    // Double-check if the source code unambiguously matches a specific language (e.g. #include<stdio.h> -> C)
    const detectedLang = detectLanguageFromCode(code);
    const isRestricted =
      activeAssignment?.languageMode === "RESTRICTED" &&
      activeAssignment.allowedLanguages &&
      activeAssignment.allowedLanguages.length > 0;
    const isAllowed =
      !isRestricted ||
      (activeAssignment!.allowedLanguages!.map((l) => l.toLowerCase()).includes(detectedLang?.toLowerCase() || ""));
    const effectiveLang = (detectedLang && isAllowed) ? detectedLang : language;

    if (effectiveLang !== language) {
      setLanguage(effectiveLang);
      setCodeMap((m) => ({ ...m, [effectiveLang]: code }));
    }

    const result = await executeCode({
      language: effectiveLang,
      sourceCode: code,
      stdin: initialStdin,
    });

    if (!result.success) {
      setStatus("error");
      setBottomTab("errors");
      setErrors(result.message);
      setTerminalLines([{ type: "error", content: result.message }]);
      setExecutionTime("—");
      setMemoryUsage("—");
      setIsRunning(false);
      return;
    }

    const errorText = result.compileError
      ? `Compilation Error:\n${result.compileError}`
      : result.runtimeError
        ? `Runtime Error:\n${result.runtimeError}`
        : "";

    const rawOutput = result.output || "";
    setOutput(rawOutput);
    setErrors(errorText);
    setExecutionTime(formatTime(result.time));
    setMemoryUsage(formatMemory(result.memory));

    // Build terminal lines: interleave input echoes with output lines
    const newLines: { type: "output" | "input" | "error"; content: string }[] = [];
    if (rawOutput) {
      const outLines = rawOutput.split("\n");
      // If there was pre-set stdin, interleave it inline
      const stdinLines = initialStdin ? initialStdin.split("\n").map((l) => l.trim()).filter(Boolean) : [];
      let stdinIdx = 0;
      for (const line of outLines) {
        newLines.push({ type: "output", content: line });
        // If line looks like a prompt and we have stdin to echo, add it as input echo
        if (stdinLines[stdinIdx] !== undefined && /[:?]\s*$|^(enter|input|type|please)\b/i.test(line.trim())) {
          newLines.push({ type: "input", content: stdinLines[stdinIdx] });
          stdinIdx++;
        }
      }
    }
    if (errorText) {
      newLines.push({ type: "error", content: errorText });
    }
    setTerminalLines(newLines);

    if (errorText) {
      setBottomTab("errors");
      setStatus("error");
      setShowAiAssistPrompt(true);
      setTimeout(() => setShowAiAssistPrompt(false), 8000);
    } else {
      setBottomTab("output");
      setStatus("success");
    }
    setIsRunning(false);
  }, [currentLang, language, code, input]);

  const handleSubmitTerminalInput = useCallback(
    async (inputValueLine: string) => {
      // Accumulate input ONLY for the current active execution session
      const baseInput = sessionInput || input || "";
      const nextSessionInput = baseInput.trim()
        ? `${baseInput.trim()}\n${inputValueLine}`
        : inputValueLine;

      setSessionInput(nextSessionInput);

      if (!currentLang.judge0Supported) {
        setBottomTab("errors");
        setStatus("error");
        setErrors(
          `${currentLang.label} execution isn't connected to the backend yet.`
        );
        return;
      }

      // IMMEDIATELY echo the user's input in the terminal (like a real shell)
      setTerminalLines((prev) => [
        ...prev,
        { type: "input" as const, content: inputValueLine },
      ]);

      setIsRunning(true);
      setStatus("running");
      setBottomTab("output");

      // Snapshot the current output line count so we can compute the delta
      const prevOutputLineCount = terminalLines.filter((l) => l.type === "output").length;

      const result = await executeCode({
        language,
        sourceCode: code,
        stdin: nextSessionInput,
      });

      if (!result.success) {
        setStatus("error");
        setBottomTab("errors");
        setErrors(result.message);
        setTerminalLines((prev) => [
          ...prev,
          { type: "error" as const, content: result.message },
        ]);
        setExecutionTime("—");
        setMemoryUsage("—");
        setIsRunning(false);
        return;
      }

      const errorText = result.compileError
        ? `Compilation Error:\n${result.compileError}`
        : result.runtimeError
          ? `Runtime Error:\n${result.runtimeError}`
          : "";

      const rawOutput = result.output || "";
      setOutput(rawOutput);
      setErrors(errorText);
      setExecutionTime(formatTime(result.time));
      setMemoryUsage(formatMemory(result.memory));

      // Compute only the NEW output lines since last run (the delta)
      const allOutputLines = rawOutput ? rawOutput.split("\n") : [];
      const newOutputLines = allOutputLines.slice(prevOutputLineCount);

      setTerminalLines((prev) => [
        ...prev,
        ...newOutputLines.map((l) => ({ type: "output" as const, content: l })),
        ...(errorText ? [{ type: "error" as const, content: errorText }] : []),
      ]);

      if (errorText) {
        setBottomTab("errors");
        setStatus("error");
      } else {
        setBottomTab("output");
        setStatus("success");
      }
      setIsRunning(false);
    },
    [currentLang, language, code, sessionInput, input, terminalLines]
  );

  const handleCompile = useCallback(async () => {
    if (!currentLang.judge0Supported) {
      setBottomTab("errors");
      setStatus("error");
      setErrors(
        `${currentLang.label} isn't connected to the backend yet.\nSupported right now: C, C++, Java, Python.`
      );
      return;
    }

    setIsCompiling(true);
    setStatus("running");
    setBottomTab("errors");
    setErrors("");

    // Double-check if the source code unambiguously matches a specific language (e.g. #include<stdio.h> -> C)
    const detectedLang = detectLanguageFromCode(code);
    const isRestricted =
      activeAssignment?.languageMode === "RESTRICTED" &&
      activeAssignment.allowedLanguages &&
      activeAssignment.allowedLanguages.length > 0;
    const isAllowed =
      !isRestricted ||
      (activeAssignment!.allowedLanguages!.map((l) => l.toLowerCase()).includes(detectedLang?.toLowerCase() || ""));
    const effectiveLang = (detectedLang && isAllowed) ? detectedLang : language;

    if (effectiveLang !== language) {
      setLanguage(effectiveLang);
      setCodeMap((m) => ({ ...m, [effectiveLang]: code }));
    }

    const result = await executeCode({
      language: effectiveLang,
      sourceCode: code,
      stdin: input,
    });
    console.log("[EXECUTE RESULT]:", result);

    if (!result.success) {
      setStatus("error");
      setErrors(result.message);
      setIsCompiling(false);
      return;
    }

    setExecutionTime(formatTime(result.time));
    setMemoryUsage(formatMemory(result.memory));

    if (result.compileError) {
      setErrors(`Compilation Error:\n${result.compileError}`);
      setStatus("error");
    } else if (result.languageType === "interpreted") {
      setErrors(
        `${currentLang.label} has no separate compile step — the interpreter checked your code while running it.\n\n0 errors, 0 warnings.`
      );
      setStatus("success");
    } else {
      setErrors("Compiled successfully.\n\n0 errors, 0 warnings.");
      setStatus("success");
    }
    setIsCompiling(false);
  }, [currentLang, language, code, input]);

  const handleClear = () => {
    setCodeMap((m) => ({ ...m, [language]: "" }));
    setHighlightLines([]);
  };

  const handleCopyCode = async () => {
    try {
      await navigator.clipboard.writeText(code);
      showExportNote("Code copied to clipboard");
    } catch {
      showExportNote("Couldn't copy — clipboard unavailable");
    }
  };

  const handleDownloadCode = useCallback(() => {
    downloadTextFile(`main.${currentLang.extension}`, code);
    showExportNote("Code downloaded");
  }, [code, currentLang]);

  const handleExportPdf = async () => {
    try {
      await exportTextAsPdf(
        `${currentLang.label} — main.${currentLang.extension}`,
        code,
        `main.${currentLang.extension}.pdf`
      );
      showExportNote("PDF exported");
    } catch {
      showExportNote("Couldn't export PDF");
    }
  };

  const handleShareLink = async () => {
    const url = buildShareUrl({ language, sourceCode: code });
    try {
      await navigator.clipboard.writeText(url);
      showExportNote("Share link copied to clipboard");
    } catch {
      showExportNote("Couldn't copy link — clipboard unavailable");
    }
  };

  const handlePrintCode = () => {
    printPlainText(`${currentLang.label} — main.${currentLang.extension}`, code);
  };

  const latestExplanationMessage = [...messages]
    .reverse()
    .find((m): m is ExplanationChatMessage => m.kind === "explanation");

  const handleDownloadExplanation = () => {
    if (!latestExplanationMessage) return;
    const md = formatExplanationMarkdown(
      latestExplanationMessage.explanation,
      getLanguage(latestExplanationMessage.sourceLanguage).label
    );
    downloadTextFile("ai-explanation.md", md, "text/markdown;charset=utf-8");
    showExportNote("AI explanation downloaded");
  };

  const handleDownloadCorrectedCode = () => {
    if (!latestExplanationMessage) return;
    const lang = getLanguage(latestExplanationMessage.sourceLanguage);
    downloadTextFile(
      `corrected.${lang.extension}`,
      latestExplanationMessage.explanation.correctCode
    );
    showExportNote("Corrected code downloaded");
  };

  const handleDownloadExecutionReport = () => {
    const report = formatExecutionReport({
      language: currentLang.label,
      sourceCode: code,
      stdin: input,
      output,
      errors,
      executionTime,
      memoryUsage,
      status,
    });
    downloadTextFile("execution-report.txt", report);
    showExportNote("Execution report downloaded");
  };

  const handleUpload = (file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      handleCodeChange(String(reader.result ?? ""));
    };
    reader.readAsText(file);
  };

  const handleToggleFullscreen = () => {
    if (!containerRef.current) return;
    if (document.fullscreenElement) {
      document.exitFullscreen();
    } else {
      containerRef.current.requestFullscreen();
    }
  };

  const diffOldCode = diffTarget
    ? fixState[diffTarget.id]?.applied
      ? fixState[diffTarget.id]!.preSnapshot ?? ""
      : codeMap[diffTarget.sourceLanguage] ?? ""
    : "";
  const diffNewCode = diffTarget?.explanation.correctCode ?? "";

  // Global keyboard shortcuts. Ctrl/Cmd combos work everywhere (including
  // while focused in Monaco, since none of them are Monaco's own default
  // bindings); the bare "?" help shortcut only fires outside text inputs so
  // it never interferes with typing.
  useEffect(() => {
    const anyModalOpen =
      shortcutsOpen ||
      !!diffTarget ||
      analyzerOpen ||
      debuggerOpen ||
      learningOpen ||
      converterOpen ||
      aiOverlayOpen;

    const onKeyDown = (e: KeyboardEvent) => {
      const mod = e.metaKey || e.ctrlKey;

      if (e.key === "Escape" && anyModalOpen) {
        e.preventDefault();
        if (shortcutsOpen) setShortcutsOpen(false);
        else if (diffTarget) setDiffTarget(null);
        else if (analyzerOpen) setAnalyzerOpen(false);
        else if (debuggerOpen) {
          setDebuggerOpen(false);
          setDebugPlaying(false);
        } else if (learningOpen) setLearningOpen(false);
        else if (converterOpen) setConverterOpen(false);
        else if (aiOverlayOpen) setAiOverlayOpen(false);
        return;
      }

      if (mod && e.key === "Enter" && e.shiftKey) {
        e.preventDefault();
        void handleCompile();
        return;
      }
      if (mod && e.key === "Enter") {
        e.preventDefault();
        void handleRun();
        return;
      }
      if (mod && (e.key === "s" || e.key === "S")) {
        e.preventDefault();
        handleDownloadCode();
        return;
      }
      if (mod && (e.key === "b" || e.key === "B")) {
        e.preventDefault();
        setAiPanelOpen((v) => !v);
        return;
      }
      if (mod && (e.key === "k" || e.key === "K")) {
        e.preventDefault();
        setAiPanelOpen(true);
        if (typeof window !== "undefined" && window.innerWidth < 768) {
          setAiOverlayOpen(true);
        }
        setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 60);
        return;
      }

      const target = e.target as HTMLElement | null;
      const isTyping =
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable);

      if (!isTyping && e.shiftKey && e.key === "?") {
        e.preventDefault();
        setShortcutsOpen(true);
      }
    };

    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [
    shortcutsOpen,
    diffTarget,
    analyzerOpen,
    debuggerOpen,
    learningOpen,
    converterOpen,
    aiOverlayOpen,
    handleRun,
    handleCompile,
    handleDownloadCode,
  ]);

  return (
    <main className="h-screen h-[100dvh] overflow-hidden bg-[var(--bg)]">
      <Navbar
        activeAssignment={activeAssignment}
        onOpenAssignmentSelector={() => setShowAssignmentModal(true)}
      />

      <div
        ref={containerRef}
        className="flex flex-col bg-[var(--bg)]"
        style={{ height: "calc(100vh - " + NAVBAR_H + "px)", marginTop: NAVBAR_H }}
      >
        <Toolbar
          language={language}
          onLanguageChange={handleLanguageChange}
          allowedLanguages={activeAssignment?.languageMode === "RESTRICTED" ? activeAssignment.allowedLanguages : undefined}
          activeAssignment={activeAssignment}
          onSubmitAssignment={handleAssignmentSubmit}
          isSubmittingAssignment={isSubmittingAssignment}
          onToggleProblemSpecs={() => setIsProblemSpecsOpen((v) => !v)}
          isProblemSpecsOpen={isProblemSpecsOpen}
          onRun={activeAssignment && testCases.length > 0 ? () => handleRunTestCases() : handleRun}
          onCompile={handleCompile}
          onClear={handleClear}
          onUpload={handleUpload}
          isRunning={isRunning}
          isCompiling={isCompiling}
          fullscreen={fullscreen}
          onToggleFullscreen={handleToggleFullscreen}
          settings={settings}
          onSettingsChange={setSettings}
          autoSave={autoSave}
          onAutoSaveChange={setAutoSave}
          onToggleAIPanel={() => setAiPanelOpen((v) => !v)}
          aiPanelOpen={aiPanelOpen}
          onAnalyze={handleAnalyze}
          isAnalyzing={analyzerOpen && analyzerStatus === "loading"}
          onDebug={handleDebug}
          isDebugging={debuggerOpen && debugStatus === "loading"}
          onExplain={handleExplain}
          isExplaining={learningOpen && learningStatus === "loading"}
          onConvert={() => setConverterOpen(true)}
          onDownloadCode={handleDownloadCode}
          onCopyCode={() => void handleCopyCode()}
          onExportPdf={() => void handleExportPdf()}
          onShareLink={() => void handleShareLink()}
          onPrintCode={handlePrintCode}
          onDownloadExplanation={handleDownloadExplanation}
          onDownloadCorrectedCode={handleDownloadCorrectedCode}
          onDownloadExecutionReport={handleDownloadExecutionReport}
          hasExplanation={!!latestExplanationMessage}
          hasCorrectedCode={!!latestExplanationMessage}
          hasExecutionResult={status !== "idle"}
          onShowShortcuts={() => setShortcutsOpen(true)}
        />

        {/* Active Assignment Header */}
        {activeAssignment && (
          <div className="px-4 py-2 bg-[#0d0d10] border-b border-white/10 flex flex-wrap items-center justify-between gap-3 text-xs font-mono shrink-0">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-black text-amber-300 border border-amber-500/40 shadow-[0_0_10px_rgba(212,175,55,0.2)]">
                Assignment Mode
              </span>
              <h3 className="font-bold text-white">{activeAssignment.title}</h3>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Class: <strong className="text-white font-semibold">{activeAssignment.className || "Class Section"}</strong></span>
              <span className="text-zinc-600">|</span>
              <span className="text-zinc-400">Points: <strong className="text-amber-300 font-semibold">{activeAssignment.points || 100} pts</strong></span>
              <span className="text-zinc-600">|</span>
              <div className="flex items-center gap-1">
                <span className="text-zinc-400">Allowed Languages:</span>
                <strong className="text-amber-300">
                  {activeAssignment.languageMode === "RESTRICTED" && activeAssignment.allowedLanguages?.length > 0
                    ? activeAssignment.allowedLanguages.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ")
                    : "Any Supported Language"}
                </strong>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setIsProblemSpecsOpen((v) => !v)}
                className="flex items-center gap-1 text-[11px] text-amber-300 hover:text-amber-200 cursor-pointer font-bold"
              >
                <span>{isProblemSpecsOpen ? "Hide Problem" : "Show Problem"}</span>
              </button>
              <button
                onClick={() => setShowAssignmentModal(true)}
                className="text-[11px] text-zinc-300 hover:text-amber-300 hover:underline cursor-pointer"
              >
                Change Assignment
              </button>
              <button
                onClick={() => {
                  setActiveAssignment(null);
                  setTestCases([]);
                  setBottomTab("terminal");
                }}
                className="text-[11px] text-zinc-400 hover:text-white hover:underline cursor-pointer"
              >
                Exit
              </button>
            </div>
          </div>
        )}

        <div className="flex flex-1 min-h-0">
          {/* Assignment Problem Statement & Specs Panel */}
          {activeAssignment && (
            <AssignmentProblemPanel
              assignment={activeAssignment}
              isOpen={isProblemSpecsOpen}
              onToggle={() => setIsProblemSpecsOpen((v) => !v)}
            />
          )}

          {/* Editor + bottom panel */}
          <div className="flex flex-col flex-1 min-w-0">
            <div className="flex-1 min-h-0">
              <CodeEditor
                language={currentLang.monacoId}
                value={code}
                onChange={handleCodeChange}
                settings={settings}
                highlightLines={highlightLines}
                disableCopyPaste={!!activeAssignment}
                currentLine={
                  debuggerOpen &&
                    debugStatus === "success" &&
                    trace &&
                    debugLanguage === language
                    ? trace.steps[debugStepIndex]?.line ?? null
                    : null
                }
                onRun={activeAssignment && testCases.length > 0 ? () => handleRunTestCases() : handleRun}
                onCompile={handleCompile}
                onDownloadCode={handleDownloadCode}
                onToggleAIPanel={() => !activeAssignment && setAiPanelOpen((v) => !v)}
                onFocusAIChat={() => {
                  if (!activeAssignment) {
                    setAiPanelOpen(true);
                    setTimeout(() => document.getElementById("ai-chat-input")?.focus(), 60);
                  }
                }}
                onShowShortcuts={() => setShortcutsOpen(true)}
              />
            </div>
            <div style={{ height: bottomHeight }} className="shrink-0">
              <BottomPanel
                output={output}
                errors={errors}
                terminalLines={terminalLines}
                status={status}
                onSubmitInput={handleSubmitTerminalInput}
                onClearOutput={() => {
                  setOutput("");
                  setErrors("");
                  setStatus("idle");
                  setSessionInput("");
                  setTerminalLines([]);
                }}
                onStopExecution={handleStopExecution}
                isRunning={isRunning}
                input={input}
                onInputChange={setInput}
                activeTab={bottomTab}
                onTabChange={setBottomTab}
                executionTime={executionTime}
                memoryUsage={memoryUsage}
                isAssignmentMode={!!activeAssignment}
                testCases={testCases}
                onRunTestCases={() => handleRunTestCases()}
                isRunningTestCases={isRunning && bottomTab === "result"}
                onTriggerAiExplain={() => {
                  if (!activeAssignment && errors) {
                    void triggerAIExplain(errors, language, code);
                  }
                }}
                onResizeStart={(e) => {
                  e.preventDefault();
                  resizing.current = true;
                }}
              />
            </div>
          </div>

          {/* Resizable AI Assistant Panel — desktop (Docked Mode) : ONLY rendered when NOT in assignment */}
          {!activeAssignment && aiPanelOpen && !aiFloating && (
            <>
              {/* Drag handle between Code Editor/Output & AI Panel */}
              <div
                onMouseDown={(e) => {
                  e.preventDefault();
                  aiResizing.current = true;
                }}
                className="hidden md:flex w-2 items-center justify-center cursor-col-resize hover:bg-emerald-500/20 active:bg-emerald-500/40 group shrink-0 transition-colors border-l border-white/5 bg-[#0a0d14]"
              >
                <GripVertical className="h-4 w-3 text-gray-600 group-hover:text-emerald-400 transition-colors" />
              </div>

              <div
                style={{ width: aiPanelWidth }}
                className="hidden md:block shrink-0 h-full overflow-hidden"
              >
                <AIPanel
                  isFloating={false}
                  onToggleFloating={() => setAiFloating(true)}
                  onClose={() => setAiPanelOpen(false)}
                  messages={messages}
                  busy={chatBusy}
                  inputValue={chatInput}
                  onInputChange={setChatInput}
                  onSend={() => void sendChat(chatInput)}
                  onQuickAction={(prompt) => void sendChat(prompt)}
                  onRetry={handleRetry}
                  getFixState={getFixState}
                  onApplyFix={handleApplyFix}
                  onUndoFix={handleUndoFix}
                  onCompareChanges={handleCompareChanges}
                  inputId="ai-chat-input"
                />
              </div>
            </>
          )}
        </div>
      </div>

      {/* Floating Movable Pop-up App Window for AI Explanations : ONLY rendered when NOT in assignment */}
      <AnimatePresence>
        {!activeAssignment && aiPanelOpen && aiFloating && (
          <motion.div
            drag
            dragMomentum={false}
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="fixed z-50 top-20 right-8 w-[440px] h-[600px] max-w-[94vw] max-h-[85vh] rounded-2xl glass-strong border border-[var(--syn-keyword)]/40 shadow-[0_25px_70px_rgba(0,0,0,0.7)] overflow-hidden flex flex-col backdrop-blur-xl"
          >
            <AIPanel
              isFloating={true}
              onToggleFloating={() => setAiFloating(false)}
              onClose={() => setAiPanelOpen(false)}
              messages={messages}
              busy={chatBusy}
              inputValue={chatInput}
              onInputChange={setChatInput}
              onSend={() => void sendChat(chatInput)}
              onQuickAction={(prompt) => void sendChat(prompt)}
              onRetry={handleRetry}
              getFixState={getFixState}
              onApplyFix={handleApplyFix}
              onUndoFix={handleUndoFix}
              onCompareChanges={handleCompareChanges}
              inputId="ai-chat-input"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Mobile AI overlay trigger */}
      <button
        onClick={() => setAiOverlayOpen(true)}
        className="md:hidden fixed bottom-5 right-5 z-40 h-12 w-12 rounded-full bg-gradient-to-br from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] shadow-[0_10px_30px_-8px_rgba(184,146,255,0.5)] flex items-center justify-center"
        aria-label="Open AI Assistant"
      >
        <span className="text-[#0a0d13] font-display font-bold text-sm">AI</span>
      </button>

      {aiOverlayOpen && (
        <div className="md:hidden fixed inset-0 z-50 flex justify-end">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setAiOverlayOpen(false)}
          />
          <div className="relative w-[86%] max-w-sm">
            <AIPanel
              onClose={() => setAiOverlayOpen(false)}
              messages={messages}
              busy={chatBusy}
              inputValue={chatInput}
              onInputChange={setChatInput}
              onSend={() => void sendChat(chatInput)}
              onQuickAction={(prompt) => void sendChat(prompt)}
              onRetry={handleRetry}
              getFixState={getFixState}
              onApplyFix={handleApplyFix}
              onUndoFix={handleUndoFix}
              onCompareChanges={handleCompareChanges}
            />
          </div>
        </div>
      )}

      <AnimatePresence>
        {showAiAssistPrompt && !aiOverlayOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-20 right-5 z-40 max-w-[280px] p-3 rounded-2xl glass-strong border border-[var(--border-strong)] shadow-2xl flex items-start gap-3 cursor-pointer hover:border-[var(--syn-keyword)] transition-colors group"
            onClick={() => {
              setShowAiAssistPrompt(false);
              setAiOverlayOpen(true); // for mobile
              setAiPanelOpen(true);   // for desktop
              
              // Wait for the panel to render before focusing
              setTimeout(() => {
                const inputElement = document.getElementById("chat-input");
                if (inputElement) inputElement.focus();
              }, 100);
            }}
          >
            <div className="shrink-0 p-2 rounded-xl bg-gradient-to-br from-rose-500/20 to-orange-500/20 text-rose-400 group-hover:text-rose-300">
              <Bot className="h-5 w-5" />
            </div>
            <div className="flex-1 space-y-1 mt-0.5">
              <p className="text-[13px] font-semibold text-[var(--ink)] leading-tight">Need help debugging?</p>
              <p className="text-[11.5px] text-[var(--ink-dim)] leading-snug">Ask the AI Assistant to explain or fix this error.</p>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowAiAssistPrompt(false);
              }}
              className="shrink-0 p-1 rounded-lg hover:bg-white/10 text-[var(--ink-faint)] hover:text-[var(--ink)]"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {saveNote && autoSave && (
        <div className="fixed bottom-5 left-5 z-40 font-mono text-[11px] text-[var(--syn-string)] glass rounded-full px-3 py-1.5">
          {saveNote}
        </div>
      )}

      {exportNote && (
        <div className="fixed bottom-5 left-5 z-40 font-mono text-[11px] text-[var(--syn-function)] glass rounded-full px-3 py-1.5">
          {exportNote}
        </div>
      )}

      {diffTarget && (
        <DiffModal
          open={!!diffTarget}
          onClose={() => setDiffTarget(null)}
          oldCode={diffOldCode}
          newCode={diffNewCode}
          language={getLanguage(diffTarget.sourceLanguage).label}
          onApply={() => handleApplyFix(diffTarget)}
          canApply
        />
      )}

      <AnalyzerModal
        open={analyzerOpen}
        onClose={() => setAnalyzerOpen(false)}
        language={currentLang.label}
        status={analyzerStatus}
        analysis={analysis}
        errorMessage={analyzerError}
        onRetry={() => void handleAnalyze()}
      />

      <VisualDebugger
        open={debuggerOpen}
        onClose={() => {
          setDebuggerOpen(false);
          setDebugPlaying(false);
        }}
        language={currentLang.label}
        sourceCode={code}
        status={debugStatus}
        trace={trace}
        errorMessage={debugError}
        currentStepIndex={debugStepIndex}
        playing={debugPlaying}
        onStepInto={handleDebugStepInto}
        onStepOver={handleDebugStepOver}
        onTogglePlay={handleDebugTogglePlay}
        onReset={handleDebugReset}
        onJumpToStep={handleDebugJumpToStep}
        onRetry={() => void handleDebug()}
      />

      <LearningModeModal
        open={learningOpen}
        onClose={() => setLearningOpen(false)}
        language={currentLang.label}
        status={learningStatus}
        content={learningContent}
        errorMessage={learningError}
        onRetry={() => void handleExplain()}
        onExploreTopic={handleExploreTopic}
      />

      <ConverterModal
        open={converterOpen}
        onClose={() => setConverterOpen(false)}
        initialSourceLanguage={language}
        getSourceCode={(id) => codeMap[id] ?? getLanguage(id).template}
        onUseInEditor={handleUseConvertedInEditor}
      />

      <ShortcutsModal open={shortcutsOpen} onClose={() => setShortcutsOpen(false)} />

      {/* Student Assignment Selector Modal */}
      {showAssignmentModal && (
        <StudentAssignmentsModal
          assignments={studentAssignments}
          activeAssignment={activeAssignment}
          onSelectAssignment={handleSelectAssignment}
          onClose={() => setShowAssignmentModal(false)}
          onRefresh={refreshAssignments}
          isRefreshing={isRefreshingAssignments}
        />
      )}

      {/* Submission Result Modal */}
      {submissionResultModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
          <div className="bg-[#0d0d10] border border-white/20 rounded-2xl p-6 max-w-md w-full space-y-4 relative shadow-2xl">
            <h3 className={`text-lg font-display font-bold ${submissionResultModal.success ? "text-amber-400" : "text-white"}`}>
              {submissionResultModal.success ? "Assignment Submitted!" : "Submission Rejected"}
            </h3>

            <p className="text-xs font-mono text-zinc-300 leading-relaxed whitespace-pre-wrap">{submissionResultModal.message}</p>

            {submissionResultModal.score !== undefined && submissionResultModal.success && (
              <div className="p-3 rounded-xl bg-black border border-amber-500/30 text-xs font-mono text-amber-300">
                Score Awarded: <strong className="text-white font-bold">{submissionResultModal.score}%</strong>
              </div>
            )}

            <button
              onClick={() => setSubmissionResultModal(null)}
              className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-300 via-amber-400 to-yellow-500 text-black font-bold text-xs font-mono cursor-pointer shadow-[0_0_15px_rgba(212,175,55,0.3)] hover:brightness-110"
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
