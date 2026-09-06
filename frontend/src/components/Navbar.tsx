"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, BookOpen } from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { useAuth } from "@/context/AuthContext";
import UserMenu from "./auth/UserMenu";
import { LogIn } from "lucide-react";
import { AssignmentItem } from "@/lib/api";

const NAV_LINKS = [
  { label: "Home", href: "/" },
  { label: "Compiler", href: "/compiler" },
  { label: "Features", href: "/features" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/contact" },
];

interface NavbarProps {
  activeAssignment?: AssignmentItem | null;
  onOpenAssignmentSelector?: () => void;
}

export default function Navbar({ activeAssignment, onOpenAssignmentSelector }: NavbarProps = {}) {
  const router = useRouter();
  const { user, openAuthModal } = useAuth();
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
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-300 ${
        scrolled
          ? "glass-strong shadow-[0_4px_28px_rgba(0,0,0,0.45)] border-b border-[rgba(212,175,55,0.22)]"
          : "bg-transparent border-b border-transparent"
      }`}
    >
      <nav className="mx-auto max-w-7xl px-5 sm:px-8 h-16 flex items-center justify-between">
        {/* Logo */}
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

        {/* Desktop nav */}
        <ul className="hidden md:flex items-center gap-1 font-sans text-[14px]">
          {NAV_LINKS.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                className="relative px-4 py-2 rounded-md font-medium text-[var(--ink-dim)] hover:text-[#f7f3eb] transition-colors group"
              >
                {link.label}
                <span className="absolute left-3 right-3 -bottom-0.5 h-[2px] bg-gradient-to-r from-[#B8860B] via-[#D4AF37] to-[#E8C97A] scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-center rounded-full" />
              </Link>
            </li>
          ))}
        </ul>

        {/* CTA & User Menu */}
        <div className="hidden md:flex items-center gap-3">
          {/* Assignments button — only shown on compiler page for non-faculty users */}
          {!isFaculty && onOpenAssignmentSelector && (
            <button
              onClick={onOpenAssignmentSelector}
              title="Open Course Assignments"
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-[12px] font-mono border transition-all cursor-pointer shrink-0 ${
                activeAssignment
                  ? "bg-[rgba(212,175,55,0.15)] border-[rgba(212,175,55,0.5)] text-[#E8C97A] font-semibold shadow-[0_0_12px_rgba(212,175,55,0.2)]"
                  : "glass text-[var(--ink-dim)] hover:text-[var(--ink)] hover:border-[rgba(212,175,55,0.35)]"
              }`}
            >
              <BookOpen className="h-3.5 w-3.5 text-[#E8C97A]" />
              <span>{activeAssignment ? `Assignment: ${activeAssignment.title.slice(0, 18)}...` : "Assignments"}</span>
            </button>
          )}
          <ThemeToggle />
          {user ? (
            <UserMenu />
          ) : (
            <button
              onClick={() => openAuthModal("login")}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg font-mono text-xs font-medium text-[var(--ink)] glass hover:bg-white/[0.1] hover:border-[rgba(212,175,55,0.4)] border border-[rgba(212,175,55,0.2)] transition-all hover:shadow-[0_0_14px_rgba(212,175,55,0.2)] transform hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <LogIn className="w-3.5 h-3.5 text-[#E8C97A]" />
              <span>Sign In</span>
            </button>
          )}

          <Link
            href="/compiler"
            prefetch={true}
            className="btn-gold px-4 py-2 text-[13px] font-bold text-white shadow-[0_0_22px_rgba(212,175,55,0.4)] hover:shadow-[0_0_32px_rgba(232,201,122,0.65)]"
          >
            Start Coding
          </Link>
        </div>

        {/* Mobile toggle */}
        <div className="flex items-center gap-1 md:hidden">
          <ThemeToggle />
          <button
            className="text-[var(--ink)] p-2"
            onClick={() => setOpen((v) => !v)}
            aria-label="Toggle navigation menu"
            aria-expanded={open}
          >
            {open ? <X className="h-5 w-5 text-[#E8C97A]" /> : <Menu className="h-5 w-5 text-[#E8C97A]" />}
          </button>
        </div>
      </nav>

      {/* Mobile menu */}
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeInOut" }}
            className="md:hidden overflow-hidden glass-strong border-t border-[rgba(212,175,55,0.2)]"
          >
            <ul className="flex flex-col px-5 py-4 gap-1 font-sans text-sm">
              {NAV_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className="block px-3 py-2.5 rounded-md font-medium text-[var(--ink-dim)] hover:text-[#f7f3eb] hover:bg-[rgba(212,175,55,0.08)] transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}

              {/* Assignments button — mobile, only on compiler page for non-faculty users */}
              {!isFaculty && onOpenAssignmentSelector && (
                <li>
                  <button
                    onClick={() => {
                      setOpen(false);
                      onOpenAssignmentSelector();
                    }}
                    className={`w-full flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-mono transition-colors ${
                      activeAssignment
                        ? "bg-[rgba(212,175,55,0.15)] text-[#E8C97A] font-semibold"
                        : "text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5"
                    }`}
                  >
                    <BookOpen className="w-4 h-4 text-[#E8C97A]" />
                    <span>{activeAssignment ? `Assignment: ${activeAssignment.title.slice(0, 18)}...` : "Assignments"}</span>
                  </button>
                </li>
              )}

              {!user && (
                <li className="pt-1">
                  <button
                    onClick={() => {
                      setOpen(false);
                      openAuthModal("login");
                    }}
                    className="w-full flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-mono text-[var(--ink)] glass border border-[rgba(212,175,55,0.25)]"
                  >
                    <LogIn className="w-4 h-4 text-[#E8C97A]" />
                    <span>Sign In / Create Account</span>
                  </button>
                </li>
              )}

              <li className="pt-2">
                <Link
                  href="/compiler"
                  onClick={() => setOpen(false)}
                  className="btn-gold w-full block text-center py-2.5 text-sm font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.4)]"
                >
                  Start Coding
                </Link>
              </li>
            </ul>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
