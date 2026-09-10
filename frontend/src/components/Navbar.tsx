"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen, ArrowRight, Sparkles, Terminal, LogIn } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./auth/UserMenu";
import { AssignmentItem } from "@/lib/api";

const NAV_LINKS = [
  { label: "Compiler", href: "/compiler" },
  { label: "AI Debugger", href: "/features" },
  { label: "Learn", href: "/doubts" },
  { label: "Docs", href: "/about" },
];

interface NavbarProps {
  activeAssignment?: AssignmentItem | null;
  onOpenAssignmentSelector?: () => void;
}

export default function Navbar({ activeAssignment, onOpenAssignmentSelector }: NavbarProps = {}) {
  const router = useRouter();
  const pathname = usePathname();
  const { user } = useAuth();
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  const isFaculty = user?.role === "faculty" || user?.role === "admin" || user?.isDemoAccount;

  useEffect(() => {
    router.prefetch("/compiler");
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, [router]);

  return (
    <header
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-200 ${
        scrolled
          ? "bg-[#070b14]/90 backdrop-blur-md shadow-lg border-b border-white/10"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Identity */}
        <Link href="/" className="flex items-center gap-3 group py-1">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src="/logo-icon.png"
            alt="Cryptic to Clear Logo"
            className="h-9 sm:h-10 w-auto object-contain drop-shadow-[0_0_12px_rgba(212,175,55,0.3)] group-hover:scale-105 transition-transform"
          />
          <div className="flex flex-col justify-center leading-none">
            <span className="font-extrabold text-[16px] sm:text-[18px] tracking-[0.05em] text-white group-hover:text-[#E8C97A] transition-colors font-mono">
              CRYPTIC <span className="text-[#D4AF37]">→</span> CLEAR
            </span>
            <span className="font-mono text-[9px] tracking-[0.25em] text-slate-400 mt-0.5 uppercase">
              AI Debugger & Compiler
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <ul className="hidden md:flex items-center gap-1 font-mono text-[13px]">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href;
            return (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className={`px-3.5 py-1.5 rounded-lg transition-colors ${
                    isActive
                      ? "text-white font-bold bg-white/10"
                      : "text-slate-300 hover:text-white hover:bg-white/5"
                  }`}
                >
                  {link.label}
                </Link>
              </li>
            );
          })}
        </ul>

        {/* Right CTA Actions */}
        <div className="hidden md:flex items-center gap-3">
          {/* Assignment Selector (if on compiler) */}
          {!isFaculty && onOpenAssignmentSelector && (
            <button
              type="button"
              onClick={onOpenAssignmentSelector}
              title="Open Course Assignments"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-mono border transition-all cursor-pointer shrink-0 ${
                activeAssignment
                  ? "bg-[rgba(212,175,55,0.15)] border-[#D4AF37]/50 text-[#E8C97A] font-semibold"
                  : "bg-white/5 border-white/10 text-slate-300 hover:text-white hover:bg-white/10"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-[#E8C97A]" />
              <span>{activeAssignment ? `Assignment: ${activeAssignment.title.slice(0, 16)}...` : "Assignments"}</span>
            </button>
          )}

          <ThemeToggle />

          {user ? (
            <UserMenu />
          ) : (
            <Link
              href="/login"
              className="text-xs font-mono text-slate-300 hover:text-white px-2.5 py-1.5 rounded-lg hover:bg-white/5 transition-colors"
            >
              Sign In
            </Link>
          )}

          {/* Primary CTA - Start Coding */}
          <Link
            href="/compiler"
            prefetch={true}
            className="btn-gold px-4 py-2 text-xs font-mono font-bold text-black rounded-xl shadow-[0_0_18px_rgba(212,175,55,0.35)] hover:shadow-[0_0_26px_rgba(232,201,122,0.6)] flex items-center gap-1.5 transition-all cursor-pointer"
          >
            <span>Start Coding</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>

        {/* Mobile menu toggle button */}
        <div className="flex items-center gap-2 md:hidden">
          <ThemeToggle />
          <button
            type="button"
            className="text-slate-200 p-2 hover:text-[#E8C97A] transition-colors"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </nav>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="md:hidden overflow-hidden bg-[#070b14] border-t border-white/10 px-5 py-4 space-y-3 font-mono text-sm shadow-2xl"
          >
            <ul className="flex flex-col gap-1">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2 rounded-lg text-slate-300 hover:text-white hover:bg-white/5"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>

            <div className="pt-2 border-t border-white/10 space-y-2">
              <Link
                href="/compiler"
                onClick={() => setOpen(false)}
                className="w-full btn-gold py-2.5 rounded-xl font-bold text-black flex items-center justify-center gap-2 text-xs shadow-md"
              >
                <span>Start Coding Now</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>

              {!user && (
                <Link
                  href="/login"
                  onClick={() => setOpen(false)}
                  className="w-full py-2 rounded-xl text-slate-300 hover:text-white text-xs text-center block bg-white/5 border border-white/10"
                >
                  Sign In / Create Account
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
