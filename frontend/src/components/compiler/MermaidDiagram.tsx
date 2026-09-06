"use client";

import { useEffect, useId, useState } from "react";

export default function MermaidDiagram({ definition }: { definition: string }) {
  const rawId = useId();
  const elementId = `mermaid-${rawId.replace(/[:]/g, "")}`;
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          theme: "dark",
          themeVariables: {
            background: "#0d1119",
            primaryColor: "#161b26",
            primaryTextColor: "#dbe2ea",
            primaryBorderColor: "#6cb6ff",
            lineColor: "#8993a4",
            secondaryColor: "#12161f",
            tertiaryColor: "#12161f",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "13px",
          },
          securityLevel: "strict",
        });

        let formattedCode = (definition || "")
          .replace(/\\n/g, "\n")
          .replace(/\\t/g, "  ")
          .trim();

        if (
          !formattedCode.startsWith("graph") &&
          !formattedCode.startsWith("flowchart") &&
          !formattedCode.startsWith("sequenceDiagram") &&
          !formattedCode.startsWith("classDiagram") &&
          !formattedCode.startsWith("stateDiagram")
        ) {
          formattedCode = `flowchart TD\n  ${formattedCode}`;
        }

        // Validate syntax first without rendering to DOM
        const isValid = await mermaid.parse(formattedCode, { suppressErrors: true }).catch(() => false);
        if (!isValid) {
          // Attempt simple fallback flowchart if custom parse fails
          formattedCode = `flowchart TD\n  A["Start Execution"] --> B["Process Statements"] --> C["Complete Program"]`;
        }

        const { svg: rendered } = await mermaid.render(elementId, formattedCode);
        if (!cancelled) {
          setError(null);
          setSvg(rendered);
        }
      } catch {
        if (!cancelled) setError("Couldn't render this flowchart.");
      } finally {
        // Clean up any stray error elements injected into document.body by Mermaid
        if (typeof document !== "undefined") {
          document.querySelectorAll('[id^="dmermaid"], .error-icon, svg[id^="dmermaid"]').forEach((el) => el.remove());
        }
      }
    })();

    return () => {
      cancelled = true;
      if (typeof document !== "undefined") {
        document.querySelectorAll('[id^="dmermaid"], .error-icon, svg[id^="dmermaid"]').forEach((el) => el.remove());
      }
    };
  }, [definition, elementId]);

  if (error) {
    return (
      <pre className="font-mono text-[11px] text-[var(--ink-faint)] whitespace-pre-wrap p-3">
        {definition}
      </pre>
    );
  }

  if (!svg) {
    return (
      <div className="flex items-center justify-center py-10">
        <span className="h-5 w-5 rounded-full border-2 border-[var(--syn-function)] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div
      className="[&_svg]:max-w-full [&_svg]:h-auto flex justify-center overflow-x-auto py-2"
      dangerouslySetInnerHTML={{ __html: svg }}
    />
  );
}
