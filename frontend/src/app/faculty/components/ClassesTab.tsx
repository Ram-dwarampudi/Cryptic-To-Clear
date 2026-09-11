"use client";

import React, { useState, useEffect } from "react";
import { ClassSection, fetchFacultyClasses, addClassSection } from "@/lib/api";
import { ACADEMIC_BRANCHES, ACADEMIC_SECTIONS } from "@/lib/constants/academic";
import { FolderGit2, Plus, Users, GraduationCap, Building2, Check, Loader2, X } from "lucide-react";

export default function ClassesTab() {
  const [classesData, setClassesData] = useState<{ institutionName: string; department: string; classes: ClassSection[] } | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedBranch, setSelectedBranch] = useState<string>("ALL");

  // New Class Modal State
  const [showModal, setShowModal] = useState(false);
  const [className, setClassName] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState(3);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadClasses = async () => {
    setLoading(true);
    const res = await fetchFacultyClasses();
    if (res.success && res.data) {
      setClassesData(res.data);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadClasses();
  }, []);

  const handleCreateClass = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!className || !section) {
      setError("Please fill in course name and section.");
      return;
    }
    setError(null);
    setSubmitting(true);
    const res = await addClassSection({ name: className, section, year });
    if (res.success) {
      setShowModal(false);
      setClassName("");
      setSection("");
      loadClasses();
    } else {
      setError(res.message || "Failed to create class section.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--syn-keyword)] animate-spin" />
        <p className="text-xs font-mono text-[var(--ink-dim)]">Loading class & section hierarchy...</p>
      </div>
    );
  }

  const allFilteredClasses = (classesData?.classes || []).filter((cls) => {
    if (selectedBranch === "ALL") return true;
    return cls.branch === selectedBranch || cls.name.startsWith(selectedBranch);
  });

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--ink)]">Classes & Sections Management</h1>
          <p className="text-xs text-[var(--ink-dim)] font-mono">
            {classesData?.institutionName} • {classesData?.department}
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-medium text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(184,146,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Class / Section</span>
        </button>
      </div>

      {/* Institutional Hierarchy Banner */}
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 space-y-4">
        <h2 className="text-xs font-mono text-[var(--ink-dim)] uppercase tracking-wider">Institutional Architecture</h2>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 text-xs font-mono">
          <div className="p-3 rounded-xl glass border border-white/10 flex items-center gap-3">
            <Building2 className="w-5 h-5 text-purple-400" />
            <div>
              <p className="text-[10px] text-[var(--ink-dim)]">Institution</p>
              <p className="font-bold text-[var(--ink)]">{classesData?.institutionName}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl glass border border-white/10 flex items-center gap-3">
            <GraduationCap className="w-5 h-5 text-blue-400" />
            <div>
              <p className="text-[10px] text-[var(--ink-dim)]">Department</p>
              <p className="font-bold text-[var(--ink)]">{classesData?.department}</p>
            </div>
          </div>

          <div className="p-3 rounded-xl glass border border-white/10 flex items-center gap-3">
            <FolderGit2 className="w-5 h-5 text-emerald-400" />
            <div>
              <p className="text-[10px] text-[var(--ink-dim)]">Assigned Classes</p>
              <p className="font-bold text-[var(--ink)]">{classesData?.classes.length} Sections</p>
            </div>
          </div>

          <div className="p-3 rounded-xl glass border border-white/10 flex items-center gap-3">
            <Users className="w-5 h-5 text-indigo-400" />
            <div>
              <p className="text-[10px] text-[var(--ink-dim)]">Total Enrolled</p>
              <p className="font-bold text-[var(--ink)]">
                {classesData?.classes.reduce((acc, curr) => acc + curr.studentCount, 0)} Students
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Branch Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 font-mono text-xs">
        <button
          onClick={() => setSelectedBranch("ALL")}
          className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap ${
            selectedBranch === "ALL"
              ? "bg-[var(--syn-keyword)] text-[#0a0d13] font-bold shadow-sm"
              : "glass border border-white/10 text-[var(--ink-dim)] hover:text-white"
          }`}
        >
          All Branches ({classesData?.classes.length || 0})
        </button>
        {ACADEMIC_BRANCHES.map((b) => {
          const count = (classesData?.classes || []).filter(
            (c) => c.branch === b || c.name.startsWith(b)
          ).length;
          const studentsInBranch = (classesData?.classes || [])
            .filter((c) => c.branch === b || c.name.startsWith(b))
            .reduce((acc, c) => acc + c.studentCount, 0);

          return (
            <button
              key={b}
              onClick={() => setSelectedBranch(b)}
              className={`px-3.5 py-1.5 rounded-xl transition-all cursor-pointer whitespace-nowrap flex items-center gap-1.5 ${
                selectedBranch === b
                  ? "bg-[var(--syn-keyword)] text-[#0a0d13] font-bold shadow-sm"
                  : "glass border border-white/10 text-[var(--ink-dim)] hover:text-white"
              }`}
            >
              <span>{b}</span>
              <span className={`text-[10px] px-1.5 py-0.2 rounded-full ${selectedBranch === b ? "bg-black/20 text-[#0a0d13]" : "bg-white/10 text-white/70"}`}>
                {studentsInBranch} std
              </span>
            </button>
          );
        })}
      </div>

      {/* Class Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {allFilteredClasses.map((cls) => (
          <div
            key={cls.id}
            className="glass-strong border border-[var(--border-strong)] rounded-2xl p-5 space-y-4 hover:border-[var(--syn-keyword)]/40 transition-all flex flex-col justify-between group"
          >
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded bg-purple-500/15 text-purple-300 border border-purple-500/30">
                    {cls.branch || cls.name.split(" ")[0]}
                  </span>
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-white/5 text-[var(--ink)] border border-white/10">
                    {cls.section}
                  </span>
                </div>
                <span className="text-xs font-mono text-[var(--ink-dim)]">Year {cls.year}</span>
              </div>
              <h3 className="text-sm font-display font-semibold text-[var(--ink)] group-hover:text-[var(--syn-keyword)] transition-colors">
                {cls.name}
              </h3>
            </div>

            <div className="pt-3 border-t border-[var(--border)] flex items-center justify-between text-xs font-mono text-[var(--ink-dim)]">
              <span className="flex items-center gap-1.5">
                <Users className="w-4 h-4 text-[var(--syn-function)]" />
                <strong className="text-[var(--ink)] font-bold">{cls.studentCount}</strong> Enrolled Students
              </span>
              <span className="text-emerald-400 font-semibold flex items-center gap-1 text-[11px]">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span> Active
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Class Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 max-w-md w-full space-y-5 relative">
            <button
              onClick={() => setShowModal(false)}
              className="absolute top-4 right-4 p-1 text-[var(--ink-dim)] hover:text-[var(--ink)]"
            >
              <X className="w-5 h-5" />
            </button>

            <h2 className="text-lg font-display font-semibold text-[var(--ink)]">Add New Class / Section</h2>

            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono">
                {error}
              </div>
            )}

            <form onSubmit={handleCreateClass} className="space-y-4 text-xs font-mono">
              <div>
                <label className="block text-[var(--ink-dim)] mb-1">Course Title</label>
                <input
                  type="text"
                  value={className}
                  onChange={(e) => setClassName(e.target.value)}
                  placeholder="e.g. CS 401 - System Programming"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--ink-dim)] mb-1">Section ID</label>
                <input
                  type="text"
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="e.g. CS-4A"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                  required
                />
              </div>

              <div>
                <label className="block text-[var(--ink-dim)] mb-1">Academic Year</label>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="pt-2 flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 py-2 rounded-xl glass border border-white/10 text-[var(--ink-dim)] hover:text-[var(--ink)]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="flex-1 py-2 rounded-xl bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-[#0a0d13] font-bold flex items-center justify-center gap-2"
                >
                  {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create Class"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
