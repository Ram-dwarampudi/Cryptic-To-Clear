"use client";

import { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown, Check } from "lucide-react";
import { LANGUAGES, LanguageConfig } from "@/lib/languages";

export default function LanguageDropdown({
  value,
  onChange,
  allowedLanguages,
}: {
  value: string;
  onChange: (id: LanguageConfig["id"]) => void;
  onlySupported?: boolean;
  allowedLanguages?: string[];
}) {
  const [open, setOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [menuPosition, setMenuPosition] = useState<{
    left: number;
    top: number;
    width: number;
  } | null>(null);
  const ref = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement | null>(null);
  const menuRef = useRef<HTMLDivElement | null>(null);

  const filteredLanguages = allowedLanguages && allowedLanguages.length > 0
    ? LANGUAGES.filter((l) => allowedLanguages.map((a) => a.toLowerCase()).includes(l.id.toLowerCase()))
    : LANGUAGES;

  const current = filteredLanguages.find((l) => l.id === value) ?? filteredLanguages[0] ?? LANGUAGES[0];

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    const onClickOutside = (e: MouseEvent) => {
      const target = e.target as Node;
      if (
        ref.current &&
        !ref.current.contains(target) &&
        !(menuRef.current && menuRef.current.contains(target))
      ) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  useEffect(() => {
    if (!open || !buttonRef.current) {
      setMenuPosition(null);
      return;
    }

    const updatePosition = () => {
      const rect = buttonRef.current?.getBoundingClientRect();
      if (rect) {
        setMenuPosition({
          left: rect.left,
          top: rect.bottom + 6,
          width: Math.max(160, rect.width),
        });
      }
    };

    updatePosition();
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        ref={(el) => {
          buttonRef.current = el;
        }}
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="flex items-center gap-2 rounded-lg glass px-3 py-2 text-[13px] font-mono hover:border-[var(--border-strong)] transition-colors min-w-[136px]"
      >
        <span
          className="h-2 w-2 rounded-full shrink-0"
          style={{ background: current.accent }}
        />
        <span className="flex-1 text-left">{current.label}</span>
        <ChevronDown
          className={`h-3.5 w-3.5 text-[var(--ink-faint)] transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {mounted &&
        createPortal(
          <AnimatePresence>
            {open && menuPosition && (
              <motion.div
                ref={menuRef}
                initial={{ opacity: 0, y: -6, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -6, scale: 0.98 }}
                transition={{ duration: 0.12 }}
                onMouseDown={(e) => e.stopPropagation()}
                className="max-h-80 overflow-y-auto rounded-lg p-1.5 shadow-2xl border border-[var(--border-strong)] glass-strong text-[var(--ink)]"
                style={{
                  position: "fixed",
                  left: menuPosition.left,
                  top: menuPosition.top,
                  minWidth: menuPosition.width,
                  zIndex: 999999,
                }}
              >
                {filteredLanguages.map((lang) => (
                  <button
                    key={lang.id}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      onChange(lang.id);
                      setOpen(false);
                    }}
                    className={`w-full flex items-center gap-2.5 rounded-md px-3 py-2 text-[13px] font-mono text-left transition-colors cursor-pointer hover:bg-[var(--border)] ${
                      lang.id === value ? "bg-[var(--border-strong)] text-[var(--ink)] font-semibold" : "text-[var(--ink-dim)]"
                    }`}
                  >
                    <span
                      className="h-2 w-2 rounded-full shrink-0"
                      style={{ background: lang.accent }}
                    />
                    <span className="flex-1 font-mono">{lang.label}</span>
                    {lang.id === value && (
                      <Check className="h-3.5 w-3.5 text-amber-400" />
                    )}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>,
          document.body
        )}
    </div>
  );
}
