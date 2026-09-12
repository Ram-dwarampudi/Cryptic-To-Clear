"use client";

import { useEffect, useState } from "react";

function sanitizeMermaidCode(raw: string): string {
  if (!raw) return 'flowchart TD\n  Start["Start Program"] --> Exec["Execute Instructions"] --> End["End Program"]';

  // 1. Strip markdown fences and whitespace
  let code = raw
    .replace(/^```(?:mermaid)?\s*\n?/i, "")
    .replace(/\n?```\s*$/i, "")
    .replace(/\\n/g, "\n")
    .replace(/\\t/g, "  ")
    .trim();

  // 2. Ensure diagram direction
  if (
    !code.startsWith("graph") &&
    !code.startsWith("flowchart") &&
    !code.startsWith("sequenceDiagram") &&
    !code.startsWith("classDiagram") &&
    !code.startsWith("stateDiagram")
  ) {
    code = `flowchart TD\n  ${code}`;
  }

  // 3. Fix unquoted node labels that contain brackets, parens, quotes, or colons
  // e.g. A[Start] or B[Access numbers[2]] -> B["Access numbers[2]"]
  code = code
    .split("\n")
    .map((line) => {
      // If line defines a node like id[label] where label isn't enclosed in "..."
      return line.replace(/([A-Za-z0-9_]+)\[([^"\n\]]+(?:\[[^"\n\]]*\])?[^"\n\]]*)\]/g, (m, id, inner) => {
        if (inner.startsWith('"') && inner.endsWith('"')) {
          return m;
        }
        const cleanedInner = inner.replace(/"/g, "'").trim();
        return `${id}["${cleanedInner}"]`;
      });
    })
    .join("\n");

  return code;
}

export default function MermaidDiagram({ definition }: { definition: string }) {
  const [svg, setSvg] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);

    (async () => {
      // Unique container ID for this specific render attempt to prevent DOM ID collision
      const renderId = `mmd_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

      try {
        const mermaid = (await import("mermaid")).default;
        mermaid.initialize({
          startOnLoad: false,
          suppressErrorRendering: true,
          securityLevel: "loose",
          theme: "base",
          themeVariables: {
            darkMode: true,
            background: "transparent",
            mainBkg: "#0f141c",
            primaryColor: "#141a24",
            primaryTextColor: "#ffffff",
            primaryBorderColor: "#D4AF37",
            lineColor: "#D4AF37",
            secondaryColor: "#121722",
            tertiaryColor: "#0a0d13",
            fontFamily: "var(--font-mono), monospace",
            fontSize: "12px",
            nodeBorder: "#D4AF37",
            clusterBkg: "#0d1117",
            clusterBorder: "#D4AF37",
            defaultLinkColor: "#D4AF37",
            titleColor: "#E8C97A",
            edgeLabelBackground: "#0a0d13",
          },
        });

        let formatted = sanitizeMermaidCode(definition);

        // Test syntax parsing
        const isValid = await mermaid.parse(formatted, { suppressErrors: true }).catch(() => false);
        if (!isValid) {
          // Fallback to simplified flow
          formatted = `flowchart TD\n  Start["Start Execution"] --> Step1["Initialize Inputs & Variables"] --> Step2["Execute Program Logic"] --> Finish["Return Output / Complete"]`;
        }

        // Clean up any old element with renderId before rendering
        if (typeof document !== "undefined") {
          const old = document.getElementById(renderId);
          if (old) old.remove();
        }

        const { svg: rendered } = await mermaid.render(renderId, formatted);
        if (!cancelled) {
          setSvg(rendered);
          setLoading(false);
        }
      } catch {
        // Provide graceful fallback flowchart if mermaid.render fails
        if (!cancelled) {
          setSvg(`
            <svg viewBox="0 0 460 260" xmlns="http://www.w3.org/2000/svg" style="max-width: 100%; height: auto;">
              <defs>
                <marker id="arrow" viewBox="0 0 10 10" refX="5" refY="5" markerWidth="6" markerHeight="6" orient="auto-start-reverse">
                  <path d="M 0 0 L 10 5 L 0 10 z" fill="#D4AF37" />
                </marker>
              </defs>
              <!-- Node 1: Start -->
              <rect x="150" y="20" width="160" height="40" rx="20" fill="#141a24" stroke="#D4AF37" stroke-width="1.5"/>
              <text x="230" y="45" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Start Execution</text>
              <line x1="230" y1="60" x2="230" y2="90" stroke="#D4AF37" stroke-width="1.5" marker-end="url(#arrow)"/>

              <!-- Node 2: Process -->
              <rect x="140" y="90" width="180" height="44" rx="8" fill="#0f141c" stroke="#D4AF37" stroke-width="1.5"/>
              <text x="230" y="117" fill="#E8C97A" font-family="monospace" font-size="11.5" text-anchor="middle">Process Instructions</text>
              <line x1="230" y1="134" x2="230" y2="164" stroke="#D4AF37" stroke-width="1.5" marker-end="url(#arrow)"/>

              <!-- Node 3: Output & End -->
              <rect x="150" y="164" width="160" height="40" rx="20" fill="#141a24" stroke="#D4AF37" stroke-width="1.5"/>
              <text x="230" y="189" fill="#FFFFFF" font-family="monospace" font-size="12" font-weight="bold" text-anchor="middle">Complete / End</text>
            </svg>
          `);
          setLoading(false);
        }
      } finally {
        if (typeof document !== "undefined") {
          document.querySelectorAll(`[id^="dmermaid"], .error-icon, svg[id^="dmermaid"]`).forEach((el) => el.remove());
        }
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [definition]);

  if (loading && !svg) {
    return (
      <div className="flex flex-col items-center justify-center py-10 gap-2">
        <span className="h-5 w-5 rounded-full border-2 border-[#D4AF37] border-t-transparent animate-spin" />
        <span className="text-[11px] font-mono text-zinc-400">Rendering flowchart…</span>
      </div>
    );
  }

  return (
    <div
      className="[&_svg]:max-w-full [&_svg]:h-auto flex justify-center overflow-x-auto py-3 bg-black/40 rounded-xl border border-white/5"
      dangerouslySetInnerHTML={{ __html: svg || "" }}
    />
  );
}
