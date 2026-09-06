import Link from "next/link";
import { Home } from "lucide-react";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-[var(--bg)] px-5">
      <div className="glass-strong rounded-xl p-8 max-w-md w-full text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center">
          <img
            src="/logo-icon.png"
            alt="Cryptic to Clear Logo"
            className="h-12 w-auto object-contain filter drop-shadow-[0_0_14px_rgba(255,255,255,0.25)]"
          />
        </div>
        <p className="font-mono text-[13px] text-[var(--syn-const)] mb-2">404</p>
        <h1 className="font-display text-lg font-semibold text-[var(--ink)] mb-2">
          Page not found
        </h1>
        <p className="text-[13px] text-[var(--ink-dim)] leading-relaxed mb-6">
          This route doesn&apos;t compile — the page you&apos;re looking for
          doesn&apos;t exist or has moved.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-[13px] font-medium text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] hover:brightness-110 transition-all"
        >
          <Home className="h-3.5 w-3.5" />
          Go home
        </Link>
      </div>
    </main>
  );
}
