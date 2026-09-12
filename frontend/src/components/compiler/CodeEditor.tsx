"use client";

import { useEffect, useRef, useState } from "react";
import Editor, { OnMount, loader } from "@monaco-editor/react";

export interface EditorSettings {
  theme: "vs-dark" | "light";
  fontSize: number;
  wordWrap: boolean;
  minimap: boolean;
  lineNumbers: boolean;
  bracketMatching: boolean;
}

type MonacoEditorInstance = Parameters<OnMount>[0];
type DecorationsCollection = ReturnType<
  MonacoEditorInstance["createDecorationsCollection"]
>;

interface CodeEditorProps {
  language: string;
  value: string;
  onChange: (value: string) => void;
  settings: EditorSettings;
  /** Line numbers (in `value`) to highlight as AI-fix additions/changes, GitHub-diff style. */
  highlightLines?: number[];
  /** The Visual Debugger's currently-executing line, or null when not debugging. */
  currentLine?: number | null;
  onRun?: () => void;
  onCompile?: () => void;
  onDownloadCode?: () => void;
  onToggleAIPanel?: () => void;
  onFocusAIChat?: () => void;
  onShowShortcuts?: () => void;
  /** Prevent copying, cutting, pasting, and context menu during assignment mode */
  disableCopyPaste?: boolean;
}

