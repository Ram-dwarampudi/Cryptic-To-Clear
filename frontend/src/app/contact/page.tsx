"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Mail, MessageSquare, Send, CheckCircle2, AlertCircle, HelpCircle, Terminal } from "lucide-react";

export default function ContactPage() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "feedback", message: "" });
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
    <main className="min-h-screen bg-[var(--bg)] text-[var(--ink)] flex flex-col selection:bg-[var(--syn-keyword)] selection:text-white">
      <Navbar />

      <section className="relative pt-32 pb-16 sm:pt-40 sm:pb-24 editor-grid overflow-hidden">
        <div className="blob h-[400px] w-[400px] bg-[var(--syn-keyword)] -top-32 -right-20 opacity-25" />
        <div className="blob h-[350px] w-[350px] bg-[var(--syn-function)] top-20 -left-20 opacity-20" />

        <div className="relative mx-auto max-w-4xl px-5 sm:px-8 text-center">
          <span className="font-mono text-xs text-[var(--syn-function)] uppercase tracking-widest">
            // Get In Touch
          </span>
          <h1 className="font-display text-4xl sm:text-6xl font-bold leading-[1.35] py-3 mt-3">
            Contact & <span className="text-gradient inline-block px-3 py-1">Support</span>
          </h1>
          <p className="mt-4 text-lg text-[var(--ink-dim)] leading-relaxed max-w-2xl mx-auto">
            Have questions about Cryptic to Clear, feedback on compiler error explanations, or integration requests? Send us a message below.
          </p>
        </div>
      </section>

      <section className="py-8 pb-24 mx-auto max-w-6xl px-5 sm:px-8 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          {/* Contact Form */}
          <div className="lg:col-span-7 glass-strong rounded-3xl p-8 sm:p-10 border border-white/10">
            <h3 className="font-display text-2xl font-bold mb-2">Send Message</h3>
            <p className="text-xs text-[var(--ink-dim)] mb-6">
              We respond to inquiries within 24 hours.
            </p>

            {submitted ? (
              <div className="p-8 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 text-center">
                <CheckCircle2 className="h-12 w-12 text-emerald-400 mx-auto mb-3 animate-bounce" />
                <h4 className="font-display font-semibold text-lg text-emerald-400">Message Received!</h4>
                <p className="text-xs text-[var(--ink-dim)] mt-2">
                  Thank you for reaching out to Cryptic to Clear. We appreciate your feedback!
                </p>
                <button
                  onClick={() => {
                    setSubmitted(false);
                    setFormData({ name: "", email: "", subject: "feedback", message: "" });
                  }}
                  className="mt-6 px-5 py-2 rounded-xl text-xs font-semibold bg-white/10 hover:bg-white/20 transition-all"
                >
                  Send Another Message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="flex flex-col gap-4">
                {error && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="h-4 w-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="contact-name" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5">
                      Your Name *
                    </label>
                    <input
                      id="contact-name"
                      type="text"
                      placeholder="Alex Dev"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--syn-function)] transition-colors"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-email" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5">
                      Email Address *
                    </label>
                    <input
                      id="contact-email"
                      type="email"
                      placeholder="alex@example.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--syn-function)] transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="contact-subject" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5">
                    Topic / Subject
                  </label>
                  <select
                    id="contact-subject"
                    value={formData.subject}
                    onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-2.5 text-sm text-[var(--ink)] focus:outline-none focus:border-[var(--syn-function)] transition-colors"
                  >
                    <option value="feedback" className="bg-[var(--panel)] text-[var(--ink)]">Product Feedback & Feature Request</option>
                    <option value="bug" className="bg-[var(--panel)] text-[var(--ink)]">Report a Bug / Compiler Error Issue</option>
                    <option value="integration" className="bg-[var(--panel)] text-[var(--ink)]">API & Self-Hosting Inquiry</option>
                    <option value="other" className="bg-[var(--panel)] text-[var(--ink)]">General Question</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="contact-message" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5">
                    Message *
                  </label>
                  <textarea
                    id="contact-message"
                    rows={5}
                    placeholder="Tell us how we can help or how to improve Cryptic to Clear..."
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-4 py-3 text-sm text-[var(--ink)] placeholder:text-[var(--ink-faint)] focus:outline-none focus:border-[var(--syn-function)] transition-colors resize-none"
                  />
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-xl py-3 px-6 text-sm font-semibold text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] hover:brightness-110 transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50 cursor-pointer"
                >
                  {loading ? (
                    <span>Sending...</span>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      <span>Send Message</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>

          {/* Sidebar Channels & FAQ */}
          <div className="lg:col-span-5 flex flex-col gap-6">
            <div className="glass rounded-2xl p-6 border border-white/10">
              <h4 className="font-display font-semibold text-base mb-4 flex items-center gap-2">
                <HelpCircle className="h-5 w-5 text-[var(--syn-function)]" />
                Frequently Asked Questions
              </h4>

              <div className="flex flex-col gap-4 text-xs text-[var(--ink-dim)]">
                <div>
                  <h5 className="font-semibold text-[var(--ink)] mb-1">
                    Is Cryptic to Clear free to use?
                  </h5>
                  <p>Yes! Cryptic to Clear includes native local compilers and free AI execution fallbacks.</p>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--ink)] mb-1">
                    Which languages are supported?
                  </h5>
                  <p>Full local compilation, remote execution APIs, and AI tutoring are available for C, C++, Java, and Python.</p>
                </div>

                <div>
                  <h5 className="font-semibold text-[var(--ink)] mb-1">
                    How are AI explanations generated?
                  </h5>
                  <p>We use structured JSON schemas mapped directly to LLM providers (Groq, NVIDIA, Gemini) for deterministic output.</p>
                </div>
              </div>
            </div>

            <div className="glass rounded-2xl p-6 border border-white/10">
              <h4 className="font-display font-semibold text-base mb-3 flex items-center gap-2">
                <Terminal className="h-5 w-5 text-[var(--syn-keyword)]" />
                Developer Status
              </h4>
              <p className="text-xs text-[var(--ink-dim)] leading-relaxed">
                Backend Services: <span className="text-emerald-400 font-mono">100% Operational</span> <br />
                Supported Compiler Chains: GCC, G++, OpenJDK, Python 3
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
