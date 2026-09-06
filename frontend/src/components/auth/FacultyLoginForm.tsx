"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useRouter } from "next/navigation";
import { Mail, Lock, Loader2, AlertCircle, CheckSquare, Square, Sparkles, GraduationCap, Eye, EyeOff, ShieldCheck } from "lucide-react";

interface FacultyLoginFormProps {
  onSwitchTab: (tab: "register" | "forgot") => void;
  onSuccess?: () => void;
}

export default function FacultyLoginForm({ onSwitchTab, onSuccess }: FacultyLoginFormProps) {
  const { login, loginAsFacultyDemo, closeAuthModal } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [demoLoading, setDemoLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please enter your institutional email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        closeAuthModal();
        if (onSuccess) onSuccess();
        router.push("/faculty");
      } else {
        setError(res.message || "Failed to authenticate faculty credentials.");
      }
    } catch {
      setError("An unexpected error occurred during faculty sign in.");
    } finally {
      setLoading(false);
    }
  };

  const handleTryFacultyDemo = async () => {
    setError(null);
    setDemoLoading(true);
    try {
      const res = await loginAsFacultyDemo();
      if (res.success) {
        closeAuthModal();
        if (onSuccess) onSuccess();
        router.push("/faculty");
      } else {
        setError(res.message || "Failed to initialize Faculty Demo Mode.");
      }
    } catch {
      setError("An error occurred while loading Faculty Demo.");
    } finally {
      setDemoLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="p-3 rounded-xl bg-gradient-to-r from-purple-500/10 via-[rgba(212,175,55,0.1)] to-purple-500/10 border border-purple-500/25 text-purple-200 text-xs font-mono flex items-center gap-2.5">
        <GraduationCap className="w-4 h-4 text-[#E8C97A] shrink-0" />
        <div>
          <span className="font-semibold text-white">Faculty & Institutional Access</span>
          <p className="text-[11px] text-[var(--ink-dim)] mt-0.5">Includes Assignment Manager, Doubt Resolution & Analytics</p>
        </div>
      </div>

      {/* 1-Click Faculty Demo CTA */}
      <button
        type="button"
        onClick={handleTryFacultyDemo}
        disabled={loading || demoLoading}
        className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl bg-gradient-to-r from-purple-900/30 via-[rgba(212,175,55,0.12)] to-purple-900/30 border border-purple-500/30 hover:border-[#D4AF37] text-xs font-mono transition-all group cursor-pointer shadow-[0_0_15px_rgba(168,85,247,0.15)] hover:shadow-[0_0_22px_rgba(212,175,55,0.25)]"
      >
        <span className="flex items-center gap-2 text-[#E8C97A] font-semibold">
          <Sparkles className="w-3.5 h-3.5 text-[#D4AF37] group-hover:scale-110 transition-transform" />
          <span>Instant Faculty Demo (Dr. B.V. N. Rani)</span>
        </span>
        <span className="text-[10px] text-purple-300 bg-purple-500/15 px-2 py-0.5 rounded border border-purple-400/20">
          {demoLoading ? <Loader2 className="w-3 h-3 animate-spin inline" /> : "1-Click"}
        </span>
      </button>

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="faculty-email" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5 font-medium">
          Institutional Email (.edu / campus domain)
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="faculty-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="professor@institution.edu"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="faculty-password" className="block text-xs font-mono text-[var(--ink-dim)] font-medium">
            Password
          </label>
          <button
            type="button"
            onClick={() => onSwitchTab("forgot")}
            className="text-xs font-mono text-[#E8C97A] hover:underline cursor-pointer"
          >
            Forgot Password?
          </button>
        </div>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="faculty-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-10 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[var(--ink-faint)] hover:text-[#E8C97A] transition-colors p-0.5 cursor-pointer"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
      </div>

      <div className="flex items-center justify-between text-xs font-mono text-[var(--ink-dim)] pt-0.5">
        <label
          className="flex items-center gap-2 cursor-pointer select-none group"
          onClick={() => setRememberMe(!rememberMe)}
        >
          {rememberMe ? (
            <CheckSquare className="w-4 h-4 text-[#D4AF37]" />
          ) : (
            <Square className="w-4 h-4 text-[var(--ink-faint)] group-hover:text-[var(--ink-dim)]" />
          )}
          <span>Remember Me</span>
        </label>

        <button
          type="button"
          onClick={() => {
            setEmail("faculty@cryptictoclear.io");
            setPassword("Faculty123!");
          }}
          className="text-[11px] text-[#E8C97A] hover:underline font-mono"
        >
          Autofill Demo
        </button>
      </div>

      <button
        type="submit"
        disabled={loading || demoLoading}
        className="w-full btn-gold flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_28px_rgba(232,201,122,0.55)] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <ShieldCheck className="w-3.5 h-3.5 text-white/90" />
            <span>Sign In to Faculty Portal</span>
          </>
        )}
      </button>

      <p className="text-center text-xs font-mono text-[var(--ink-dim)] mt-3">
        Need campus onboarding for your institution?{" "}
        <button
          type="button"
          onClick={() => onSwitchTab("register")}
          className="text-[#E8C97A] hover:underline font-semibold cursor-pointer"
        >
          Institutional Inquiry
        </button>
      </p>
    </form>
  );
}
