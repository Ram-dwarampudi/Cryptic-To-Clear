"use client";

import React, { useState } from "react";
import FacultyProtectedRoute from "@/components/auth/FacultyProtectedRoute";
import Link from "next/link";
import ThemeToggle from "@/components/ThemeToggle";
import UserMenu from "@/components/auth/UserMenu";
import { useAuth } from "@/context/AuthContext";
import {
  LayoutDashboard,
  Users,
  AlertTriangle,
  BookOpen,
  FolderGit2,
  Activity,
  FileSpreadsheet,
  Settings,
  Sparkles,
  Menu,
  X,
  GraduationCap,
  ArrowLeft,
} from "lucide-react";

const NAV_ITEMS = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "students", label: "Students", icon: Users },
  { id: "errors", label: "Error Analytics", icon: AlertTriangle },
  { id: "assignments", label: "Assignments", icon: BookOpen },
  { id: "classes", label: "Classes / Sections", icon: FolderGit2 },
  { id: "activity", label: "Activity", icon: Activity },
  { id: "reports", label: "Reports", icon: FileSpreadsheet },
  { id: "settings", label: "Settings", icon: Settings },
];

export default function FacultyLayout({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <FacultyProtectedRoute>
      <div className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col">
        {/* Top Demo Banner if using Demo Account */}
        {user?.isDemoAccount && (
          <div className="bg-gradient-to-r from-purple-900/40 via-blue-900/40 to-indigo-900/40 border-b border-purple-500/20 px-4 py-2 text-center flex items-center justify-center gap-2 text-xs font-mono">
            <Sparkles className="w-4 h-4 text-purple-400 animate-pulse" />
            <span className="font-semibold text-purple-200">Demo Faculty Account Mode</span>
            <span className="text-[var(--ink-dim)] hidden sm:inline">• Read-only Institutional Preview with Synthetic Student Data</span>
          </div>
        )}

        {/* Top Header Navigation */}
        <header className="h-16 border-b border-[var(--border)] glass-strong sticky top-0 z-40 px-4 sm:px-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden p-2 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>

            <Link href="/" className="flex items-center gap-3 group py-1">
              <img
                src="/logo-icon.png"
                alt="Cryptic to Clear Logo"
                className="h-10 sm:h-11 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,255,255,0.25)] group-hover:scale-105 transition-transform"
              />
              <div className="flex flex-col justify-center leading-none">
                <span className="font-logo-title font-bold text-[17px] sm:text-[19px] tracking-[0.06em] text-[var(--ink)] group-hover:text-[#E8C97A] transition-colors">
                  CRYPTIC
                </span>
                <span className="font-sans font-semibold text-[9px] sm:text-[10px] tracking-[0.3em] text-[#E8C97A] mt-0.5">
                  TO CLEAR
                </span>
              </div>
            </Link>

            <span className="text-xs font-mono px-2.5 py-1 rounded-md bg-purple-500/10 border border-purple-500/20 text-purple-300 font-medium flex items-center gap-1.5 ml-2">
              <GraduationCap className="w-3.5 h-3.5" />
              <span>Faculty Portal</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/compiler"
              className="hidden sm:inline-flex items-center gap-1.5 text-xs font-mono text-[var(--ink-dim)] hover:text-[var(--ink)] px-3 py-1.5 rounded-lg glass border border-white/10 hover:bg-white/5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-[var(--syn-keyword)]" />
              <span>Compiler Workspace</span>
            </Link>

            <ThemeToggle />
            <UserMenu />
          </div>
        </header>

        <div className="flex-1 flex overflow-hidden">
          {/* Desktop Sidebar */}
          <aside className="w-64 border-r border-[var(--border)] glass hidden lg:flex flex-col shrink-0 p-4 space-y-6">
            <div className="px-3 py-2 rounded-xl bg-white/[0.03] border border-[var(--border)]">
              <p className="text-[11px] font-mono text-[var(--ink-dim)] uppercase tracking-wider">Institution</p>
              <p className="text-xs font-bold text-[var(--ink)] truncate mt-0.5">Apex Institute of Tech</p>
              <p className="text-[10px] font-mono text-[var(--syn-keyword)]">Dept. of Computer Science</p>
            </div>

            <nav className="flex-1 space-y-1 font-mono text-xs">
              {NAV_ITEMS.map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      const evt = new CustomEvent("faculty-nav", { detail: item.id });
                      window.dispatchEvent(evt);
                    }}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-all group cursor-pointer"
                  >
                    <Icon className="w-4 h-4 text-[var(--syn-function)] group-hover:scale-110 transition-transform" />
                    <span>{item.label}</span>
                  </button>
                );
              })}
            </nav>

            <div className="p-3 rounded-xl glass border border-purple-500/20 text-xs font-mono space-y-1">
              <p className="text-[10px] text-[var(--ink-dim)] uppercase tracking-wider">Plan Status</p>
              <p className="text-xs font-bold text-purple-300">Enterprise Institutional</p>
              <p className="text-[11px] text-[var(--syn-string)] font-semibold">1,500 Student Seats Active</p>
            </div>
          </aside>

          {/* Mobile Navigation Drawer */}
          {mobileOpen && (
            <div className="fixed inset-0 z-50 lg:hidden flex">
              <div className="fixed inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
              <div className="relative w-64 bg-[var(--panel)] border-r border-[var(--border)] p-4 flex flex-col h-full z-10 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-[var(--border)]">
                  <Link href="/" className="flex items-center gap-2.5 group">
                    <img
                      src="/logo-icon.png"
                      alt="Cryptic to Clear Logo"
                      className="h-8 w-auto object-contain filter drop-shadow-[0_0_10px_rgba(255,255,255,0.2)]"
                    />
                    <div className="flex flex-col justify-center leading-none">
                      <span className="font-logo-title font-bold text-[15px] tracking-[0.06em] text-[var(--ink)]">
                        CRYPTIC
                      </span>
                      <span className="font-sans font-semibold text-[8px] tracking-[0.3em] text-[#E8C97A] mt-0.5">
                        TO CLEAR
                      </span>
                    </div>
                  </Link>
                  <button onClick={() => setMobileOpen(false)} className="p-1 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <nav className="flex-1 space-y-1 font-mono text-xs">
                  {NAV_ITEMS.map((item) => {
                    const Icon = item.icon;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          const evt = new CustomEvent("faculty-nav", { detail: item.id });
                          window.dispatchEvent(evt);
                          setMobileOpen(false);
                        }}
                        className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-all cursor-pointer"
                      >
                        <Icon className="w-4 h-4 text-[var(--syn-function)]" />
                        <span>{item.label}</span>
                      </button>
                    );
                  })}
                </nav>
              </div>
            </div>
          )}

          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 editor-grid">{children}</main>
        </div>
      </div>
    </FacultyProtectedRoute>
  );
}
