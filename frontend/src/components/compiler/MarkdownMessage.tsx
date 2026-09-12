"use client";

import { useState } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";
import { Copy, Check } from "lucide-react";
import MermaidDiagram from "./MermaidDiagram";

function CodeBlock({
  language,
  code,
}: {
  language: string;
  code: string;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      // clipboard unavailable
    }
  };

  return (
    <div className="relative my-2 rounded-md overflow-hidden border border-[var(--border)]">
      <div className="flex items-center justify-between px-2.5 py-1.5 bg-black/40">
        <span className="font-mono text-[10.5px] text-[var(--ink-faint)]">
          {language || "text"}
        </span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-[10.5px] font-mono text-[var(--ink-faint)] hover:text-[var(--ink)] transition-colors"
        >
          {copied ? (
            <Check className="h-3 w-3 text-[var(--syn-string)]" />
          ) : (
            <Copy className="h-3 w-3" />
          )}
          {copied ? "Copied" : "Copy"}
        </button>
      </div>
      <SyntaxHighlighter
        language={language || "text"}
        style={vscDarkPlus}
        customStyle={{
          margin: 0,
          background: "rgba(0,0,0,0.3)",
          fontSize: "11px",
          padding: "10px 12px",
        }}
        wrapLongLines
      >
        {code}
      </SyntaxHighlighter>
    </div>
  );
}

export default function MarkdownMessage({ content }: { content: string }) {
  return (
    <div className="text-[12.5px] text-[var(--ink-dim)] leading-relaxed space-y-2 [&_p]:leading-relaxed [&_ul]:list-disc [&_ul]:pl-4 [&_ol]:list-decimal [&_ol]:pl-4 [&_li]:my-0.5 [&_strong]:text-[var(--ink)] [&_strong]:font-semibold [&_a]:text-[var(--syn-function)] [&_a]:underline [&_h1]:text-[13.5px] [&_h2]:text-[13px] [&_h3]:text-[12.5px] [&_h1]:font-semibold [&_h2]:font-semibold [&_h3]:font-semibold [&_h1]:text-[var(--ink)] [&_h2]:text-[var(--ink)] [&_h3]:text-[var(--ink)] [&_blockquote]:border-l-2 [&_blockquote]:border-[var(--border-strong)] [&_blockquote]:pl-2.5 [&_blockquote]:italic [&_table]:w-full [&_table]:text-[11.5px] [&_th]:text-left [&_th]:border-b [&_th]:border-[var(--border)] [&_th]:pb-1 [&_td]:border-b [&_td]:border-[var(--border)] [&_td]:py-1 [&_code]:font-mono [&_code]:text-[11.5px] [&_code]:bg-black/30 [&_code]:rounded [&_code]:px-1 [&_code]:py-0.5">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          code(props) {
            const { className, children } = props;
            const match = /language-(\w+)/.exec(className || "");
            const text = String(children).replace(/\n$/, "");
            const isBlock = Boolean(match) || text.includes("\n");

            if (!isBlock) {
              return <code className={className}>{children}</code>;
            }

            if (match && match[1].toLowerCase() === "mermaid") {
              return <MermaidDiagram definition={text} />;
            }

            return <CodeBlock language={match ? match[1] : ""} code={text} />;
          },
          pre(props) {
            // SyntaxHighlighter already renders its own <pre>; avoid double-wrapping.
            return <>{props.children}</>;
          },
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
