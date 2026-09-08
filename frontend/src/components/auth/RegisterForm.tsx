"use client";

import React, { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "@/context/AuthContext";
import OAuthButtons from "./OAuthButtons";
import { resolveStudentDetails } from "@/lib/studentLookup";
import {
  User as UserIcon,
  Mail,
  Lock,
  Loader2,
  AlertCircle,
  Eye,
  EyeOff,
  Hash,
  Sparkles,
  Building,
  GraduationCap,
  Calendar,
} from "lucide-react";

interface RegisterFormProps {
  onSwitchTab: (tab: "login") => void;
  onSuccess?: () => void;
}

export default function RegisterForm({ onSwitchTab, onSuccess }: RegisterFormProps) {
  const { register } = useAuth();
  const [rollNo, setRollNo] = useState("");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-resolve academic details in real-time as registration number & email change
  const resolved = useMemo(() => {
    return resolveStudentDetails(rollNo, email);
  }, [rollNo, email]);

  // Compute password strength score (0-3)
  const getPasswordStrength = () => {
    if (!password) return 0;
    let score = 0;
    if (password.length >= 6) score += 1;
    if (password.length >= 10 || /[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;
    return score;
  };

  const strength = getPasswordStrength();
  const strengthLabels = ["", "Weak", "Moderate", "Strong"];
  const strengthColors = ["", "bg-red-400", "bg-amber-400", "bg-emerald-400"];
  const strengthTextColors = ["", "text-red-400", "text-amber-400", "text-emerald-400"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!rollNo.trim() || !name.trim() || !email.trim() || !password) {
      setError("Please fill in Registration Number, Preferred Name, College Email, and Password.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setError(null);
    setLoading(true);

    try {
      const res = await register(name.trim(), email.trim(), password, {
        role: "student",
        rollNo: rollNo.trim().toUpperCase(),
      });
      if (res.success) {
        if (onSuccess) onSuccess();
      } else {
        setError(res.message || "Registration failed. Please try another email or registration number.");
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

      {/* 1. Registration Number */}
      <div>
        <label htmlFor="register-roll" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          Registration / Roll Number <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-roll"
            type="text"
            value={rollNo}
            onChange={(e) => setRollNo(e.target.value)}
            placeholder="e.g. 24CSE104 or 24PA1A0501"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none uppercase"
            required
          />
        </div>
      </div>

      {/* Live Auto-Fetched Details Card from Registration Number */}
      <AnimatePresence>
        {rollNo.trim().length >= 3 && (
          <motion.div
            initial={{ opacity: 0, y: -6, height: 0 }}
            animate={{ opacity: 1, y: 0, height: "auto" }}
            exit={{ opacity: 0, y: -6, height: 0 }}
            className="rounded-2xl p-3.5 bg-gradient-to-br from-[rgba(212,175,55,0.08)] to-transparent border border-[rgba(212,175,55,0.25)] text-xs font-mono shadow-sm overflow-hidden"
          >
            <div className="flex items-center gap-1.5 text-[#E8C97A] font-bold text-[11px] mb-2">
              <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Details Fetched from Registration Number:</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
              <div className="flex items-start gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[var(--ink-faint)] block text-[10px] uppercase">Department / Stream</span>
                  <span className="text-white font-semibold">{resolved.stream || "Engineering"}</span>
                </div>
              </div>

              <div className="flex items-start gap-1.5">
                <Calendar className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                <div>
                  <span className="text-[var(--ink-faint)] block text-[10px] uppercase">Batch &amp; Class</span>
                  <span className="text-white font-semibold">
                    {resolved.batchYear ? `Batch ${resolved.batchYear} • Class of ${resolved.graduationYear}` : "Auto-Calculated"}
                  </span>
                </div>
              </div>

              {resolved.collegeName && (
                <div className="col-span-1 sm:col-span-2 flex items-start gap-1.5 pt-1 border-t border-white/5">
                  <Building className="w-3.5 h-3.5 text-[#D4AF37] shrink-0 mt-0.5" />
                  <div className="truncate">
                    <span className="text-[var(--ink-faint)] block text-[10px] uppercase">Institution</span>
                    <span className="text-white font-semibold truncate block">{resolved.collegeName}</span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* 2. Preferred Name */}
      <div>
        <label htmlFor="register-name" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          Preferred Name <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Ram Dwarampudi"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      {/* 3. College Email */}
      <div>
        <label htmlFor="register-email" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          College Email <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="e.g. student@college.edu or name@vitb.ac.in"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      {/* 4. Password */}
      <div>
        <label htmlFor="register-password" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          Password <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-password"
            type={showPassword ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="At least 6 characters"
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-10 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
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

        {/* Real-time Password Strength Meter */}
        {password.length > 0 && (
          <div className="mt-2 space-y-1">
            <div className="flex items-center justify-between text-[10px] font-mono">
              <span className="text-[var(--ink-dim)]">Password Strength:</span>
              <span className={`font-semibold ${strengthTextColors[strength]}`}>
                {strengthLabels[strength]}
              </span>
            </div>
            <div className="grid grid-cols-3 gap-1.5 h-1">
              <div className={`h-full rounded-full transition-all ${strength >= 1 ? strengthColors[strength] : "bg-white/10"}`} />
              <div className={`h-full rounded-full transition-all ${strength >= 2 ? strengthColors[strength] : "bg-white/10"}`} />
              <div className={`h-full rounded-full transition-all ${strength >= 3 ? strengthColors[strength] : "bg-white/10"}`} />
            </div>
          </div>
        )}
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full btn-gold flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-white shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_28px_rgba(232,201,122,0.55)] transition-all disabled:opacity-50 cursor-pointer mt-2"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            <Sparkles className="w-3.5 h-3.5 text-white/90" />
            <span>Create Student Account</span>
          </>
        )}
      </button>

      <div className="relative my-3">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-[rgba(212,175,55,0.18)]" />
        </div>
        <div className="relative flex justify-center text-[10px] uppercase font-mono tracking-wider">
          <span className="bg-[#0b101c] px-2 text-[var(--ink-faint)]">Or register with</span>
        </div>
      </div>

      <OAuthButtons onSuccess={onSuccess} />

      <p className="text-center text-xs font-mono text-[var(--ink-dim)] mt-3">
        Already have an account?{" "}
        <button
          type="button"
          onClick={() => onSwitchTab("login")}
          className="text-[#E8C97A] hover:underline font-semibold cursor-pointer"
        >
          Sign In
        </button>
      </p>
    </form>
  );
}
