"use client";

import React, { useState, useEffect } from "react";
import {
  AssignmentItem,
  ClassSection,
  AssignmentAnalyticsData,
  fetchFacultyAssignments,
  fetchFacultyClasses,
  createFacultyAssignment,
  updateFacultyAssignment,
  fetchAssignmentAnalytics,
} from "@/lib/api";
import {
  BookOpen,
  Plus,
  Calendar,
  Code2,
  CheckCircle2,
  Users,
  Loader2,
  X,
  Edit,
  BarChart2,
  AlertTriangle,
  Sparkles,
  Info,
  CheckSquare,
  Square,
  HelpCircle,
} from "lucide-react";

const PLATFORM_LANGUAGES = [
  { id: "c", label: "C" },
  { id: "cpp", label: "C++" },
  { id: "java", label: "Java" },
  { id: "python", label: "Python" },
];

export default function AssignmentsTab() {
  const [assignments, setAssignments] = useState<AssignmentItem[]>([]);
  const [classes, setClasses] = useState<ClassSection[]>([]);
  const [loading, setLoading] = useState(true);

  // Modal States
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingAssignment, setEditingAssignment] = useState<AssignmentItem | null>(null);
  const [analyticsData, setAnalyticsData] = useState<AssignmentAnalyticsData | null>(null);
  const [analyticsLoading, setAnalyticsLoading] = useState(false);

  // Form Fields
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [instructions, setInstructions] = useState("");
  const [classId, setClassId] = useState("");
  const [deadline, setDeadline] = useState("2026-08-30T23:59");
  const [points, setPoints] = useState(100);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">("medium");
  const [maxAttempts, setMaxAttempts] = useState(5);

  // Language Mode: "ANY" | "RESTRICTED"
  const [languageMode, setLanguageMode] = useState<"ANY" | "RESTRICTED">("ANY");
  const [preferredLanguage, setPreferredLanguage] = useState<string>("");
  const [selectedLanguages, setSelectedLanguages] = useState<string[]>(["c", "cpp", "java", "python"]);

  // Test Cases State (Item 7 Requirement)
  const [testCases, setTestCases] = useState<
    Array<{ id?: string; input: string; expectedOutput: string; isHidden: boolean; explanation?: string }>
  >([
    { input: "5\n10 20 30 40 50", expectedOutput: "10 20 30 40 50", isHidden: false, explanation: "Standard array elements" },
    { input: "0", expectedOutput: "Empty", isHidden: true, explanation: "Zero input edge case" },
  ]);

  // Confirmation dialog state for editing language restrictions when submissions exist
  const [showConfirmEditWarning, setShowConfirmEditWarning] = useState(false);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = async () => {
    setLoading(true);
    const [asgRes, clsRes] = await Promise.all([
      fetchFacultyAssignments(),
      fetchFacultyClasses(),
    ]);
    if (asgRes.success && asgRes.data) setAssignments(asgRes.data);
    if (clsRes.success && clsRes.data) {
      setClasses(clsRes.data.classes);
      if (clsRes.data.classes.length > 0 && !classId) setClassId(clsRes.data.classes[0].id);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, []);

  const openCreateModal = () => {
    setEditingAssignment(null);
    setTitle("");
    setDescription("");
    setInstructions("");
    setDeadline("2026-08-30T23:59");
    setPoints(100);
    setDifficulty("medium");
    setMaxAttempts(5);
    setLanguageMode("ANY");
    setPreferredLanguage("");
    setSelectedLanguages(["c", "cpp", "java", "python"]);
    setTestCases([
      { input: "5\n10 20 30 40 50", expectedOutput: "10 20 30 40 50", isHidden: false, explanation: "Standard array elements" },
      { input: "0", expectedOutput: "Empty", isHidden: true, explanation: "Zero input edge case" },
    ]);
    setError(null);
    setShowConfirmEditWarning(false);
    setShowCreateModal(true);
  };

  const openEditModal = (asg: AssignmentItem) => {
    setEditingAssignment(asg);
    setTitle(asg.title);
    setDescription(asg.description || "");
    setInstructions(asg.instructions || "");
    setDeadline(asg.deadline ? asg.deadline.slice(0, 16) : "2026-08-30T23:59");
    setClassId(asg.classId);
    setPoints(asg.points || 100);
    setDifficulty(asg.difficulty || "medium");
    setMaxAttempts(asg.maxAttempts || 5);
    setLanguageMode(asg.languageMode || "ANY");
    setPreferredLanguage(asg.preferredLanguage || (asg.allowedLanguages && asg.allowedLanguages.length === 1 ? asg.allowedLanguages[0] : ""));
    setSelectedLanguages(asg.allowedLanguages && asg.allowedLanguages.length > 0 ? asg.allowedLanguages : ["c", "cpp", "java", "python"]);
    setTestCases(
      asg.testCases && asg.testCases.length > 0
        ? asg.testCases
        : [
            { input: "5\n10 20 30 40 50", expectedOutput: "10 20 30 40 50", isHidden: false },
            { input: "0", expectedOutput: "Empty", isHidden: true },
          ]
    );
    setError(null);
    setShowConfirmEditWarning(false);
    setShowCreateModal(true);
  };

  const openAnalyticsModal = async (asgId: string) => {
    setAnalyticsLoading(true);
    setAnalyticsData(null);
    const res = await fetchAssignmentAnalytics(asgId);
    if (res.success && res.data) {
      setAnalyticsData(res.data);
    }
    setAnalyticsLoading(false);
  };

  const handleToggleLanguage = (langId: string) => {
    if (selectedLanguages.includes(langId)) {
      if (selectedLanguages.length === 1) return; // Must keep at least 1
      setSelectedLanguages(selectedLanguages.filter((l) => l !== langId));
    } else {
      setSelectedLanguages([...selectedLanguages, langId]);
    }
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !deadline) {
      setError("Please fill in assignment title and submission deadline.");
      return;
    }

    if (languageMode === "RESTRICTED" && selectedLanguages.length === 0) {
      setError("At least one programming language must be selected when restricting allowed languages.");
      return;
    }

    // Confirmation check if editing existing assignment with submissions
    if (editingAssignment && editingAssignment.submissionsCount > 0 && !showConfirmEditWarning) {
      const modeChanged = editingAssignment.languageMode !== languageMode;
      const setA = new Set(editingAssignment.allowedLanguages || []);
      const setB = new Set(selectedLanguages);
      const langsChanged = setA.size !== setB.size || [...setA].some((x) => !setB.has(x));

      if (modeChanged || (languageMode === "RESTRICTED" && langsChanged)) {
        setShowConfirmEditWarning(true);
        return;
      }
    }

    setError(null);
    setSubmitting(true);

    let isoDeadline = deadline;
    try {
      const d = new Date(deadline);
      if (!isNaN(d.getTime())) {
        isoDeadline = d.toISOString();
      }
    } catch {
      isoDeadline = deadline;
    }

    const payload = {
      title: title.trim(),
      description: description.trim(),
      instructions: instructions.trim(),
      deadline: isoDeadline,
      classId: classId || (classes[0] ? classes[0].id : "cls_cs3a"),
      languageMode,
      preferredLanguage: preferredLanguage || (languageMode === "RESTRICTED" && selectedLanguages.length === 1 ? selectedLanguages[0] : undefined),
      allowedLanguages: languageMode === "RESTRICTED" ? selectedLanguages : [],
      testCases,
      points: Number(points) || 100,
      difficulty,
      maxAttempts: Number(maxAttempts) || 5,
    };

    let res;
    if (editingAssignment) {
      res = await updateFacultyAssignment(editingAssignment.id, payload);
    } else {
      res = await createFacultyAssignment(payload);
    }

    if (res.success) {
      setShowCreateModal(false);
      loadData();
    } else {
      setError(res.message || "Failed to save assignment.");
    }
    setSubmitting(false);
  };

  if (loading) {
    return (
      <div className="p-12 flex flex-col items-center justify-center gap-3">
        <Loader2 className="w-8 h-8 text-[var(--syn-keyword)] animate-spin" />
        <p className="text-xs font-mono text-[var(--ink-dim)]">Loading assignment portal & problem sets...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--ink)]">Assignments & Problem Sets</h1>
          <p className="text-xs text-[var(--ink-dim)] font-mono">
            Manage coursework, set language restrictions, and analyze student submissions
          </p>
        </div>
        <button
          onClick={openCreateModal}
          className="inline-flex items-center gap-2 rounded-xl px-4 py-2 text-xs font-mono font-medium text-[#0a0d13] bg-gradient-to-r from-[var(--syn-keyword)] via-[var(--syn-function)] to-[var(--syn-string)] hover:brightness-110 transition-all cursor-pointer shadow-[0_0_20px_rgba(184,146,255,0.2)]"
        >
          <Plus className="w-4 h-4" />
          <span>Create Assignment</span>
        </button>
      </div>

      {/* Assignment List */}
      <div className="grid grid-cols-1 gap-4">
        {assignments.map((asg) => {
          const submissionPct = Math.round((asg.submissionsCount / (asg.totalAssigned || 1)) * 100);
          const isRestricted = asg.languageMode === "RESTRICTED" || !!asg.preferredLanguage;
          const readableLangs = asg.preferredLanguage
            ? (asg.preferredLanguage === "cpp" ? "C++ (Required)" : `${asg.preferredLanguage.toUpperCase()} (Required)`)
            : isRestricted && asg.allowedLanguages && asg.allowedLanguages.length > 0
            ? asg.allowedLanguages.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ")
            : "Any Supported Language";

          return (
            <div
              key={asg.id}
              className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 space-y-4 hover:border-[#D4AF37]/50 hover:shadow-[0_4px_20px_rgba(212,175,55,0.1)] transition-all"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase bg-purple-500/10 text-purple-300 border border-purple-500/20">
                      {asg.className}
                    </span>
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold uppercase ${
                        isRestricted
                          ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                          : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                      }`}
                    >
                      Language: {readableLangs}
                    </span>
                    {asg.points && (
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-white/5 text-[var(--ink-dim)] border border-white/10">
                        {asg.points} pts
                      </span>
                    )}
                  </div>
                  <h3 className="text-lg font-display font-semibold text-[var(--ink)]">{asg.title}</h3>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <div className="flex items-center gap-1.5 text-xs font-mono text-[var(--ink-dim)] bg-white/5 px-3 py-1.5 rounded-xl border border-white/10">
                    <Calendar className="w-3.5 h-3.5 text-[var(--syn-keyword)]" />
                    <span>Due: {new Date(asg.deadline).toLocaleDateString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })}</span>
                  </div>

                  <button
                    onClick={() => openEditModal(asg)}
                    className="p-2 rounded-xl glass border border-white/10 text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors cursor-pointer"
                    title="Edit Assignment Configuration"
                  >
                    <Edit className="w-4 h-4" />
                  </button>

                  <button
                    onClick={() => openAnalyticsModal(asg.id)}
                    className="p-2 rounded-xl glass border border-purple-500/20 text-purple-300 hover:bg-purple-500/10 transition-colors cursor-pointer"
                    title="View Submissions & Language Analytics"
                  >
                    <BarChart2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <p className="text-xs text-[var(--ink-dim)] leading-relaxed font-sans">{asg.description}</p>
              {asg.instructions && (
                <div className="p-3 rounded-xl bg-white/[0.02] border border-[var(--border)] text-xs font-mono text-[var(--ink-dim)]">
                  <strong className="text-[var(--syn-keyword)]">Instructions:</strong> {asg.instructions}
                </div>
              )}

              <div className="pt-3 border-t border-[var(--border)] grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div>
                  <span className="text-[var(--ink-dim)] text-[10px] block">Submissions Tracked</span>
                  <div className="flex items-center gap-2 mt-1">
                    <strong className="text-emerald-400 font-bold text-base">{asg.submissionsCount}</strong>
                    <span className="text-[var(--ink-dim)]">/ {asg.totalAssigned} assigned ({submissionPct}%)</span>
                  </div>
                </div>

                <div>
                  <span className="text-[var(--ink-dim)] text-[10px] block">Average Class Score</span>
                  <p className="text-base font-bold text-gradient mt-1">{asg.avgScore}%</p>
                </div>

                <div className="flex items-center justify-end">
                  <button
                    onClick={() => openAnalyticsModal(asg.id)}
                    className="text-xs font-mono text-[var(--syn-function)] hover:underline cursor-pointer flex items-center gap-1"
                  >
                    <span>View Submission Breakdown</span>
                    <span>→</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create / Edit Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex justify-center items-start overflow-y-auto p-3 sm:p-6 bg-black/80 backdrop-blur-md">
          <div className="glass-strong border border-[var(--border-strong)] rounded-2xl max-w-2xl w-full my-auto max-h-[calc(100vh-3rem)] flex flex-col relative shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200 shrink-0">
            {/* Sticky Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--border)] shrink-0 bg-[var(--card)] z-10">
              <div>
                <h2 className="text-lg font-display font-bold text-[var(--ink)]">
                  {editingAssignment ? "Edit Assignment Configuration" : "Create Coding Assignment"}
                </h2>
                <p className="text-[11px] font-mono text-[var(--ink-dim)] mt-0.5">
                  Set problem statement, test cases, target class, and constraints
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="p-1.5 rounded-lg text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Form Body */}
            <form
              id="assignment-create-form"
              onSubmit={handleSubmitForm}
              className="flex-1 min-h-0 overflow-y-auto px-6 py-5 space-y-5 text-xs font-mono custom-scrollbar"
            >
              {error && (
                <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-mono flex items-start gap-2.5">
                  <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                  <span>{error}</span>
                </div>
              )}

              {/* Confirmation Warning if Editing Assignment with Submissions */}
              {showConfirmEditWarning && (
                <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-mono space-y-3">
                  <div className="flex items-center gap-2 font-bold text-amber-400">
                    <AlertTriangle className="w-4 h-4" />
                    <span>Submissions Already Received</span>
                  </div>
                  <p className="text-[11px] text-[var(--ink-dim)] leading-relaxed font-sans">
                    Changing allowed languages may affect existing submissions ({editingAssignment?.submissionsCount} recorded). Are you sure you want to continue?
                  </p>
                  <div className="flex items-center gap-2 pt-1">
                    <button
                      type="button"
                      onClick={() => setShowConfirmEditWarning(false)}
                      className="px-3 py-1 rounded bg-white/5 border border-white/10 text-[var(--ink)] hover:bg-white/10"
                    >
                      Cancel
                    </button>
                    <button
                      type="button"
                      onClick={(e) => handleSubmitForm(e)}
                      className="px-3 py-1 rounded bg-amber-500 text-[#0a0d13] font-bold hover:brightness-110"
                    >
                      Confirm & Update Language Rules
                    </button>
                  </div>
                </div>
              )}
              <div>
                <label htmlFor="asg-title" className="block text-[var(--ink-dim)] mb-1">Assignment Title <span className="text-red-400">*</span></label>
                <input
                  id="asg-title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g. Find the Largest Element in Array"
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                  required
                />
              </div>

              <div>
                <label htmlFor="asg-description" className="block text-[var(--ink-dim)] mb-1">Problem Statement / Description <span className="text-red-400">*</span></label>
                <textarea
                  id="asg-description"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide algorithm requirements, input format, and constraints..."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)] h-20 resize-none font-sans"
                  required
                />
              </div>

              <div>
                <label htmlFor="asg-instructions" className="block text-[var(--ink-dim)] mb-1">Instructions (Optional)</label>
                <input
                  id="asg-instructions"
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Ensure O(N) time complexity and O(1) extra space."
                  className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label htmlFor="asg-class" className="block text-[var(--ink-dim)] mb-1">Target Class <span className="text-red-400">*</span></label>
                  <select
                    id="asg-class"
                    value={classId}
                    onChange={(e) => setClassId(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                  >
                    {classes.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.section})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label htmlFor="asg-deadline" className="block text-[var(--ink-dim)] mb-1">Due Date <span className="text-red-400">*</span></label>
                  <input
                    id="asg-deadline"
                    type="datetime-local"
                    value={deadline}
                    onChange={(e) => setDeadline(e.target.value)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none focus:border-[var(--syn-keyword)]"
                    required
                  />
                </div>
              </div>

              {/* Allowed & Preferred Languages */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-[var(--border-strong)] space-y-3">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-white flex items-center gap-1.5">
                    <Code2 className="w-4 h-4 text-[#E8C97A]" />
                    <span>Required / Preferred Programming Language</span>
                  </label>
                </div>

                <p className="text-[11px] text-[var(--ink-dim)] leading-relaxed font-sans">
                  Choose whether students can submit in any language or must submit in a strictly required language.
                </p>

                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("ANY");
                      setPreferredLanguage("");
                      setSelectedLanguages(["c", "cpp", "java", "python"]);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "ANY"
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-white font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">Any Language</div>
                    <div className="text-[10px] text-zinc-400">Open Choice</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("RESTRICTED");
                      setPreferredLanguage("c");
                      setSelectedLanguages(["c"]);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "RESTRICTED" && preferredLanguage === "c" && selectedLanguages.length === 1
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">C Only</div>
                    <div className="text-[10px] text-zinc-400">GCC Compiler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("RESTRICTED");
                      setPreferredLanguage("cpp");
                      setSelectedLanguages(["cpp"]);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "RESTRICTED" && preferredLanguage === "cpp" && selectedLanguages.length === 1
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">C++ Only</div>
                    <div className="text-[10px] text-zinc-400">G++ Compiler</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("RESTRICTED");
                      setPreferredLanguage("java");
                      setSelectedLanguages(["java"]);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "RESTRICTED" && preferredLanguage === "java" && selectedLanguages.length === 1
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">Java Only</div>
                    <div className="text-[10px] text-zinc-400">OpenJDK</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("RESTRICTED");
                      setPreferredLanguage("python");
                      setSelectedLanguages(["python"]);
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "RESTRICTED" && preferredLanguage === "python" && selectedLanguages.length === 1
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">Python Only</div>
                    <div className="text-[10px] text-zinc-400">Python 3</div>
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setLanguageMode("RESTRICTED");
                      setPreferredLanguage("");
                    }}
                    className={`p-2.5 rounded-xl border text-xs font-mono transition-all text-left cursor-pointer ${
                      languageMode === "RESTRICTED" && (!preferredLanguage || selectedLanguages.length > 1)
                        ? "bg-[#D4AF37]/20 border-[#D4AF37] text-[#E8C97A] font-bold shadow-md shadow-[#D4AF37]/10"
                        : "glass border-white/10 text-zinc-400 hover:text-white"
                    }`}
                  >
                    <div className="font-bold">Custom Multi</div>
                    <div className="text-[10px] text-zinc-400">Select Multiple</div>
                  </button>
                </div>

                {/* Multi-select checkboxes if Custom RESTRICTED */}
                {languageMode === "RESTRICTED" && (!preferredLanguage || selectedLanguages.length > 1) && (
                  <div className="pt-2 pl-4 space-y-2 border-l-2 border-[#D4AF37]/40">
                    <p className="text-[10px] text-[#E8C97A] uppercase tracking-wider font-bold">Select Permitted Languages:</p>
                    <div className="grid grid-cols-2 gap-2">
                      {PLATFORM_LANGUAGES.map((lang) => {
                        const isChecked = selectedLanguages.includes(lang.id);
                        return (
                          <button
                            key={lang.id}
                            type="button"
                            onClick={() => handleToggleLanguage(lang.id)}
                            className={`flex items-center gap-2 p-2 rounded-lg border text-xs font-mono transition-all cursor-pointer ${
                              isChecked
                                ? "bg-[#D4AF37]/20 border-[#D4AF37]/50 text-[#E8C97A] font-bold"
                                : "bg-white/5 border-white/10 text-[var(--ink-faint)] hover:text-[var(--ink-dim)]"
                            }`}
                          >
                            {isChecked ? <CheckSquare className="w-4 h-4 text-[#D4AF37]" /> : <Square className="w-4 h-4" />}
                            <span>{lang.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              {/* Requirement 7: Test Cases Manager (Revealed & Hidden) */}
              <div className="p-4 rounded-xl bg-white/[0.03] border border-[var(--border-strong)] space-y-3 font-mono">
                <div className="flex items-center justify-between">
                  <label className="block font-bold text-[var(--ink)] flex items-center gap-1.5">
                    <CheckSquare className="w-4 h-4 text-emerald-400" />
                    <span>Test Cases (Revealed & Hidden)</span>
                  </label>
                  <button
                    type="button"
                    onClick={() =>
                      setTestCases([
                        ...testCases,
                        { input: "", expectedOutput: "", isHidden: false },
                      ])
                    }
                    className="flex items-center gap-1 text-[11px] text-[var(--syn-keyword)] hover:underline cursor-pointer"
                  >
                    <Plus className="w-3 h-3" />
                    <span>Add Test Case</span>
                  </button>
                </div>

                <p className="text-[11px] text-[var(--ink-dim)] leading-relaxed font-sans">
                  Hidden test cases evaluate code logical correctness without revealing inputs/outputs to students.
                </p>

                <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                  {testCases.map((tc, idx) => (
                    <div
                      key={idx}
                      className={`p-3 rounded-xl border space-y-2 relative transition-all ${
                        tc.isHidden
                          ? "bg-purple-500/10 border-purple-500/30"
                          : "bg-emerald-500/10 border-emerald-500/30"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold text-[var(--ink)]">
                          Test Case #{idx + 1}
                        </span>

                        <div className="flex items-center gap-3">
                          <label className="flex items-center gap-1.5 text-[10px] font-bold cursor-pointer">
                            <input
                              type="checkbox"
                              checked={tc.isHidden}
                              onChange={(e) => {
                                const next = [...testCases];
                                next[idx].isHidden = e.target.checked;
                                setTestCases(next);
                              }}
                              className="accent-purple-500"
                            />
                            <span className={tc.isHidden ? "text-purple-300" : "text-emerald-300"}>
                              {tc.isHidden ? "🔒 Hidden" : "👁️ Revealed"}
                            </span>
                          </label>

                          {testCases.length > 1 && (
                            <button
                              type="button"
                              onClick={() => setTestCases(testCases.filter((_, i) => i !== idx))}
                              className="text-rose-400 text-xs hover:underline cursor-pointer"
                            >
                              Remove
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-2 text-[11px]">
                        <div>
                          <label className="block text-[var(--ink-dim)] text-[10px]">STDIN Input</label>
                          <textarea
                            value={tc.input}
                            onChange={(e) => {
                              const next = [...testCases];
                              next[idx].input = e.target.value;
                              setTestCases(next);
                            }}
                            placeholder="Input value..."
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-[var(--ink)] h-14 resize-none font-mono text-[11px]"
                          />
                        </div>

                        <div>
                          <label className="block text-[var(--ink-dim)] text-[10px]">Expected Output</label>
                          <textarea
                            value={tc.expectedOutput}
                            onChange={(e) => {
                              const next = [...testCases];
                              next[idx].expectedOutput = e.target.value;
                              setTestCases(next);
                            }}
                            placeholder="Expected output..."
                            className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-lg p-1.5 text-[var(--ink)] h-14 resize-none font-mono text-[11px]"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Optional Metadata Grid */}
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label htmlFor="asg-points" className="block text-[var(--ink-dim)] mb-1">Points / Marks</label>
                  <input
                    id="asg-points"
                    type="number"
                    value={points}
                    onChange={(e) => setPoints(Number(e.target.value))}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none"
                  />
                </div>

                <div>
                  <label htmlFor="asg-difficulty" className="block text-[var(--ink-dim)] mb-1">Difficulty</label>
                  <select
                    id="asg-difficulty"
                    value={difficulty}
                    onChange={(e) => setDifficulty(e.target.value as any)}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                </div>

                <div>
                  <label htmlFor="asg-attempts" className="block text-[var(--ink-dim)] mb-1">Max Attempts</label>
                  <input
                    id="asg-attempts"
                    type="number"
                    value={maxAttempts}
                    onChange={(e) => setMaxAttempts(Number(e.target.value))}
                    className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-[var(--ink)] focus:outline-none"
                  />
                </div>
              </div>
            </form>

            {/* Sticky Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-[var(--border)] shrink-0 bg-[var(--card)] z-10">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-5 py-2.5 rounded-xl glass border border-white/10 text-[var(--ink-dim)] hover:text-[var(--ink)] hover:bg-white/5 transition-colors cursor-pointer text-xs font-mono"
              >
                Cancel
              </button>
              <button
                type="submit"
                form="assignment-create-form"
                disabled={submitting}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[var(--syn-keyword)] to-[var(--syn-function)] text-[#0a0d13] font-bold flex items-center justify-center gap-2 cursor-pointer text-xs font-mono hover:brightness-110 shadow-lg shadow-[var(--syn-keyword)]/20 transition-all disabled:opacity-60"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : editingAssignment ? "Update Assignment" : "Publish Assignment"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Analytics Modal */}
      {(analyticsLoading || analyticsData) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-6 sm:p-8 max-w-2xl w-full space-y-6 relative editor-grid max-h-[90vh] overflow-y-auto">
            <button onClick={() => setAnalyticsData(null)} className="absolute top-4 right-4 p-1.5 text-[var(--ink-dim)] hover:text-[var(--ink)] cursor-pointer">
              <X className="w-5 h-5" />
            </button>

            {analyticsLoading ? (
              <div className="p-12 flex flex-col items-center justify-center gap-3">
                <Loader2 className="w-8 h-8 text-[var(--syn-keyword)] animate-spin" />
                <p className="text-xs font-mono text-[var(--ink-dim)]">Aggregating submission analytics...</p>
              </div>
            ) : analyticsData && (
              <div className="space-y-6">
                <div>
                  <span className="text-[10px] font-mono font-bold uppercase px-2 py-0.5 rounded bg-purple-500/10 text-purple-300 border border-purple-500/20">
                    Assignment Analytics
                  </span>
                  <h2 className="text-xl font-display font-bold text-[var(--ink)] mt-1">{analyticsData.assignment.title}</h2>
                  <p className="text-xs font-mono text-[var(--ink-dim)]">
                    Allowed Languages: {analyticsData.assignment.languageMode === "RESTRICTED" && analyticsData.assignment.allowedLanguages.length > 0
                      ? analyticsData.assignment.allowedLanguages.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ")
                      : "Any Supported Language"}
                  </p>
                </div>

                {/* Submissions & Language Usage Stats */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 font-mono text-xs">
                  <div className="p-3 rounded-xl glass border border-white/10">
                    <span className="text-[10px] text-[var(--ink-dim)] block">Total Submissions</span>
                    <p className="text-2xl font-bold text-emerald-400">{analyticsData.totalSubmissions}</p>
                  </div>

                  <div className="p-3 rounded-xl glass border border-white/10">
                    <span className="text-[10px] text-[var(--ink-dim)] block">Success Rate</span>
                    <p className="text-2xl font-bold text-[var(--syn-keyword)]">{analyticsData.successRate}%</p>
                  </div>

                  <div className="p-3 rounded-xl glass border border-white/10">
                    <span className="text-[10px] text-[var(--ink-dim)] block">Average Score</span>
                    <p className="text-2xl font-bold text-gradient">{analyticsData.avgScore}%</p>
                  </div>

                  <div className="p-3 rounded-xl glass border border-white/10">
                    <span className="text-[10px] text-[var(--ink-dim)] block">Most Used Language</span>
                    <p className="text-2xl font-bold text-[var(--syn-function)]">{analyticsData.mostUsedLanguage}</p>
                  </div>
                </div>

                {/* Language Breakdown Section (Requirement 11) */}
                <div className="space-y-3 p-4 rounded-xl bg-white/[0.03] border border-[var(--border)] font-mono text-xs">
                  <h3 className="font-bold text-[var(--ink)] flex items-center gap-2">
                    <Code2 className="w-4 h-4 text-[var(--syn-string)]" />
                    <span>Language Usage Breakdown</span>
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                    {Object.entries(analyticsData.languageUsage).map(([lang, count]) => (
                      <div key={lang} className="p-2.5 rounded-lg glass border border-white/10 flex items-center justify-between">
                        <span className="font-bold uppercase text-[var(--syn-function)]">{lang === "cpp" ? "C++" : lang}</span>
                        <span className="text-xs font-mono font-bold text-[var(--ink)]">{count} submission(s)</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Student Submissions Table */}
                <div className="space-y-3 font-mono text-xs">
                  <h3 className="font-bold text-[var(--ink)]">Student Submissions Log</h3>
                  <div className="overflow-x-auto max-h-60">
                    <table className="w-full text-left">
                      <thead>
                        <tr className="border-b border-[var(--border)] text-[var(--ink-dim)] text-[11px]">
                          <th className="pb-2 font-medium">Student</th>
                          <th className="pb-2 font-medium">Language</th>
                          <th className="pb-2 font-medium">Status</th>
                          <th className="pb-2 font-medium">Time</th>
                          <th className="pb-2 font-medium text-right">Score</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-[var(--border)]">
                        {analyticsData.submissions.map((sub) => (
                          <tr key={sub.id} className="hover:bg-white/[0.02]">
                            <td className="py-2.5">
                              <p className="font-bold text-[var(--ink)]">{sub.studentName}</p>
                              <p className="text-[10px] text-[var(--ink-dim)]">{sub.rollNumber}</p>
                            </td>
                            <td className="py-2.5 uppercase font-bold text-[var(--syn-function)]">
                              {sub.language === "cpp" ? "C++" : sub.language}
                            </td>
                            <td className="py-2.5">
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${sub.status === "Success" ? "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20" : "bg-rose-500/10 text-rose-300 border border-rose-500/20"}`}>
                                {sub.status}
                              </span>
                            </td>
                            <td className="py-2.5 text-[var(--ink-dim)]">{sub.executionTime}</td>
                            <td className="py-2.5 text-right font-bold text-[var(--syn-keyword)]">{sub.score}%</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
