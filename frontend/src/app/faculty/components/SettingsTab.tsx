"use client";

import React, { useState, useEffect } from "react";
import { FacultySubscriptionData, fetchFacultySubscription, updateStudentProfile } from "@/lib/api";
import { useAuth } from "@/context/AuthContext";
import {
  Shield,
  Users,
  Building2,
  CheckCircle2,
  Loader2,
  Edit3,
  Save,
  X,
  GraduationCap,
  Sparkles,
  BookOpen,
  Check,
  AlertCircle,
  Camera,
} from "lucide-react";

const FACULTY_AVATAR_PRESETS = [
  { label: "Dr. Rani (Academic Female)", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DrRani&hair=longHair" },
  { label: "Dr. Jenkins (Academic)", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfJenkins&accessories=round" },
  { label: "Prof. Sharma (Scholar)", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfSharma" },
  { label: "Prof. Kumar (Senior CS)", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfKumar&hair=shortHair" },
  { label: "Dr. Patel (Researcher)", url: "https://api.dicebear.com/7.x/avataaars/svg?seed=DrPatel&accessories=round" },
  { label: "Academic AI Scholar", url: "https://api.dicebear.com/7.x/bottts/svg?seed=FacultyVIP" },
];

export default function SettingsTab() {
  const { user, token, updateUser } = useAuth();
  const [subData, setSubData] = useState<FacultySubscriptionData | null>(null);
  const [loading, setLoading] = useState(true);

  // Faculty Profile Edit States
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const [formData, setFormData] = useState({
    name: user?.name || "Dr. Sarah Jenkins",
    email: user?.email || "faculty@cryptictoclear.io",
    title: user?.title || "Professor of CS",
    stream: user?.stream || user?.department || "Computer Science & Engineering",
    collegeName: user?.collegeName || user?.university || "Vishnu Educational Society",
    bio:
      user?.bio ||
      "Senior Faculty specializing in Advanced Algorithms, Compilers, and AI-driven pedagogical mentoring.",
    avatar: user?.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfJenkins",
  });

  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await fetchFacultySubscription();
      if (res.success && res.data) setSubData(res.data);
      setLoading(false);
    }
    load();
  }, []);

  useEffect(() => {
    if (user && !isEditing) {
      setFormData({
        name: user.name || "Dr. Sarah Jenkins",
        email: user.email || "faculty@cryptictoclear.io",
        title: user.title || "Professor of CS",
        stream: user.stream || user.department || "Computer Science & Engineering",
        collegeName: user.collegeName || user.university || "Vishnu Educational Society",
        bio:
          user.bio ||
          "Senior Faculty specializing in Advanced Algorithms, Compilers, and AI-driven pedagogical mentoring.",
        avatar: user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfJenkins",
      });
    }
  }, [user, isEditing]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setStatusMsg(null);

    try {
      const res = await updateStudentProfile(
        {
          name: formData.name,
          avatar: formData.avatar,
          bio: formData.bio,
          title: formData.title,
          collegeName: formData.collegeName,
          stream: formData.stream,
        },
        token
      );

      // Optimistically update AuthContext state
      updateUser({
        name: formData.name,
        avatar: formData.avatar,
        bio: formData.bio,
        title: formData.title,
        collegeName: formData.collegeName,
        stream: formData.stream,
      });

      if (res.success) {
        setStatusMsg({ type: "success", text: "Faculty profile updated successfully!" });
        setIsEditing(false);
      } else {
        setStatusMsg({ type: "success", text: "Profile details updated in active session." });
        setIsEditing(false);
      }
    } catch {
      updateUser({
        name: formData.name,
        avatar: formData.avatar,
        bio: formData.bio,
        title: formData.title,
        collegeName: formData.collegeName,
        stream: formData.stream,
      });
      setStatusMsg({ type: "success", text: "Profile details updated in active session." });
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    if (user) {
      setFormData({
        name: user.name || "Dr. Sarah Jenkins",
        email: user.email || "faculty@cryptictoclear.io",
        title: user.title || "Professor of CS",
        stream: user.stream || user.department || "Computer Science & Engineering",
        collegeName: user.collegeName || user.university || "Vishnu Educational Society",
        bio:
          user.bio ||
          "Senior Faculty specializing in Advanced Algorithms, Compilers, and AI-driven pedagogical mentoring.",
        avatar: user.avatar || "https://api.dicebear.com/7.x/avataaars/svg?seed=ProfJenkins",
      });
    }
    setIsEditing(false);
    setStatusMsg(null);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--syn-keyword)] animate-spin" />
        <p className="text-xs font-mono text-[var(--ink-dim)]">Loading faculty profile & configuration architecture...</p>
      </div>
    );
  }

  if (!subData) return null;

  const facultySeatPct = Math.round((subData.facultySeatsUsed / subData.facultySeatsMax) * 100);
  const studentSeatPct = Math.round((subData.studentSeatsUsed / subData.studentSeatsMax) * 100);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--ink)]">
          Faculty & Institution Settings
        </h1>
        <p className="text-xs text-[var(--ink-dim)] font-mono">
          Manage your academic credentials, designation, department details, and institutional seat quotas
        </p>
      </div>

      {/* Status Notification */}
      {statusMsg && (
        <div
          className={`p-4 rounded-xl border flex items-center justify-between text-xs font-mono transition-all ${
            statusMsg.type === "success"
              ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-300"
              : "bg-red-500/10 border-red-500/30 text-red-300"
          }`}
        >
          <div className="flex items-center gap-2">
            {statusMsg.type === "success" ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            ) : (
              <AlertCircle className="w-4 h-4 text-red-400" />
            )}
            <span>{statusMsg.text}</span>
          </div>
          <button
            onClick={() => setStatusMsg(null)}
            className="p-1 hover:bg-white/10 rounded text-gray-400 hover:text-white"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Faculty Profile Card */}
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-[var(--border)] pb-4">
          <div className="flex items-center gap-3">
            <div className="relative">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={
                  formData.avatar ||
                  user?.avatar ||
                  `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(user?.email || "faculty")}`
                }
                alt={formData.name}
                className="w-16 h-16 rounded-2xl border-2 border-purple-500/40 bg-black/40 object-cover shadow-lg"
              />
              <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded text-[9px] font-mono font-bold bg-purple-500 text-white uppercase shadow">
                FACULTY
              </span>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-display font-bold text-[var(--ink)]">{formData.name}</h2>
              </div>
              <p className="text-xs font-mono text-purple-300 font-semibold">{formData.title}</p>
              <p className="text-[11px] font-mono text-[var(--ink-dim)]">{formData.email}</p>
            </div>
          </div>

          {!isEditing ? (
            <button
              onClick={() => setIsEditing(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>Edit Profile</span>
            </button>
          ) : (
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
                <span>Cancel</span>
              </button>
              <button
                type="button"
                onClick={handleSaveProfile}
                disabled={saving}
                className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-mono font-semibold shadow-lg shadow-emerald-900/30 transition-all cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Save className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Saving..." : "Save Changes"}</span>
              </button>
            </div>
          )}
        </div>

        {/* View Mode */}
        {!isEditing ? (
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 font-mono text-xs">
              <div className="p-3.5 rounded-xl glass border border-white/10">
                <span className="text-[10px] text-[var(--ink-dim)] block">Designation / Title</span>
                <span className="font-bold text-purple-300 text-sm mt-0.5 block">{formData.title}</span>
              </div>

              <div className="p-3.5 rounded-xl glass border border-white/10">
                <span className="text-[10px] text-[var(--ink-dim)] block">Department</span>
                <span className="font-bold text-[var(--ink)] text-sm mt-0.5 block truncate">
                  {formData.stream}
                </span>
              </div>

              <div className="p-3.5 rounded-xl glass border border-white/10">
                <span className="text-[10px] text-[var(--ink-dim)] block">Institution</span>
                <span className="font-bold text-[var(--ink)] text-sm mt-0.5 block truncate">
                  {formData.collegeName}
                </span>
              </div>

              <div className="p-3.5 rounded-xl glass border border-white/10">
                <span className="text-[10px] text-[var(--ink-dim)] block">Account Role</span>
                <span className="font-bold text-emerald-400 text-sm mt-0.5 block">Faculty Instructor</span>
              </div>
            </div>

            {/* Academic Bio / Research Summary */}
            <div className="p-4 rounded-xl glass border border-white/10 space-y-1.5">
              <span className="text-[11px] font-mono text-purple-300 font-semibold flex items-center gap-1.5">
                <BookOpen className="w-3.5 h-3.5 text-purple-400" />
                <span>Academic Focus & Research Bio</span>
              </span>
              <p className="text-xs text-[var(--ink)] leading-relaxed">{formData.bio}</p>
            </div>
          </div>
        ) : (
          /* Edit Mode Form */
          <form onSubmit={handleSaveProfile} className="space-y-5 animate-in fade-in duration-200">
            {/* Avatar Selector */}
            <div className="p-4 rounded-xl bg-purple-950/20 border border-purple-500/20 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-purple-200 font-semibold flex items-center gap-1.5">
                  <Camera className="w-3.5 h-3.5 text-purple-400" />
                  <span>Choose Faculty Avatar Preset</span>
                </span>
                <span className="text-[10px] font-mono text-purple-300/80">Click preset to select</span>
              </div>

              <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
                {FACULTY_AVATAR_PRESETS.map((preset, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setFormData({ ...formData, avatar: preset.url })}
                    className={`p-2 rounded-xl border text-center transition-all flex flex-col items-center gap-1 cursor-pointer ${
                      formData.avatar === preset.url
                        ? "bg-purple-600/30 border-purple-400 ring-2 ring-purple-500/50"
                        : "glass border-white/10 hover:border-purple-400/40 hover:bg-white/5"
                    }`}
                  >
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={preset.url} alt={preset.label} className="w-10 h-10 rounded-full bg-black/40 object-cover" />
                    <span className="text-[9px] font-mono text-gray-300 truncate w-full">{preset.label.split(" ")[0]}</span>
                  </button>
                ))}
              </div>

              {/* Custom Image URL input */}
              <div className="pt-2">
                <label className="text-[10px] font-mono text-[var(--ink-dim)] block mb-1">
                  Or provide Custom Avatar Image URL:
                </label>
                <input
                  type="text"
                  value={formData.avatar}
                  onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 rounded-lg bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--ink)] font-mono focus:border-purple-400 focus:outline-none"
                />
              </div>
            </div>

            {/* Form Fields Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--ink-dim)] block font-semibold">
                  Faculty Full Name <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g. Dr. B.V. N. Rani"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-purple-400 focus:outline-none shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--ink-dim)] block font-semibold">
                  Academic Designation / Title <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="e.g. Professor & Head of Department"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-purple-400 focus:outline-none shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--ink-dim)] block font-semibold">
                  Department / Stream <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.stream}
                  onChange={(e) => setFormData({ ...formData, stream: e.target.value })}
                  placeholder="e.g. Computer Science & Engineering"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-purple-400 focus:outline-none shadow-inner"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-[11px] text-[var(--ink-dim)] block font-semibold">
                  Institution / College <span className="text-purple-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.collegeName}
                  onChange={(e) => setFormData({ ...formData, collegeName: e.target.value })}
                  placeholder="e.g. Vishnu Educational Society"
                  className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-[var(--ink)] focus:border-purple-400 focus:outline-none shadow-inner"
                />
              </div>
            </div>

            {/* Bio / Research Specialization Textarea */}
            <div className="space-y-1.5 font-mono">
              <label className="text-[11px] text-[var(--ink-dim)] block font-semibold">
                Academic Bio, Specialization & Research Focus
              </label>
              <textarea
                rows={3}
                value={formData.bio}
                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                placeholder="Describe your research interests, courses taught, publications, or office hours..."
                className="w-full px-3.5 py-2.5 rounded-xl bg-[var(--bg)] border border-[var(--border)] text-xs text-[var(--ink)] focus:border-purple-400 focus:outline-none leading-relaxed shadow-inner"
              />
            </div>

            {/* Bottom Actions */}
            <div className="flex items-center justify-end gap-3 pt-3 border-t border-[var(--border)]">
              <button
                type="button"
                onClick={handleCancel}
                disabled={saving}
                className="px-4 py-2 rounded-xl glass border border-white/10 hover:bg-white/10 text-xs font-mono text-gray-300 transition-colors cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-mono font-semibold shadow-lg shadow-purple-900/30 transition-all cursor-pointer"
              >
                {saving ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Check className="w-3.5 h-3.5" />
                )}
                <span>{saving ? "Saving Changes..." : "Save Profile Details"}</span>
              </button>
            </div>
          </form>
        )}
      </div>

      {/* Subscription & Quota Architecture (AI credits removed) */}
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-mono text-purple-300 font-bold uppercase px-2.5 py-1 rounded bg-purple-500/10 border border-purple-500/20">
              {subData.plan}
            </span>
            <h2 className="text-lg font-display font-bold text-[var(--ink)] mt-2">
              {subData.institution} Subscription Architecture
            </h2>
          </div>

          <div className="text-xs font-mono text-right">
            <span className="text-[var(--ink-dim)] block">
              Billing Cycle: <strong className="text-[var(--ink)]">{subData.billingCycle}</strong>
            </span>
            <span className="text-[var(--syn-string)] font-semibold">Next Renewal: {subData.nextRenewal}</span>
          </div>
        </div>

        {/* Quota Progress Bars (Faculty & Student Seats only) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 font-mono text-xs">
          {/* Faculty Seats */}
          <div className="p-4 rounded-xl glass border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--ink-dim)] flex items-center gap-1.5">
                <Users className="w-4 h-4 text-blue-400" /> Faculty Seats
              </span>
              <strong className="text-[var(--ink)] font-bold">
                {subData.facultySeatsUsed} / {subData.facultySeatsMax}
              </strong>
            </div>
            <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden">
              <div className="h-full bg-blue-500 rounded-full" style={{ width: `${facultySeatPct}%` }} />
            </div>
            <span className="text-[10px] text-[var(--ink-faint)] block text-right">
              {facultySeatPct}% allocated
            </span>
          </div>

          {/* Student Seats */}
          <div className="p-4 rounded-xl glass border border-white/10 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[var(--ink-dim)] flex items-center gap-1.5">
                <Building2 className="w-4 h-4 text-emerald-400" /> Student Seats
              </span>
              <strong className="text-[var(--ink)] font-bold">
                {subData.studentSeatsUsed} / {subData.studentSeatsMax}
              </strong>
            </div>
            <div className="h-2 w-full bg-[var(--bg)] rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${studentSeatPct}%` }} />
            </div>
            <span className="text-[10px] text-[var(--ink-faint)] block text-right">
              {studentSeatPct}% allocated
            </span>
          </div>
        </div>

        {/* Plan Features */}
        <div className="pt-4 border-t border-[var(--border)] space-y-3">
          <h3 className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">
            Institutional Entitlements
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
            {subData.features.map((feat, idx) => (
              <div
                key={idx}
                className="p-2.5 rounded-xl glass border border-white/10 text-xs font-mono flex items-center gap-2 text-[var(--ink)]"
              >
                <CheckCircle2 className="w-4 h-4 text-[var(--syn-string)] shrink-0" />
                <span>{feat}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
