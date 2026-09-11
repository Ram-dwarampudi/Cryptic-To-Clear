"use client";

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "@/context/AuthContext";
import { User as UserIcon, LogOut, LayoutDashboard, Sparkles, ChevronDown, GraduationCap } from "lucide-react";
import Link from "next/link";

export default function UserMenu() {
  const { user, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (!user) return null;

  const isFaculty = user.role === "faculty" || user.role === "admin" || user.isDemoAccount;
  const roleDisplay = isFaculty ? "FACULTY" : (user.plan || "free").toUpperCase();
  const planColor = isFaculty
    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
    : user.plan === "pro"
    ? "bg-purple-500/20 text-purple-300 border-purple-500/30"
    : user.plan === "team"
    ? "bg-blue-500/20 text-blue-300 border-blue-500/30"
    : user.plan === "enterprise"
    ? "bg-amber-500/20 text-amber-300 border-amber-500/30"
    : "bg-emerald-500/20 text-emerald-300 border-emerald-500/30";

  return (
    <div className="relative" ref={menuRef}>
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-1.5 rounded-lg glass border border-white/10 hover:bg-white/[0.08] transition-all cursor-pointer"
      >
        {user.avatar ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={user.avatar} alt={user.name} className="w-6 h-6 rounded-full object-cover" />
        ) : (
          <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-[var(--syn-keyword)] to-[var(--syn-function)] flex items-center justify-center text-[10px] font-bold text-[#0a0d13]">
            {user.name.charAt(0).toUpperCase()}
          </div>
        )}
        <span className="text-xs font-mono font-medium text-[var(--ink)] max-w-[100px] truncate">{user.name}</span>
        <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded border ${planColor}`}>{roleDisplay}</span>
        <ChevronDown className="w-3.5 h-3.5 text-[var(--ink-faint)]" />
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-56 rounded-xl glass-strong border border-[var(--border-strong)] shadow-2xl p-2 z-50 animate-in fade-in zoom-in-95 duration-150 text-[var(--ink)]">
          <div className="px-3 py-2 border-b border-[var(--border)]">
            <p className="text-xs font-semibold text-[var(--ink)] truncate">{user.name}</p>
            <p className="text-[11px] font-mono text-[var(--ink-dim)] truncate">{user.email}</p>
          </div>

          <div className="py-1">
            {!isFaculty && (
              <Link
                href="/profile"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-[#E8C97A] hover:bg-[var(--border)] rounded-lg transition-colors font-semibold"
              >
                <UserIcon className="w-4 h-4 text-[#D4AF37]" />
                <span>Student Profile</span>
              </Link>
            )}

            {isFaculty && (
              <Link
                href="/faculty"
                onClick={() => setOpen(false)}
                className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-purple-300 hover:bg-purple-500/15 rounded-lg transition-colors font-bold"
              >
                <GraduationCap className="w-4 h-4 text-purple-400" />
                <span>Faculty Dashboard</span>
              </Link>
            )}

            <Link
              href="/compiler"
              onClick={() => setOpen(false)}
              className="flex items-center gap-2 px-3 py-2 text-xs font-mono text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-[var(--border)] rounded-lg transition-colors"
            >
              <LayoutDashboard className="w-4 h-4 text-[var(--syn-keyword)]" />
              <span>Compiler Workspace</span>
            </Link>
          </div>

          <div className="pt-1 border-t border-[var(--border)]">
            <button
              onClick={async () => {
                setOpen(false);
                await logout("/login");
              }}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs font-mono text-red-400 hover:bg-red-500/10 rounded-lg transition-colors cursor-pointer"
            >
              <LogOut className="w-4 h-4" />
              <span>Log Out</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
