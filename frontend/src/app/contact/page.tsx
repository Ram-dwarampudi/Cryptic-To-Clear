"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import {
  Mail,
  Send,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Terminal,
  MapPin,
  Clock,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    subject: "feedback",
    message: "",
  });
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim() || !formData.email.trim() || !formData.message.trim()) {
      setError("Please fill out all required fields.");
      return;
    }

    setError("");
    setLoading(true);

    setTimeout(() => {
      setLoading(false);
      setSubmitted(true);
    }, 800);
  };

  return (
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[#D4AF37] selection:text-black">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 editor-grid overflow-hidden border-b border-[rgba(212,175,55,0.15)]">
        <div className="blob h-[420px] w-[420px] bg-[#D4AF37] -top-32 -right-20 opacity-15" />
        <div className="blob h-[360px] w-[360px] bg-[#E8C97A] top-20 -left-20 opacity-10" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <span className="font-mono text-xs text-[#E8C97A] uppercase tracking-widest px-3 py-1 rounded-full bg-[#D4AF37]/10 border border-[#D4AF37]/30 inline-flex items-center gap-1.5">
            <Sparkles className="h-3 w-3 text-[#D4AF37]" />
            Campus Support &amp; Inquiries
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.35] py-3 mt-4 text-white">
            Contact &amp; <span className="text-gradient inline-block px-3 py-1">Assistance</span>
          </h1>
          <p className="mt-4 text-base sm:text-lg text-zinc-300 leading-relaxed max-w-2xl mx-auto">
            Have questions about Cryptic to Clear, compiler error diagnostics, faculty assignment setup, or student doubt clearing? Reach out to our campus team.
          </p>
        </div>
      </section>

      {/* Main Content Section */}
      <section className="py-12 pb-24 mx-auto max-w-7xl px-5 sm:px-8 w-full flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Contact Form */}
          <div className="lg:col-span-7 glass-strong rounded-3xl p-8 sm:p-10 border border-[rgba(212,175,55,0.25)] shadow-2xl relative overflow-hidden">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-display text-2xl font-bold text-white font-serif">
                Send Message
              </h3>
              <span className="text-[11px] font-mono text-[#E8C97A] px-2.5 py-1 rounded bg-[#D4AF37]/10 border border-[#D4AF37]/20">
                Direct Helpdesk
              </span>
            </div>
            <p className="text-xs text-zinc-400 mb-6">
              Our campus faculty coordinators and technical team review submissions daily.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-center">
                <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center">
                  <CheckCircle2 className="h-8 w-8 text-[#E8C97A]" />
                </div>
                <h4 className="font-display font-semibold text-xl text-white">
                  Message Transmitted!
                </h4>
                <p className="text-xs text-zinc-300 mt-2 max-w-md mx-auto leading-relaxed">
                  Thank you for contacting Cryptic to Clear. We have logged your request and a member of the academic technical team will be in touch shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "feedback", message: "" });
                  }}
                  className="mt-6 px-6 py-2.5 rounded-xl text-xs font-semibold text-black bg-gradient-to-r from-[#D4AF37] via-[#E8C97A] to-[#D4AF37] hover:brightness-110 transition-all cursor-pointer shadow-lg shadow-[#D4AF37]/20"
                >
                  Send Another Inquiry
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-red-200 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0 text-red-400" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div>
                    <label
                      htmlFor="contact-name"
                      className="block text-xs font-mono text-[#E8C97A] mb-2 uppercase tracking-wide"
                    >
                      Your Full Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="e.g. Ram Dwarampudi"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor="contact-email"
                      className="block text-xs font-mono text-[#E8C97A] mb-2 uppercase tracking-wide"
                    >
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="student@svecw.edu.in"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label
                    htmlFor="contact-subject"
                    className="block text-xs font-mono text-[#E8C97A] mb-2 uppercase tracking-wide"
                  >
                    Inquiry Topic
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                  >
                    <option value="feedback">
                      Platform Feedback &amp; Feature Recommendations
                    </option>
                    <option value="bug">
                      Report Compiler Error or Execution Issue
                    </option>
                    <option value="assignment">
                      Faculty Assignment &amp; Test Case Support
                    </option>
                    <option value="doubts">
                      Doubt Forum &amp; Direct Messaging Questions
                    </option>
                    <option value="general">
                      General Academic Inquiry
                    </option>
                  </select>
                </div>

                <div>
                  <label
                    htmlFor="contact-message"
                    className="block text-xs font-mono text-[#E8C97A] mb-2 uppercase tracking-wide"
                  >
                    Your Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Provide detailed information regarding your inquiry, error log, or question..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[rgba(212,175,55,0.25)] rounded-xl px-4 py-3 text-sm text-white placeholder:text-zinc-500 focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3.5 px-6 text-sm font-bold text-black bg-gradient-to-r from-[#D4AF37] via-[#E8C97A] to-[#D4AF37] hover:brightness-110 transition-all shadow-lg shadow-[#D4AF37]/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Transmitting Message...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Submit Inquiry</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Campus Info & FAQs */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            {/* Campus & Lab Info */}
            <div className="glass rounded-2xl p-6 border border-[rgba(212,175,55,0.25)]">
              <h4 className="font-display font-semibold text-base mb-4 flex items-center gap-2 text-white">
                <GraduationCap className="h-5 w-5 text-[#E8C97A]" />
                Campus Academic Hub
              </h4>

              <div className="space-y-4 text-xs text-zinc-300">
                <div className="flex items-start gap-3">
                  <MapPin className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Department of CSE &amp; IT</strong>
                    <span>Vishnu Educational Society, Bhimavaram</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Official Support Email</strong>
                    <span className="font-mono text-[#E8C97A]">support@cryptictoclear.edu</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="h-4 w-4 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div>
                    <strong className="text-white block">Lab &amp; Helpdesk Hours</strong>
                    <span>Monday – Saturday: 08:30 AM – 06:00 PM IST</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick FAQs */}
            <div className="glass rounded-2xl p-6 border border-[rgba(212,175,55,0.25)]">
              <h4 className="font-display font-semibold text-base mb-4 flex items-center gap-2 text-white">
                <HelpCircle className="h-5 w-5 text-[#E8C97A]" />
                Frequently Asked Questions
              </h4>

              <div className="flex flex-col gap-4 text-xs text-zinc-300">
                <div className="pb-3 border-b border-white/5">
                  <h5 className="font-semibold text-white mb-1">
                    Who can resolve doubts in the forum?
                  </h5>
                  <p className="text-zinc-400 leading-relaxed">
                    Both peers and faculty members can provide explanations. Faculty endorsed answers are highlighted with official badges and verified test cases.
                  </p>
                </div>

                <div className="pb-3 border-b border-white/5">
                  <h5 className="font-semibold text-white mb-1">
                    How can I direct message an answer author?
                  </h5>
                  <p className="text-zinc-400 leading-relaxed">
                    Click the &quot;Message&quot; button directly on any answer card in the Doubt Forum to start an encrypted direct conversation.
                  </p>
                </div>

                <div>
                  <h5 className="font-semibold text-white mb-1">
                    Where can I read the platform architecture?
                  </h5>
                  <p className="text-zinc-400 leading-relaxed">
                    The complete platform mission and system architecture are combined into the{" "}
                    <a href="/features#about" className="text-[#E8C97A] underline hover:text-white">
                      Features &amp; About
                    </a>{" "}
                    section.
                  </p>
                </div>
              </div>
            </div>

            {/* Service Status */}
            <div className="glass rounded-2xl p-6 border border-[rgba(212,175,55,0.25)]">
              <div className="flex items-center justify-between mb-2">
                <h4 className="font-display font-semibold text-sm flex items-center gap-2 text-white">
                  <Terminal className="h-4 w-4 text-[#D4AF37]" />
                  Execution Infrastructure Status
                </h4>
                <span className="flex items-center gap-1.5 text-[11px] font-mono text-[#E8C97A]">
                  <span className="h-2 w-2 rounded-full bg-[#D4AF37] animate-pulse" />
                  ONLINE
                </span>
              </div>
              <p className="text-xs text-zinc-400 leading-relaxed">
                Native Toolchains (GCC, G++, JDK, Python 3) and AI Fallback Tiers (Groq, NVIDIA NIM) operating normally.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
