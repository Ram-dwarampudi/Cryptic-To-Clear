"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useRouter } from "next/navigation";
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
  Briefcase,
  ShieldCheck,
  Camera,
  X,
} from "lucide-react";
import AvatarPicker from "./AvatarPicker";
import { ACADEMIC_BRANCHES, ACADEMIC_SECTIONS, BRANCH_NAMES } from "@/lib/constants/academic";

interface RegisterFormProps {
  onSwitchTab: (tab: "login") => void;
  onSuccess?: () => void;
  initialRole?: "student" | "faculty";
}

export default function RegisterForm({ onSwitchTab, onSuccess, initialRole = "student" }: RegisterFormProps) {
  const { register } = useAuth();
  const router = useRouter();

  // Role: "student" or "faculty"
  const [role, setRole] = useState<"student" | "faculty">(initialRole);

  useEffect(() => {
    if (initialRole) {
      setRole(initialRole);
    }
  }, [initialRole]);

  // Common fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [avatar, setAvatar] = useState("");
  const [showAvatarModal, setShowAvatarModal] = useState(false);

  // Student specific
  const [rollNo, setRollNo] = useState("");
  const [branch, setBranch] = useState<string>("");
  const [section, setSection] = useState<string>("");

  // Faculty specific
  const [facultyId, setFacultyId] = useState("");
  const [department, setDepartment] = useState("Computer Science & Engineering");
  const [collegeName, setCollegeName] = useState("Apex University of Technology");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Auto-resolve student academic details in real-time
  const resolved = useMemo(() => {
    if (role !== "student") return { rollNo: "", collegeName: "", stream: "", batchYear: null, graduationYear: null };
    return resolveStudentDetails(rollNo, email);
  }, [rollNo, email, role]);

  // Smart suggestion: auto-select branch from roll number if detected and not yet chosen
  useEffect(() => {
    if (role === "student" && rollNo.trim().length >= 4 && !branch) {
      const roll = rollNo.toUpperCase();
      if (roll.includes("57") || roll.includes("CSBS")) setBranch("CSBS");
      else if (roll.includes("05") || roll.includes("CSE")) setBranch("CSE");
      else if (roll.includes("12") || roll.includes("IT")) setBranch("IT");
      else if (roll.includes("54") || roll.includes("AIDS") || roll.includes("AI-DS")) setBranch("AIDS");
      else if (roll.includes("42") || roll.includes("AIML") || roll.includes("AI-ML")) setBranch("AIML");
    }
  }, [rollNo, role, branch]);

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
    setError(null);

    if (role === "student") {
      if (!rollNo.trim() || !name.trim() || !email.trim() || !password) {
        setError("Please fill in Registration Number, Preferred Name, College Email, and Password.");
        return;
      }
      if (!branch) {
        setError("Please select your academic branch (CSE, CSBS, IT, AIDS, AIML).");
        return;
      }
      if (!section) {
        setError("Please select your section (A, B, C, D, E).");
        return;
      }
    } else {
      if (!name.trim() || !email.trim() || !password) {
        setError("Please fill in Full Name, Institutional Email, and Password.");
        return;
      }
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters long.");
      return;
    }

    setLoading(true);

    try {
      const options =
        role === "faculty"
          ? {
              role: "faculty" as const,
              rollNo: facultyId.trim().toUpperCase() || "FAC-" + Math.floor(1000 + Math.random() * 9000),
              collegeName: collegeName.trim(),
              stream: department.trim(),
              avatar: avatar || undefined,
            }
          : {
              role: "student" as const,
              rollNo: rollNo.trim().toUpperCase(),
              branch,
              section,
              avatar: avatar || undefined,
            };

      const res = await register(name.trim(), email.trim(), password, options);

      if (res.success) {
        if (onSuccess) {
          onSuccess();
        } else if (role === "faculty") {
          router.push("/faculty");
        } else {
          router.push("/compiler");
        }
      } else {
        setError(res.message || "Registration failed. Please check your credentials.");
      }
    } catch {
      setError("An unexpected error occurred during registration. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Role Selection Toggle */}
      <div className="grid grid-cols-2 gap-1.5 p-1 bg-[rgba(7,11,20,0.9)] rounded-xl border border-[rgba(212,175,55,0.25)] font-mono text-xs">
        <button
          type="button"
          onClick={() => {
            setRole("student");
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            role === "student"
              ? "btn-gold text-white font-bold shadow-sm"
              : "text-[var(--ink-dim)] hover:text-white"
          }`}
        >
          <UserIcon className="w-3.5 h-3.5" />
          <span>Student</span>
        </button>

        <button
          type="button"
          onClick={() => {
            setRole("faculty");
            setError(null);
          }}
          className={`flex items-center justify-center gap-1.5 py-1.5 rounded-lg font-medium transition-all cursor-pointer ${
            role === "faculty"
              ? "bg-purple-700/85 text-white font-bold shadow-sm border border-purple-400/40"
              : "text-[var(--ink-dim)] hover:text-white"
          }`}
        >
          <GraduationCap className="w-3.5 h-3.5 text-purple-300" />
          <span>Faculty / Educator</span>
        </button>
      </div>

      {/* Role Informative Banner */}
      {role === "faculty" ? (
        <div className="p-3 rounded-xl bg-purple-950/40 border border-purple-500/30 text-purple-200 text-xs font-mono flex items-center gap-2.5">
          <GraduationCap className="w-4 h-4 text-[#E8C97A] shrink-0" />
          <div>
            <span className="font-semibold text-white">Faculty Registration</span>
            <p className="text-[11px] text-white/60 mt-0.5">
              Access Doubt Resolution, Assignment Gradebook & Course Analytics
            </p>
          </div>
        </div>
      ) : null}

      {error && (
        <div className="flex items-center gap-2.5 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-red-400 text-xs font-mono">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* STUDENT REGISTRATION: Registration Number */}
      {role === "student" && (
        <>
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

          {/* Live Auto-Fetched Details Card */}
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
                  <span>Auto-Fetched from Registration Number:</span>
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
                      <span className="text-[var(--ink-faint)] block text-[10px] uppercase">Batch & Class</span>
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

          {/* Academic Branch and Section Selectors */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="register-branch" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
                Academic Branch <span className="text-red-400">*</span>
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
                <select
                  id="register-branch"
                  value={branch}
                  onChange={(e) => {
                    const newBranch = e.target.value;
                    setBranch(newBranch);
                    if (!newBranch) {
                      setSection("");
                    }
                  }}
                  className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-8 py-2 text-sm text-[var(--ink)] transition-all font-mono outline-none cursor-pointer appearance-none"
                  required
                >
                  <option value="" disabled className="bg-[#0a0e18] text-gray-400">
                    -- Select Branch --
                  </option>
                  {ACADEMIC_BRANCHES.map((b) => (
                    <option key={b} value={b} className="bg-[#0a0e18] text-white">
                      {b} ({BRANCH_NAMES[b]})
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[var(--ink-faint)]">
                  ▼
                </div>
              </div>
            </div>

            <div>
              <label htmlFor="register-section" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
                Section <span className="text-red-400">*</span>
                {!branch && <span className="text-[10px] text-amber-400/80 ml-1.5 font-normal">(Select branch first)</span>}
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
                <select
                  id="register-section"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  disabled={!branch}
                  className={`w-full bg-[rgba(10,14,24,0.7)] border rounded-xl pl-10 pr-8 py-2 text-sm transition-all font-mono outline-none appearance-none ${
                    !branch
                      ? "border-white/10 text-[var(--ink-faint)] cursor-not-allowed opacity-60 bg-white/[0.02]"
                      : "border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 text-[var(--ink)] cursor-pointer"
                  }`}
                  required
                >
                  <option value="" disabled className="bg-[#0a0e18] text-gray-400">
                    {branch ? "-- Select Section --" : "-- Choose Branch First --"}
                  </option>
                  {ACADEMIC_SECTIONS.map((sec) => (
                    <option key={sec} value={sec} className="bg-[#0a0e18] text-white">
                      Section {sec}
                    </option>
                  ))}
                </select>
                <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-xs text-[var(--ink-faint)]">
                  ▼
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      {/* FACULTY REGISTRATION: Faculty ID & Department */}
      {role === "faculty" && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label htmlFor="faculty-id" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
                Faculty / Employee ID
              </label>
              <div className="relative">
                <Hash className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
                <input
                  id="faculty-id"
                  type="text"
                  value={facultyId}
                  onChange={(e) => setFacultyId(e.target.value)}
                  placeholder="e.g. FAC-CSE-01"
                  className="w-full bg-[rgba(10,14,24,0.7)] border border-purple-500/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none uppercase"
                />
              </div>
            </div>

            <div>
              <label htmlFor="faculty-dept" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
                Department
              </label>
              <div className="relative">
                <Briefcase className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
                <input
                  id="faculty-dept"
                  type="text"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  placeholder="e.g. Computer Science & Eng"
                  className="w-full bg-[rgba(10,14,24,0.7)] border border-purple-500/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
                  required
                />
              </div>
            </div>
          </div>

          <div>
            <label htmlFor="faculty-college" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
              Institution / College Name
            </label>
            <div className="relative">
              <Building className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
              <input
                id="faculty-college"
                type="text"
                value={collegeName}
                onChange={(e) => setCollegeName(e.target.value)}
                placeholder="e.g. Apex University of Technology"
                className="w-full bg-[rgba(10,14,24,0.7)] border border-purple-500/30 focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
                required
              />
            </div>
          </div>
        </>
      )}

      {/* Avatar Selection (Optional) */}
      <div className="flex items-center justify-between p-2.5 rounded-xl bg-black/40 border border-white/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-[#070b14] border border-[#D4AF37]/30 flex items-center justify-center overflow-hidden shrink-0">
            {avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={avatar} alt="Avatar" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="w-5 h-5 text-[#E8C97A]" />
            )}
          </div>
          <div>
            <span className="text-xs font-bold text-white block">Profile Avatar</span>
            <span className="text-[10px] text-[var(--ink-faint)] block">Default or choose your character</span>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowAvatarModal(true)}
          className="px-2.5 py-1.5 rounded-lg bg-[rgba(212,175,55,0.15)] hover:bg-[rgba(212,175,55,0.25)] border border-[rgba(212,175,55,0.35)] text-[#E8C97A] text-[11px] font-bold transition-all cursor-pointer flex items-center gap-1"
        >
          <Camera className="w-3 h-3" />
          <span>{avatar ? "Change" : "Choose"}</span>
        </button>
      </div>

      {/* Name Input */}
      <div>
        <label htmlFor="register-name" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          {role === "faculty" ? "Full Name & Title" : "Preferred Name"} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <UserIcon className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder={role === "faculty" ? "e.g. Dr. Rajesh Sharma" : "e.g. Ram Dwarampudi"}
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      {/* Email Input */}
      <div>
        <label htmlFor="register-email" className="block text-xs font-mono text-[var(--ink-dim)] mb-1 font-medium">
          {role === "faculty" ? "Institutional Email" : "College Email"} <span className="text-red-400">*</span>
        </label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
          <input
            id="register-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder={role === "faculty" ? "e.g. professor@university.edu" : "e.g. student@college.edu"}
            className="w-full bg-[rgba(10,14,24,0.7)] border border-[rgba(212,175,55,0.2)] focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37]/30 rounded-xl pl-10 pr-3 py-2 text-sm text-[var(--ink)] placeholder-[var(--ink-faint)] transition-all font-mono outline-none"
            required
          />
        </div>
      </div>

      {/* Password Input */}
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
        className={`w-full flex items-center justify-center gap-2 rounded-xl py-2.5 px-4 text-xs font-mono font-bold text-white shadow-lg transition-all disabled:opacity-50 cursor-pointer mt-2 ${
          role === "faculty"
            ? "bg-gradient-to-r from-purple-600 via-indigo-600 to-purple-600 hover:opacity-95 shadow-[0_0_20px_rgba(168,85,247,0.35)]"
            : "btn-gold shadow-[0_0_20px_rgba(212,175,55,0.3)] hover:shadow-[0_0_28px_rgba(232,201,122,0.55)]"
        }`}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : (
          <>
            {role === "faculty" ? (
              <>
                <ShieldCheck className="w-4 h-4 text-purple-200" />
                <span>Create Faculty Account</span>
              </>
            ) : (
              <>
                <Sparkles className="w-3.5 h-3.5 text-white/90" />
                <span>Create Student Account</span>
              </>
            )}
          </>
        )}
      </button>

      {/* Social OAuth */}
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

      {/* Avatar Selection Dialog */}
      <AnimatePresence>
        {showAvatarModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0b1120] border border-[rgba(212,175,55,0.35)] rounded-3xl p-6 max-w-lg w-full shadow-2xl relative space-y-4 text-left"
            >
              <div className="flex items-center justify-between border-b border-white/10 pb-3">
                <h3 className="text-base font-bold text-white font-display flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-[#D4AF37]" />
                  <span>Choose Your Avatar</span>
                </h3>
                <button
                  type="button"
                  onClick={() => setShowAvatarModal(false)}
                  className="p-1 rounded-lg text-[var(--ink-dim)] hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <AvatarPicker
                currentAvatar={avatar}
                onSelect={(selectedUrl) => {
                  setAvatar(selectedUrl);
                  setShowAvatarModal(false);
                }}
                onClose={() => setShowAvatarModal(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </form>
  );
}
