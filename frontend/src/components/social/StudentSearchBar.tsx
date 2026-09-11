"use client";

import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Search,
  X,
  Loader2,
  User,
  Trophy,
  ExternalLink,
  MessageSquare,
  UserPlus,
} from "lucide-react";
import { searchStudents, LeaderboardStudent } from "@/lib/api";

interface StudentSearchBarProps {
  token?: string | null;
  currentUserId?: string | null;
  localStudents?: LeaderboardStudent[];
  onOpenProfile: (studentId: string, initialData?: any) => void;
  onOpenMessage?: (peer: any) => void;
}

export default function StudentSearchBar({
  token,
  currentUserId,
  localStudents = [],
  onOpenProfile,
  onOpenMessage,
}: StudentSearchBarProps) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<LeaderboardStudent[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Keyboard shortcut '/' to focus
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.key === "/" &&
        document.activeElement?.tagName !== "INPUT" &&
        document.activeElement?.tagName !== "TEXTAREA"
      ) {
        e.preventDefault();
        inputRef.current?.focus();
      }
      if (e.key === "Escape") {
        setIsOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Search effect with debounce
  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setIsOpen(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await searchStudents(query, token);
        if (res.success && res.data && res.data.length > 0) {
          setResults(res.data);
        } else {
          // Fallback to local students filter
          const q = query.toLowerCase();
          const filtered = localStudents.filter(
            (s) =>
              s.name.toLowerCase().includes(q) ||
              s.email.toLowerCase().includes(q) ||
              (s.rollNo && s.rollNo.toLowerCase().includes(q)) ||
              (s.stream && s.stream.toLowerCase().includes(q)) ||
              (s.collegeName && s.collegeName.toLowerCase().includes(q))
          );
          setResults(filtered);
        }
      } catch {
        // Fallback to local
        const q = query.toLowerCase();
        const filtered = localStudents.filter(
          (s) =>
            s.name.toLowerCase().includes(q) ||
            s.email.toLowerCase().includes(q) ||
            (s.rollNo && s.rollNo.toLowerCase().includes(q))
        );
        setResults(filtered);
      } finally {
        setLoading(false);
        setIsOpen(true);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query, token, localStudents]);

  return (
    <div className="relative w-full max-w-lg" ref={containerRef}>
      {/* Search Input Box */}
      <div className="relative flex items-center">
        <Search className="absolute left-3.5 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => {
            if (query.trim() && results.length > 0) setIsOpen(true);
          }}
          placeholder="Search students by name, roll no, handles, or branch..."
          className="w-full pl-10 pr-20 py-2.5 bg-white/[0.04] hover:bg-white/[0.06] focus:bg-[#0c101d] border border-white/10 focus:border-amber-400 rounded-xl text-xs text-white placeholder-gray-400 focus:outline-none transition-all shadow-inner"
        />

        {/* Clear or loading indicator */}
        <div className="absolute right-3 flex items-center gap-1.5">
          {loading ? (
            <Loader2 className="w-4 h-4 text-amber-400 animate-spin" />
          ) : query ? (
            <button
              onClick={() => {
                setQuery("");
                setResults([]);
                setIsOpen(false);
              }}
              className="p-1 rounded-md text-gray-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          ) : (
            <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-mono text-gray-400 bg-white/5 border border-white/10 rounded">
              /
            </kbd>
          )}
        </div>
      </div>

      {/* Autocomplete Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 6, scale: 0.98 }}
            transition={{ duration: 0.15 }}
            className="absolute left-0 right-0 mt-2 bg-[#0c101d] border border-white/10 rounded-2xl shadow-2xl z-50 overflow-hidden max-h-96 overflow-y-auto text-white"
          >
            <div className="p-2 border-b border-white/10 text-[10px] font-mono text-gray-400 flex items-center justify-between px-3 bg-white/[0.02]">
              <span>Students Directory ({results.length} found)</span>
              <span>Press ESC to close</span>
            </div>

            {results.length === 0 ? (
              <div className="p-6 text-center text-xs text-gray-400">
                No students found matching &ldquo;{query}&rdquo;
              </div>
            ) : (
              <div className="divide-y divide-white/5">
                {results.map((student) => {
                  const isSelf = student.id === currentUserId;

                  return (
                    <div
                      key={student.id || student.email}
                      className="p-3 hover:bg-white/[0.06] transition-colors flex items-center justify-between gap-3 cursor-pointer group bg-transparent"
                      onMouseDown={(e) => {
                        // Prevent input blur before click fires
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        onOpenProfile(student.id, student);
                        setIsOpen(false);
                      }}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={
                            student.avatar ||
                            `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(student.email)}`
                          }
                          alt={student.name}
                          className="w-9 h-9 rounded-full border border-white/10 bg-black/40 object-cover flex-shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-semibold text-white group-hover:text-amber-400 transition-colors truncate">
                              {student.name}
                            </span>
                            {isSelf && (
                              <span className="px-1.5 py-0.2 rounded text-[9px] font-mono bg-[#D4AF37] text-black font-extrabold uppercase">
                                You
                              </span>
                            )}
                            {student.rollNo && (
                              <span className="text-[10px] font-mono text-gray-400">
                                #{student.rollNo}
                              </span>
                            )}
                          </div>
                          <div className="text-[11px] text-gray-400 truncate">
                            {student.stream || "Computer Science"} • {student.collegeName || "Vishnu Educational Society"}
                          </div>
                        </div>
                      </div>

                      {/* Right metadata and quick actions */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {student.overallScore !== undefined && (
                          <span className="hidden sm:inline-flex px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20 text-[10px] font-mono font-semibold">
                            {student.overallScore} pts
                          </span>
                        )}

                        <button
                          type="button"
                          onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                          onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onOpenProfile(student.id, student);
                            setIsOpen(false);
                          }}
                          className="px-2.5 py-1 rounded-lg bg-[#D4AF37]/15 hover:bg-[#D4AF37]/25 text-[#E8C97A] border border-[#D4AF37]/30 text-[11px] font-mono font-medium transition-colors flex items-center gap-1 cursor-pointer"
                        >
                          <User className="w-3 h-3" />
                          <span>Profile</span>
                        </button>

                        {!isSelf && onOpenMessage && (
                          <button
                            type="button"
                            onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); }}
                            onClick={(e) => {
                              e.preventDefault();
                              e.stopPropagation();
                              onOpenMessage(student);
                              setIsOpen(false);
                            }}
                            className="p-1.5 rounded-lg bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/20 transition-colors cursor-pointer"
                            title="Message student"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
