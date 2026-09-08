"use client";

import React, { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import OAuthButtons from "./OAuthButtons";
import { Mail, Lock, Loader2, AlertCircle, CheckSquare, Square, Eye, EyeOff, Sparkles, Zap } from "lucide-react";

interface LoginFormProps {
  onSwitchTab: (tab: "register" | "forgot") => void;
  onSuccess?: () => void;
}

export default function LoginForm({ onSwitchTab, onSuccess }: LoginFormProps) {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError("Please fill in both your Registration Number / College Email and password.");
      return;
    }
    setError(null);
    setLoading(true);

    try {
      const res = await login(email, password);
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || "Failed to sign in. Please verify your credentials.");
      }
    } catch {
      setError("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <div>
        <label htmlFor="login-email" className="block text-xs font-mono text-[var(--ink-dim)] mb-1.5 font-medium">
          Registration Number or College Email
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="login-email"
            type="text"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. 24CSE104 or student@college.edu"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2.5 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label htmlFor="login-password" className="block text-xs font-mono text-[var(--ink-dim)] font-medium">
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
            id="login-password"
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
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-gold flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_28px_rgba(232,201,122,0.55)] transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-white/90" />
            <span>Sign In to Student Portal</span>
          </>
        )}
      </button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[rgba(212,175,55,0.18)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
          <span className="bg-[#0b101c] px-2 text-[var(--ink-faint)]">Or continue with</span>
        </div>
      </div>

      <OAuthButtons onSuccess={onSuccess} />

      <p className="text-center text-xs font-mono text-[var(--ink-dim)] mt-3">
        Don&apos;t have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchTab("register")}
          className="text-[#E8C97A] hover:underline font-semibold cursor-pointer"
        >
          Create Free Account
        </button>
      </p>
    </form>
  );
}
