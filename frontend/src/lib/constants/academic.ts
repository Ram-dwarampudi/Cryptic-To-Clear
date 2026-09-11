/**
 * Academic Branch and Section single source of truth for Cryptic to Clear
 */

export const ACADEMIC_BRANCHES = [
  "CSE",
  "CSBS",
  "IT",
  "AIDS",
  "AIML",
] as const;

export type AcademicBranch = (typeof ACADEMIC_BRANCHES)[number];

export const ACADEMIC_SECTIONS = [
  "A",
  "B",
  "C",
  "D",
  "E",
] as const;

export type AcademicSection = (typeof ACADEMIC_SECTIONS)[number];

export const BRANCH_NAMES: Record<AcademicBranch, string> = {
  CSE: "Computer Science & Engineering",
  CSBS: "Computer Science & Business Systems",
  IT: "Information Technology",
  AIDS: "Artificial Intelligence & Data Science",
  AIML: "Artificial Intelligence & Machine Learning",
};