export default function CodeEditor({
  language,
  value,
  onChange,
  settings,
  highlightLines,
  currentLine,
  onRun,
  onCompile,
  onDownloadCode,
  onToggleAIPanel,
  onFocusAIChat,
  onShowShortcuts,
  disableCopyPaste = false,
}: CodeEditorProps) {
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const decorationsRef = useRef<DecorationsCollection | null>(null);
  const debugDecorationsRef = useRef<DecorationsCollection | null>(null);

  const [useFallbackEditor, setUseFallbackEditor] = useState(false);
  const [retryingMonaco, setRetryingMonaco] = useState(false);

  const onRunRef = useRef(onRun);
  const onCompileRef = useRef(onCompile);
  const onDownloadCodeRef = useRef(onDownloadCode);
  const onToggleAIPanelRef = useRef(onToggleAIPanel);
  const onFocusAIChatRef = useRef(onFocusAIChat);
  const onShowShortcutsRef = useRef(onShowShortcuts);

  useEffect(() => {
    onRunRef.current = onRun;
    onCompileRef.current = onCompile;
    onDownloadCodeRef.current = onDownloadCode;
    onToggleAIPanelRef.current = onToggleAIPanel;
    onFocusAIChatRef.current = onFocusAIChat;
    onShowShortcutsRef.current = onShowShortcuts;
  });

  // Safety timer: If Monaco fails to load or CDN hangs after 8s, offer lightweight fallback editor
  useEffect(() => {
    let isMounted = true;
    const timer = setTimeout(() => {
      if (isMounted && !editorRef.current) {
        setUseFallbackEditor(true);
      }
    }, 8000);

    loader.init().then(() => {
      if (isMounted && editorRef.current) {
        setUseFallbackEditor(false);
      }
    }).catch((err) => {
      console.warn("Monaco Editor CDN init failed, engaging fallback editor:", err);
      if (isMounted) {
        setUseFallbackEditor(true);
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timer);
    };
  }, [retryingMonaco]);

  const handleMount: OnMount = (editor, monaco) => {
    editorRef.current = editor;
    setUseFallbackEditor(false);
    editor.updateOptions({
      tabSize: 2,
      glyphMargin: true,
      matchBrackets: settings.bracketMatching ? "always" : "never",
      bracketPairColorization: { enabled: settings.bracketMatching },
      autoClosingBrackets: settings.bracketMatching ? "always" : "never",
      autoClosingQuotes: settings.bracketMatching ? "always" : "never",
    });
    editor.focus();

    // Register shortcuts inside Monaco so Ctrl+Enter / Ctrl+Shift+Enter / Ctrl+S / Ctrl+B work while typing in Monaco
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter, () => {
      onRunRef.current?.();
    });
    editor.addCommand(
      monaco.KeyMod.CtrlCmd | monaco.KeyMod.Shift | monaco.KeyCode.Enter,
      () => {
        onCompileRef.current?.();
      }
    );
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyS, () => {
      onDownloadCodeRef.current?.();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyB, () => {
      onToggleAIPanelRef.current?.();
    });
    editor.addCommand(monaco.KeyMod.CtrlCmd | monaco.KeyCode.KeyK, () => {
      onFocusAIChatRef.current?.();
    });
  };

  // Dynamically update Monaco options whenever settings change
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    editor.updateOptions({
      fontSize: settings.fontSize,
      wordWrap: settings.wordWrap ? "on" : "off",
      minimap: { enabled: settings.minimap },
      lineNumbers: settings.lineNumbers ? "on" : "off",
      matchBrackets: settings.bracketMatching ? "always" : "never",
      bracketPairColorization: { enabled: settings.bracketMatching },
      autoClosingBrackets: settings.bracketMatching ? "always" : "never",
      autoClosingQuotes: settings.bracketMatching ? "always" : "never",
    });
  }, [settings]);

  // Disable copy/cut/paste during Assignment mode
  useEffect(() => {
    if (!disableCopyPaste) return;

    const preventAction = (e: Event) => {
      e.preventDefault();
      e.stopPropagation();
    };

    const container = document.getElementById("monaco-editor-container");
    if (container) {
      container.addEventListener("copy", preventAction, true);
      container.addEventListener("cut", preventAction, true);
      container.addEventListener("paste", preventAction, true);
      container.addEventListener("contextmenu", preventAction, true);
    }

    return () => {
      if (container) {
        container.removeEventListener("copy", preventAction, true);
        container.removeEventListener("cut", preventAction, true);
        container.removeEventListener("paste", preventAction, true);
        container.removeEventListener("contextmenu", preventAction, true);
      }
    };
  }, [disableCopyPaste]);

  // Apply/clear the "changed lines" decorations whenever the highlighted set changes
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    decorationsRef.current?.clear();

    const lines = highlightLines ?? [];
    if (lines.length === 0) {
      decorationsRef.current = null;
      return;
    }

    decorationsRef.current = editor.createDecorationsCollection(
      lines.map((lineNumber) => ({
        range: {
          startLineNumber: lineNumber,
          startColumn: 1,
          endLineNumber: lineNumber,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "diff-line-added",
          linesDecorationsClassName: "diff-line-added-gutter",
        },
      }))
    );
  }, [highlightLines]);

  // Visual Debugger: highlight current executing line
  useEffect(() => {
    const editor = editorRef.current;
    if (!editor) return;

    debugDecorationsRef.current?.clear();

    if (!currentLine) {
      debugDecorationsRef.current = null;
      return;
    }

    debugDecorationsRef.current = editor.createDecorationsCollection([
      {
        range: {
          startLineNumber: currentLine,
          startColumn: 1,
          endLineNumber: currentLine,
          endColumn: 1,
        },
        options: {
          isWholeLine: true,
          className: "debug-current-line",
          glyphMarginClassName: "debug-current-line-glyph",
        },
      },
    ]);
    editor.revealLineInCenter(currentLine);
  }, [currentLine]);

  if (useFallbackEditor) {
    const lines = (value || "").split("\n");
    return (
      <div id="monaco-editor-container" className="h-full w-full relative flex flex-col bg-[var(--card)] text-[var(--ink)] font-mono">
        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[var(--border)] bg-amber-500/10 text-xs shrink-0">
          <div className="flex items-center gap-2 text-amber-300">
            <span className="h-2 w-2 rounded-full bg-amber-400" />
            <span className="font-semibold">Lightweight Editor</span>
            <span className="text-[11px] text-[var(--ink-faint)] hidden sm:inline">— Monaco engine CDN delayed or offline</span>
          </div>
          <button
            onClick={() => {
              setUseFallbackEditor(false);
              setRetryingMonaco((v) => !v);
              loader.init().then(() => setUseFallbackEditor(false)).catch(() => {});
            }}
            className="px-2 py-0.5 rounded bg-amber-400 text-black text-xs font-bold hover:bg-amber-300 transition-colors shadow-sm cursor-pointer"
          >
            Retry Monaco
          </button>
        </div>
        <div className="flex-1 flex overflow-hidden relative">
          <div className="w-12 shrink-0 select-none py-3 text-right pr-2 font-mono text-xs text-[var(--ink-faint)] bg-black/20 border-r border-[var(--border)] overflow-hidden">
            {lines.map((_, i) => (
              <div key={i} className="leading-6" style={{ fontSize: `${settings.fontSize}px` }}>{i + 1}</div>
            ))}
          </div>
          <textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            onKeyDown={(e) => {
              if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
                e.preventDefault();
                if (e.shiftKey) {
                  onCompileRef.current?.();
                } else {
                  onRunRef.current?.();
                }
              }
            }}
            spellCheck={false}
            style={{ fontSize: `${settings.fontSize}px` }}
            className="flex-1 h-full w-full bg-transparent p-3 outline-none resize-none font-mono leading-6 text-[var(--ink)] overflow-auto whitespace-pre"
          />
        </div>
        {disableCopyPaste && (
          <div className="absolute top-10 right-4 z-20 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono select-none pointer-events-none shadow-md backdrop-blur-sm">
            🔒 Copy/Paste Disabled in Assignment Mode
          </div>
        )}
      </div>
    );
  }

  return (
    <div id="monaco-editor-container" className="h-full w-full relative">
      <Editor
        language={language}
        value={value}
        theme={settings.theme === "vs-dark" ? "codementor-dark" : "codementor-light"}
        onChange={(v) => onChange(v ?? "")}
        onMount={handleMount}
        beforeMount={(monaco) => {
          monaco.editor.defineTheme("codementor-dark", {
            base: "vs-dark",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#0d1119",
              "editor.lineHighlightBackground": "#161b26",
              "editorGutter.background": "#0d1119",
              "editorLineNumber.foreground": "#3a4356",
              "editorLineNumber.activeForeground": "#8993a4",
            },
          });
          monaco.editor.defineTheme("codementor-light", {
            base: "vs",
            inherit: true,
            rules: [],
            colors: {
              "editor.background": "#ffffff",
              "editor.lineHighlightBackground": "#f0f4f9",
              "editorGutter.background": "#ffffff",
              "editorLineNumber.foreground": "#94a3b8",
              "editorLineNumber.activeForeground": "#334155",
            },
          });
        }}
        options={{
          fontSize: settings.fontSize,
          wordWrap: settings.wordWrap ? "on" : "off",
          minimap: { enabled: settings.minimap },
          lineNumbers: settings.lineNumbers ? "on" : "off",
          bracketPairColorization: { enabled: settings.bracketMatching },
          matchBrackets: settings.bracketMatching ? "always" : "never",
          autoClosingBrackets: settings.bracketMatching ? "always" : "never",
          autoClosingQuotes: settings.bracketMatching ? "always" : "never",
          autoSurround: settings.bracketMatching ? "languageDefined" : "never",
          mouseWheelZoom: false,
          fontFamily:
            "var(--font-mono), 'JetBrains Mono', ui-monospace, monospace",
          fontLigatures: true,
          smoothScrolling: true,
          cursorBlinking: "smooth",
          padding: { top: 16 },
          scrollBeyondLastLine: false,
          automaticLayout: true,
          renderLineHighlight: "all",
          roundedSelection: true,
          glyphMargin: true,
          tabSize: 2,
        }}
        loading={
          <div className="flex h-full w-full flex-col gap-2 bg-[var(--bg)] p-4">
            {Array.from({ length: 10 }).map((_, i) => (
              <div
                key={i}
                className="h-3 rounded animate-pulse bg-white/5"
                style={{
                  width: `${[85, 60, 92, 40, 70, 55, 80, 45, 65, 50][i % 10]}%`,
                  animationDelay: `${i * 60}ms`,
                }}
              />
            ))}
          </div>
        }
      />

      {disableCopyPaste && (
        <div className="absolute top-2 right-4 z-20 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 text-[10px] font-mono select-none pointer-events-none shadow-md backdrop-blur-sm">
          🔒 Copy/Paste Disabled in Assignment Mode
        </div>
      )}
    </div>
  );
}
