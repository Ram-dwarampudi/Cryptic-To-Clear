"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowRight, PlayCircle, Loader2 } from "lucide-react";
import EditorMockup from "./EditorMockup";
import FloatingSnippets from "./FloatingSnippets";

export default function Hero() {
  const router = useRouter();
  const [navigating, setNavigating] = useState(false);

  useEffect(() => {
    // Eagerly prefetch compiler assets as soon as home page loads
    router.prefetch("/compiler");
  }, [router]);
  return (
    <section className="relative pt-32 sm:pt-40 pb-24 sm:pb-32 overflow-hidden gold-vignette">
      {/* Ambient gradient gold blobs */}
      <div className="blob h-[450px] w-[450px] bg-[rgba(212,175,55,0.2)] -top-36 -left-32" />
      <div className="blob h-[400px] w-[400px] bg-[rgba(126,182,255,0.12)] top-20 -right-24" />
      <div className="blob h-[320px] w-[320px] bg-[rgba(232,201,122,0.15)] bottom-0 left-1/3" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8 grid lg:grid-cols-2 gap-16 items-center">
        {/* Left: copy */}
        <div className="text-center lg:text-left">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="inline-flex items-center gap-2 rounded-full glass px-4 py-1.5 mb-6 font-mono text-[12px] text-[#E8C97A] border border-[rgba(212,175,55,0.35)] shadow-[0_0_15px_rgba(212,175,55,0.15)]"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-[#D4AF37] animate-pulse" />
            Cryptic to Clear &bull; Timeless Aesthetics
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="font-serif-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-bold leading-[1.36] text-[var(--ink)] py-3"
          >
            A Modern Coding Space with{" "}
            <span className="text-gold-gradient font-serif italic inline-block px-2 py-0.5">
              Timeless
            </span>{" "}
            <span className="text-gold-gradient font-serif italic inline-block px-2 py-0.5">
              Aesthetics
            </span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.25 }}
            className="mt-6 font-elaborate-sub text-base sm:text-lg text-[var(--ink-dim)] max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal"
          >
            Step into a distraction-free, classically refined coding environment. Write code, execute instantly, and turn cryptic errors into crystal-clear AI insights.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            className="mt-9 flex flex-col sm:flex-row items-center gap-4 justify-center lg:justify-start"
          >
            <Link
              href="/compiler"
              prefetch={true}
              className="btn-gold px-7 py-3.5 text-sm font-bold text-white shadow-[0_0_25px_rgba(212,175,55,0.45)] hover:shadow-[0_0_38px_rgba(232,201,122,0.7)] gap-2 w-full sm:w-auto"
            >
              <span>Start Coding</span>
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/features"
              className="inline-flex items-center justify-center gap-2 rounded-xl px-6 py-3.5 text-sm font-medium text-[var(--ink)] glass hover:border-[rgba(212,175,55,0.4)] hover:shadow-[0_0_18px_rgba(212,175,55,0.2)] hover:text-[#E8C97A] transition-all transform hover:scale-[1.02] active:scale-[0.98] w-full sm:w-auto"
            >
              <PlayCircle className="h-4 w-4 text-[#E8C97A]" />
              Explore Features
            </Link>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.6 }}
            className="mt-10 flex items-center gap-6 justify-center lg:justify-start font-mono text-[12px] text-[var(--ink-faint)]"
          >
            <span className="text-[var(--ink-dim)] font-medium">4 languages</span>
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
            <span className="text-[var(--ink-dim)] font-medium">Instant execution</span>
            <span className="h-1 w-1 rounded-full bg-[#D4AF37]" />
            <span className="text-[var(--ink-dim)] font-medium">No signup required</span>
          </motion.div>
        </div>

        {/* Right: editor mockup */}
        <div className="relative">
          <EditorMockup />
        </div>
      </div>
    </section>
  );
}
