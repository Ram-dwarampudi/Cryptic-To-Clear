/**
 * Client API for University Community Modules:
 * - Senior-to-Junior Interview Hub
 * - Campus Doubt Resolution Forum
 */

const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:5000`
    : "http://127.0.0.1:5000";

const RAW_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  process.env.NEXT_PUBLIC_API_URL ||
  DEFAULT_API_BASE_URL;

const API_BASE_URL = RAW_BASE_URL.replace(/\/$/, "").replace(/\/api$/, "") + "/api";

function getCommunityHeaders(): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = typeof window !== "undefined" ? localStorage.getItem("c2c_token") : null;
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
}

export interface InterviewRound {
  roundNumber: number;
  roundName: string;
  roundType: string;
  duration?: string;
  details?: string;
  questions: string[];
}

export interface InterviewExperience {
  id: string;
  companyName: string;
  companyLogo?: string;
  roleTitle: string;
  jobType: string;
  packageCTC?: string;
  location?: string;
  driveType: string;
  difficulty: "EASY" | "MEDIUM" | "HARD";
  selectionStatus: string;
  graduationYear?: number;
  summary: string;
  rounds: InterviewRound[];
  tips?: string;
  preparationResources?: string;
  isAnonymous: boolean;
  upvotes: number;
  createdAt: string;
  student: {
    id: string;
    name: string;
    role: string;
    batchYear?: number;
    avatar?: string;
    department?: { code: string; name: string };
  };
  university?: {
    name: string;
    code: string;
  };
}

export interface CompanyStat {
  companyName: string;
  companyLogo?: string;
  count: number;
  packages: string[];
}

export interface DoubtAnswer {
  id: string;
  content: string;
  codeSnippet?: string;
  isAccepted: boolean;
  isFacultyEndorsed: boolean;
  endorsedByFacultyName?: string;
  upvotes: number;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    avatar?: string;
    karmaPoints: number;
    department?: { code: string };
  };
}

export interface DoubtItem {
  id: string;
  title: string;
  description: string;
  codeSnippet?: string;
  language?: string;
  tags: string[];
  privacy: "PUBLIC" | "ANONYMOUS_PEERS" | "FACULTY_ONLY";
  status: "OPEN" | "RESOLVED";
  resolvedAnswerId?: string;
  views: number;
  answersCount?: number;
  hasAcceptedAnswer?: boolean;
  hasFacultyEndorsement?: boolean;
  createdAt: string;
  author: {
    id: string;
    name: string;
    role: string;
    batchYear?: number;
    avatar?: string;
    department?: { code: string; name: string };
  };
  answers?: DoubtAnswer[];
}

export interface UserDoubtStats {
  user: {
    id: string;
    name: string;
    karmaPoints: number;
    role: string;
  };
  doubtsAsked: number;
  doubtsResolved: number;
  answersGiven: number;
  solutionsAccepted: number;
  karmaPoints: number;
}

// ==========================================
// Interview Experience APIs
// ==========================================

export async function fetchInterviews(params: {
  search?: string;
  company?: string;
  difficulty?: string;
  driveType?: string;
  year?: string;
  page?: number;
}): Promise<{ success: boolean; data: InterviewExperience[]; total?: number }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.company) query.append("company", params.company);
    if (params.difficulty) query.append("difficulty", params.difficulty);
    if (params.driveType) query.append("driveType", params.driveType);
    if (params.year) query.append("year", params.year);
    if (params.page) query.append("page", String(params.page));

    const res = await fetch(`${API_BASE_URL}/interviews?${query.toString()}`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data || [], total: data.pagination?.total };
  } catch {
    return { success: false, data: [] };
  }
}

export async function fetchCompanyStats(): Promise<{ success: boolean; data: CompanyStat[] }> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/companies`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data || [] };
  } catch {
    return { success: false, data: [] };
  }
}

