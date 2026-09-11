"use client";

import React, { useState, useEffect } from "react";
import { StudentSummary, fetchFacultyStudents } from "@/lib/api";
import { ACADEMIC_BRANCHES, ACADEMIC_SECTIONS } from "@/lib/constants/academic";
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronLeft,
  ChevronRight,
  UserCheck,
  AlertCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";

interface StudentsTabProps {
  onSelectStudent: (studentId: string) => void;
}

export default function StudentsTab({ onSelectStudent }: StudentsTabProps) {
  const [students, setStudents] = useState<StudentSummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [branch, setBranch] = useState("");
  const [section, setSection] = useState("");
  const [year, setYear] = useState("");
  const [status, setStatus] = useState("");
  const [sortBy, setSortBy] = useState("codingScore");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadData = async () => {
    setLoading(true);
    const res = await fetchFacultyStudents({
      search,
      branch,
      section,
      year,
      status,
      sortBy,
      sortOrder,
      page,
      limit: 10,
    });
    if (res.success && res.data) {
      setStudents(res.data.students);
      setTotalPages(res.data.pagination.totalPages);
      setTotalCount(res.data.pagination.total);
    }
    setLoading(false);
  };

  useEffect(() => {
    loadData();
  }, [search, branch, section, year, status, sortBy, sortOrder, page]);

  const handleSortToggle = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === "asc" ? "desc" : "asc");
    } else {
      setSortBy(field);
      setSortOrder("desc");
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-display font-bold tracking-tight text-[var(--ink)]">Student Management</h1>
          <p className="text-xs text-[var(--ink-dim)] font-mono">
            Enrolled Student Directory • Total: {totalCount}
          </p>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl p-4 space-y-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-5 gap-3">
          {/* Search */}
          <div className="relative sm:col-span-2">
            <label htmlFor="student-search" className="sr-only">Search students</label>
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--ink-faint)] pointer-events-none" />
            <input
              id="student-search"
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, roll no, or email..."
              className="w-full bg-[var(--bg)] border border-[var(--border)] rounded-xl pl-9 pr-3 py-2 text-xs text-[var(--ink)] placeholder-[var(--ink-faint)] font-mono focus:outline-none focus:border-[var(--syn-keyword)] transition-colors"
            />
          </div>

          {/* Filter Branch */}
          <select
            id="filter-branch"
            value={branch}
            onChange={(e) => {
              setBranch(e.target.value);
              setPage(1);
            }}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--syn-keyword)] cursor-pointer"
          >
            <option value="">All Branches</option>
            {ACADEMIC_BRANCHES.map((b) => (
              <option key={b} value={b}>
                {b}
              </option>
            ))}
          </select>

          {/* Filter Section */}
          <select
            id="filter-section"
            value={section}
            onChange={(e) => {
              setSection(e.target.value);
              setPage(1);
            }}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--syn-keyword)] cursor-pointer"
          >
            <option value="">All Sections</option>
            {ACADEMIC_SECTIONS.map((sec) => (
              <option key={sec} value={sec}>
                Section {sec}
              </option>
            ))}
          </select>

          {/* Filter Status */}
          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="bg-[var(--bg)] border border-[var(--border)] rounded-xl px-3 py-2 text-xs text-[var(--ink)] font-mono focus:outline-none focus:border-[var(--syn-keyword)]"
          >
            <option value="">All Statuses</option>
            <option value="Active">Active</option>
            <option value="At Risk">At Risk</option>
            <option value="Inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Student Table */}
      <div className="glass-strong border border-[var(--border-strong)] rounded-2xl overflow-hidden">
        {loading ? (
          <div className="p-12 flex flex-col items-center justify-center gap-3">
            <Loader2 className="w-7 h-7 text-[var(--syn-keyword)] animate-spin" />
            <p className="text-xs font-mono text-[var(--ink-dim)]">Loading student roster...</p>
          </div>
        ) : students.length === 0 ? (
          <div className="p-12 text-center text-xs font-mono text-[var(--ink-dim)]">
            No students found matching your filters.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left font-mono text-xs">
              <thead>
                <tr className="border-b border-[var(--border)] text-[var(--ink-dim)] text-[11px] bg-white/[0.02]">
                  <th className="py-3.5 px-4 font-medium">
                    <button onClick={() => handleSortToggle("name")} className="flex items-center gap-1 hover:text-[var(--ink)] cursor-pointer">
                      <span>Student Name</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-3 font-medium">Roll No</th>
                  <th className="py-3.5 px-3 font-medium">Branch/Sec</th>
                  <th className="py-3.5 px-3 font-medium">
                    <button onClick={() => handleSortToggle("programsAttempted")} className="flex items-center gap-1 hover:text-[var(--ink)] cursor-pointer">
                      <span>Executions</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-3 font-medium">Errors</th>
                  <th className="py-3.5 px-3 font-medium">AI Used</th>
                  <th className="py-3.5 px-3 font-medium">
                    <button onClick={() => handleSortToggle("codingScore")} className="flex items-center gap-1 hover:text-[var(--ink)] cursor-pointer">
                      <span>Coding Score</span>
                      <ArrowUpDown className="w-3 h-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-3 font-medium">Status</th>
                  <th className="py-3.5 px-4 font-medium text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[var(--border)]">
                {students.map((student) => {
                  const isAtRisk = student.status === "At Risk";
                  const isInactive = student.status === "Inactive";

                  return (
                    <tr
                      key={student.id}
                      onClick={() => onSelectStudent(student.id)}
                      className="hover:bg-white/[0.04] transition-colors cursor-pointer group"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          {student.avatar ? (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img src={student.avatar} alt="" className="w-7 h-7 rounded-full bg-white/10" />
                          ) : (
                            <div className="w-7 h-7 rounded-full bg-gradient-to-tr from-[var(--syn-keyword)] to-[var(--syn-function)] flex items-center justify-center font-bold text-[10px] text-[#0a0d13]">
                              {student.name.charAt(0)}
                            </div>
                          )}
                          <div>
                            <p className="font-bold text-[var(--ink)] group-hover:text-[var(--syn-keyword)] transition-colors">
                              {student.name}
                            </p>
                            <p className="text-[10px] text-[var(--ink-faint)] truncate max-w-[140px]">{student.email}</p>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-3 font-semibold text-[var(--ink-dim)]">{student.rollNumber}</td>

                      <td className="py-3.5 px-3">
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-500/15 text-purple-300 border border-purple-500/30">
                            {student.branch || "CSE"}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-white/5 border border-white/10 text-[var(--ink-dim)]">
                            Sec {student.section || "A"}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-3">
                        <span className="text-emerald-400 font-bold">{student.successfulExecutions}</span> / {student.programsExecuted}
                      </td>

                      <td className="py-3.5 px-3 text-rose-400 font-bold">{student.compilerErrors}</td>

                      <td className="py-3.5 px-3 text-indigo-400 font-bold">{student.aiExplanations}</td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`font-bold ${
                            student.codingScore >= 85
                              ? "text-emerald-400"
                              : student.codingScore >= 70
                              ? "text-amber-400"
                              : "text-rose-400"
                          }`}
                        >
                          {student.codingScore}%
                        </span>
                      </td>

                      <td className="py-3.5 px-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            isAtRisk
                              ? "bg-amber-500/10 text-amber-300 border border-amber-500/20"
                              : isInactive
                              ? "bg-slate-500/10 text-slate-400 border border-slate-500/20"
                              : "bg-emerald-500/10 text-emerald-300 border border-emerald-500/20"
                          }`}
                        >
                          {student.status}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 text-right">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            onSelectStudent(student.id);
                          }}
                          className="p-1.5 rounded-lg text-[var(--syn-function)] hover:bg-[var(--syn-function)]/10 transition-colors cursor-pointer"
                          title="View Student Performance"
                        >
                          <ExternalLink className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination Footer */}
        <div className="p-4 border-t border-[var(--border)] flex items-center justify-between font-mono text-xs text-[var(--ink-dim)]">
          <span>
            Page {page} of {totalPages}
          </span>
          <div className="flex items-center gap-2">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-1.5 rounded-lg glass border border-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              disabled={page >= totalPages}
              onClick={() => setPage(page + 1)}
              className="p-1.5 rounded-lg glass border border-white/10 disabled:opacity-30 cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
