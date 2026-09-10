"use client";

import Link from "next/link";
import { Code2, MessageSquare, Terminal, Sparkles, BookOpen } from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative border-t border-white/10 bg-[#050811] text-slate-400 font-mono text-xs">
      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-14">
        <div className="grid grid-cols-2 md:grid-cols-12 gap-8 lg:gap-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-5 space-y-3">
            <Link href="/" className="flex items-center gap-2.5 text-white font-extrabold text-base tracking-wider">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo-icon.png"
                alt="Logo"
                className="h-7 w-auto object-contain"
              />
              <span>CRYPTIC <span className="text-[#D4AF37]">→</span> CLEAR</span>
            </Link>

            <p className="text-slate-400 text-sm max-w-sm leading-relaxed font-sans">
              Understand errors. Fix code faster. An AI-powered compiler environment turning cryptic errors into plain-English clarity.
            </p>

            <div className="pt-2 flex items-center gap-3 text-slate-400">
              <a
                href="https://github.com"
                target="_blank"
                rel="noreferrer"
                aria-label="GitHub Repository"
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center hover:text-white transition-colors"
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.53 1.032 1.53 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                </svg>
              </a>
              <Link
                href="/doubts"
                aria-label="Community Doubts Forum"
                className="h-8 w-8 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 flex items-center justify-center hover:text-white transition-colors"
              >
                <MessageSquare className="w-4 h-4" />
              </Link>
            </div>
          </div>

          {/* Column: PRODUCT */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Product
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/compiler" className="hover:text-[#E8C97A] transition-colors">
                  Compiler
                </Link>
              </li>
              <li>
                <Link href="/features" className="hover:text-[#E8C97A] transition-colors">
                  AI Debugger
                </Link>
              </li>
              <li>
                <Link href="/compiler?mode=learn" className="hover:text-[#E8C97A] transition-colors">
                  Learning Mode
                </Link>
              </li>
              <li>
                <Link href="/interviews" className="hover:text-[#E8C97A] transition-colors">
                  Interview Archive
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: RESOURCES */}
          <div className="col-span-1 md:col-span-2 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Resources
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <Link href="/about" className="hover:text-[#E8C97A] transition-colors">
                  Documentation
                </Link>
              </li>
              <li>
                <Link href="/features#languages" className="hover:text-[#E8C97A] transition-colors">
                  Languages
                </Link>
              </li>
              <li>
                <Link href="/about#faq" className="hover:text-[#E8C97A] transition-colors">
                  FAQ
                </Link>
              </li>
              <li>
                <Link href="/about#architecture" className="hover:text-[#E8C97A] transition-colors">
                  Architecture
                </Link>
              </li>
            </ul>
          </div>

          {/* Column: COMMUNITY & LEGAL */}
          <div className="col-span-2 md:col-span-3 space-y-3">
            <h4 className="text-white font-bold uppercase tracking-wider text-[11px]">
              Community
            </h4>
            <ul className="space-y-2 text-[12px]">
              <li>
                <a href="https://github.com" target="_blank" rel="noreferrer" className="hover:text-[#E8C97A] transition-colors">
                  GitHub
                </a>
              </li>
              <li>
                <Link href="/contact" className="hover:text-[#E8C97A] transition-colors">
                  Feedback &amp; Bug Reports
                </Link>
              </li>
              <li>
                <Link href="/doubts" className="hover:text-[#E8C97A] transition-colors">
                  Doubt Community
                </Link>
              </li>
              <li>
                <Link href="/login" className="hover:text-[#E8C97A] transition-colors">
                  Educator Portal
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright line */}
        <div className="mt-12 pt-6 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-500">
          <p>&copy; {new Date().getFullYear()} Cryptic to Clear. All rights reserved.</p>
          <div className="flex items-center gap-4">
            <Link href="/about" className="hover:text-slate-300">Privacy Notice</Link>
            <span>•</span>
            <Link href="/about" className="hover:text-slate-300">Terms of Use</Link>
            <span>•</span>
            <Link href="/contact" className="hover:text-slate-300">Security</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