export async function fetchInterviewById(id: string): Promise<{ success: boolean; data?: InterviewExperience }> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/${id}`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data };
  } catch {
    return { success: false };
  }
}

export async function createInterviewExperience(payload: {
  companyName: string;
  roleTitle: string;
  packageCTC?: string;
  location?: string;
  driveType?: string;
  difficulty?: string;
  selectionStatus?: string;
  graduationYear?: number;
  summary: string;
  rounds: InterviewRound[];
  tips?: string;
  preparationResources?: string;
  isAnonymous?: boolean;
  studentId?: string;
}): Promise<{ success: boolean; message?: string; data?: InterviewExperience }> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews`, {
      method: "POST",
      headers: getCommunityHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error creating interview experience." };
  }
}

export async function upvoteInterview(id: string): Promise<{ success: boolean; upvotes?: number }> {
  try {
    const res = await fetch(`${API_BASE_URL}/interviews/${id}/upvote`, {
      method: "POST",
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    return await res.json();
  } catch {
    return { success: false };
  }
}

// ==========================================
// Doubt Forum APIs
// ==========================================

export async function fetchDoubts(params: {
  search?: string;
  status?: string;
  tag?: string;
  language?: string;
  authorId?: string;
  currentUserId?: string;
  userRole?: string;
}): Promise<{ success: boolean; data: DoubtItem[]; total?: number }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.append("search", params.search);
    if (params.status) query.append("status", params.status);
    if (params.tag) query.append("tag", params.tag);
    if (params.language) query.append("language", params.language);
    if (params.authorId) query.append("authorId", params.authorId);
    if (params.currentUserId) query.append("currentUserId", params.currentUserId);
    if (params.userRole) query.append("userRole", params.userRole);

    const res = await fetch(`${API_BASE_URL}/doubts?${query.toString()}`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data || [], total: data.pagination?.total };
  } catch {
    return { success: false, data: [] };
  }
}

export async function fetchDoubtById(
  id: string,
  userRole = "STUDENT",
  currentUserId = "usr_demo_001"
): Promise<{ success: boolean; data?: DoubtItem }> {
  try {
    const res = await fetch(`${API_BASE_URL}/doubts/${id}?userRole=${userRole}&currentUserId=${currentUserId}`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data };
  } catch {
    return { success: false };
  }
}

export async function createDoubt(payload: {
  title: string;
  description: string;
  codeSnippet?: string;
  language?: string;
  tags?: string[];
  privacy?: "PUBLIC" | "ANONYMOUS_PEERS" | "FACULTY_ONLY";
  authorId?: string;
}): Promise<{ success: boolean; message?: string; data?: DoubtItem }> {
  try {
    const res = await fetch(`${API_BASE_URL}/doubts`, {
      method: "POST",
      headers: getCommunityHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error submitting doubt." };
  }
}

export async function createDoubtAnswer(
  doubtId: string,
  payload: {
    content: string;
    codeSnippet?: string;
    authorId?: string;
  }
): Promise<{ success: boolean; message?: string; data?: DoubtAnswer }> {
  try {
    const res = await fetch(`${API_BASE_URL}/doubts/${doubtId}/answers`, {
      method: "POST",
      headers: getCommunityHeaders(),
      credentials: "include",
      body: JSON.stringify(payload),
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error submitting answer." };
  }
}

export async function acceptDoubtAnswer(
  doubtId: string,
  answerId: string
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/doubts/${doubtId}/accept/${answerId}`, {
      method: "PATCH",
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    return await res.json();
  } catch {
    return { success: false, message: "Network error accepting answer." };
  }
}

export async function fetchUserDoubtStats(userId = "usr_demo_001"): Promise<{ success: boolean; data?: UserDoubtStats }> {
  try {
    const res = await fetch(`${API_BASE_URL}/doubts/stats/me?userId=${userId}`, {
      headers: getCommunityHeaders(),
      credentials: "include",
    });
    const data = await res.json();
    return { success: data.success, data: data.data };
  } catch {
    return { success: false };
  }
}
