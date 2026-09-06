import Link from "next/link";
import { Code2, Globe, Mail, ArrowUpRight, MessageSquare, BookOpen, ShieldCheck } from "lucide-react";

const FOOTER_COLUMNS = [
  {
    title: "Quick Links",
    links: [
      { label: "Compiler", href: "/compiler" },
      { label: "Features", href: "/features" },
      { label: "Interactive Debugger", href: "/compiler#debugger" },
      { label: "Start Coding", href: "/compiler" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Error Glossary", href: "/#docs" },
      { label: "Language Specs", href: "/features#languages" },
      { label: "AI Diagnostic Engine", href: "/about" },
      { label: "Architecture Overview", href: "/about#architecture" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "Contact Engineering", href: "/contact" },
      { label: "Community Forum", href: "/contact#forum" },
      { label: "Bug Bounty", href: "/contact#security" },
      { label: "Feedback & Suggestions", href: "/contact" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="relative border-t border-[rgba(212,175,55,0.25)] bg-[rgba(7,11,20,0.85)]">
      {/* Top subtle golden shimmer line */}
      <div className="h-px w-full bg-gradient-to-r from-transparent via-[#D4AF37]/50 to-transparent" />

      <div className="mx-auto max-w-7xl px-5 sm:px-8 py-16">
        <div className="grid sm:grid-cols-2 lg:grid-cols-12 gap-10">
          {/* Brand Column */}
          <div className="lg:col-span-4 pr-0 lg:pr-6">
            <Link href="/" className="flex items-center gap-3 group">
              <img
                src="/logo-icon.png"
                alt="Cryptic to Clear Logo"
                className="h-10 sm:h-11 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]"
              />
              <div className="flex flex-col justify-center leading-none">
                <span className="font-logo-title font-bold text-[18px] tracking-[0.06em] text-[var(--ink)]">
                  CRYPTIC
                </span>
                <span className="font-sans font-semibold text-[10px] tracking-[0.3em] text-[#E8C97A] mt-0.5">
                  TO CLEAR
                </span>
              </div>
            </Link>

            <p className="mt-4 text-sm text-[var(--ink-dim)] max-w-sm leading-relaxed font-normal">
              A modern coding environment built with timeless aesthetics. Combining instant multi-language compilation with plain-English AI error clarity.
            </p>

            <div className="mt-6 flex items-center gap-3">
              {[
                { icon: Code2, label: "Code Repository", href: "https://github.com" },
                { icon: Globe, label: "Network Status", href: "#" },
                { icon: Mail, label: "Direct Support", href: "/contact" },
              ].map((item, i) => (
                <a
                  key={i}
                  href={item.href}
                  aria-label={item.label}
                  className="h-9 w-9 flex items-center justify-center rounded-lg glass border border-[rgba(212,175,55,0.2)] text-[var(--ink-dim)] hover:text-[#E8C97A] hover:border-[rgba(212,175,55,0.5)] hover:shadow-[0_0_15px_rgba(212,175,55,0.25)] transition-all"
                >
                  <item.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Structured Columns separated by thin gold lines */}
          <div className="lg:col-span-8 grid sm:grid-cols-3 gap-8">
            {FOOTER_COLUMNS.map((col, idx) => (
              <div
                key={col.title}
                className={`relative ${
                  idx > 0 ? "lg:border-l lg:border-[rgba(212,175,55,0.15)] lg:pl-8" : ""
                }`}
              >
                <div className="flex items-center gap-2 mb-4">
                  <h4 className="font-serif font-bold text-[14px] tracking-wide text-[#E8C97A]">
                    {col.title}
                  </h4>
                  <div className="h-px flex-1 bg-gradient-to-r from-[rgba(212,175,55,0.3)] to-transparent" />
                </div>

                <ul className="space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.label}>
                      <Link
                        href={link.href}
                        className="group inline-flex items-center gap-1.5 text-sm text-[var(--ink-dim)] hover:text-[#f7f3eb] transition-all duration-200 transform hover:translate-x-1"
                      >
                        <span className="h-1 w-1 rounded-full bg-[rgba(212,175,55,0.4)] group-hover:bg-[#E8C97A] transition-colors" />
                        <span className="group-hover:text-[#E8C97A] group-hover:drop-shadow-[0_0_8px_rgba(212,175,55,0.35)] transition-colors">
                          {link.label}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom bar with thin gold line */}
        <div className="mt-14 pt-6 border-t border-[rgba(212,175,55,0.18)] flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--ink-faint)] font-mono">
            &copy; {new Date().getFullYear()} Cryptic to Clear. Timeless craftsmanship.
          </p>
          <div className="flex items-center gap-6 text-xs text-[var(--ink-faint)] font-mono">
            <Link href="/#privacy" className="hover:text-[#E8C97A] transition-colors">
              Privacy Notice
            </Link>
            <span className="h-1 w-1 rounded-full bg-[rgba(212,175,55,0.4)]" />
            <Link href="/#terms" className="hover:text-[#E8C97A] transition-colors">
              Terms of Service
            </Link>
            <span className="h-1 w-1 rounded-full bg-[rgba(212,175,55,0.4)]" />
            <Link href="/contact" className="hover:text-[#E8C97A] transition-colors">
              Security
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
