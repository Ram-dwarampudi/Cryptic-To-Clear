const DEFAULT_API_BASE_URL =
  typeof window !== "undefined"
    ? `http://${window.location.hostname}:5000`
    : "http://127.0.0.1:5000";

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_BASE_URL ?? DEFAULT_API_BASE_URL).replace(/\/$/, "");

export function getAuthHeaders(token?: string | null): Record<string, string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const authToken =
    token || (typeof window !== "undefined" ? localStorage.getItem("c2c_token") : null);
  if (authToken) {
    headers["Authorization"] = `Bearer ${authToken}`;
  }
  return headers;
}

export interface ExecuteRequest {
  language: string;
  sourceCode: string;
  stdin?: string;
}

export interface ExecuteResponse {
  success: true;
  language: string;
  languageType: "compiled" | "interpreted";
  statusId: number;
  statusDescription: string;
  output: string;
  compileError: string;
  runtimeError: string;
  time: string | null;
  memory: number | null;
  isAccepted: boolean;
}

export interface ExecuteErrorResponse {
  success: false;
  message: string;
}

export type ExecuteResult = ExecuteResponse | ExecuteErrorResponse;

export interface AIExplanation {
  errorSummary: string;
  reason: string;
  errorLine: string;
  simpleExplanation: string;
  howToFix: string;
  correctCode: string;
  commonMistakes: string[];
  bestPractices: string[];
  optimizationTips: string[];
}

export interface ExplainRequest {
  language: string;
  error: string;
  sourceCode: string;
}

export interface ExplainSuccess {
  success: true;
  explanation: AIExplanation;
}

export interface ExplainFailure {
  success: false;
  message: string;
}

export type ExplainResult = ExplainSuccess | ExplainFailure;

export interface ChatApiMessage {
  role: "user" | "assistant";
  content: string;
}

export interface ChatRequest {
  language: string;
  sourceCode: string;
  messages: ChatApiMessage[];
}

export interface ChatSuccess {
  success: true;
  reply: string;
}

export interface ChatFailure {
  success: false;
  message: string;
}

export type ChatResult = ChatSuccess | ChatFailure;

/**
 * Calls the Express backend's POST /api/chat endpoint that powers the
 * permanent AI Chat panel. Sends the running conversation plus the current
 * editor language/code as context, gets back a markdown reply. Never
 * throws — always resolves to a tagged result.
 */
export async function sendChatMessage(req: ChatRequest): Promise<ChatResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const res = await fetch(`${API_BASE_URL}/api/chat`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ?? `The AI chat returned an error (HTTP ${res.status}).`,
      };
    }

    return data as ChatSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "The AI chat request timed out. Please try again." };
    }
    return {
      success: false,
      message: "Could not reach the AI chat service. Make sure the Express server is running.",
    };
  }
}

export type Severity = "low" | "medium" | "high";

export interface PerformanceSuggestion {
  title: string;
  detail: string;
  impact: Severity;
}

export interface SecurityIssue {
  issue: string;
  detail: string;
  severity: Severity;
}

export interface NamingSuggestion {
  current: string;
  suggested: string;
  reason: string;
}

export interface EdgeCaseResult {
  caseName: string;
  handled: boolean;
  note: string;
}

export interface OptimalSolutionComparison {
  isOptimal: boolean;
  theoreticalOptimalTime: string;
  suggestion: string;
}

export interface CodeAnalysis {
  readabilityScore: number;
  maintainabilityScore: number;
  summary: string;
  timeComplexity?: string;
  timePercentile?: number;
  timeExplanation?: string;
  spaceComplexity?: string;
  spacePercentile?: number;
  spaceExplanation?: string;
  performanceSuggestions: PerformanceSuggestion[];
  securityIssues: SecurityIssue[];
  edgeCases?: EdgeCaseResult[];
  optimalComparison?: OptimalSolutionComparison;
  unusedVariables: string[];
  duplicateCode: string[];
  deadCode: string[];
  variableNamingSuggestions: NamingSuggestion[];
  functionNamingSuggestions: NamingSuggestion[];
  aiRecommendations: string[];
}

export interface AnalyzeRequest {
  language: string;
  sourceCode: string;
}

export interface AnalyzeSuccess {
  success: true;
  analysis: CodeAnalysis;
}

export interface AnalyzeFailure {
  success: false;
  message: string;
}

export type AnalyzeResult = AnalyzeSuccess | AnalyzeFailure;

export type DebugAction =
  | "init"
  | "call"
  | "return"
  | "assign"
  | "loop"
  | "condition"
  | "output"
  | "other";

export interface DebugVariable {
  name: string;
  value: string;
  type: string;
  scope: string;
}

export interface DebugMemoryEntry {
  location: "stack" | "heap";
  name: string;
  type: string;
  value: string;
}

export interface ExecutionStep {
  step: number;
  line: number;
  action: DebugAction;
  description: string;
  callStack: string[];
  variables: DebugVariable[];
  memory: DebugMemoryEntry[];
  outputDelta: string;
}

export interface ExecutionTrace {
  summary: string;
  steps: ExecutionStep[];
}

export interface TraceRequest {
  language: string;
  sourceCode: string;
  stdin?: string;
}

export interface TraceSuccess {
  success: true;
  trace: ExecutionTrace;
}

export interface TraceFailure {
  success: false;
  message: string;
}

export type TraceResult = TraceSuccess | TraceFailure;

/**
 * Calls the Express backend's POST /api/debug/trace endpoint, which asks
 * OpenAI to simulate a step-by-step execution trace of the current code for
 * the Visual Debugger. Never throws — always resolves to a tagged result.
 */
export async function generateTrace(req: TraceRequest): Promise<TraceResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(`${API_BASE_URL}/api/debug/trace`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message ?? `The debugger returned an error (HTTP ${res.status}).`,
      };
    }

    return data as TraceSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "The debugger request timed out. Please try again." };
    }
    return {
      success: false,
      message: "Could not reach the debugger service. Make sure the Express server is running.",
    };
  }
}

export interface ComplexityAnalysis {
  timeComplexity: string;
  spaceComplexity: string;
  explanation: string;
}

export interface QuestionWithHint {
  question: string;
  hint: string;
}

export interface LearningContent {
  topic: string;
  beginnerExplanation: string;
  intermediateExplanation: string;
  advancedExplanation: string;
  realLifeExample: string;
  flowchartMermaid: string;
  pseudoCode: string;
  complexityAnalysis: ComplexityAnalysis;
  practiceQuestion: QuestionWithHint;
  interviewQuestion: QuestionWithHint;
  relatedTopics: string[];
}

export interface LearnRequest {
  language: string;
  sourceCode: string;
}

export interface LearnSuccess {
  success: true;
  content: LearningContent;
}

export interface LearnFailure {
  success: false;
  message: string;
}

export type LearnResult = LearnSuccess | LearnFailure;

/**
 * Calls the Express backend's POST /api/learn endpoint, which asks OpenAI
 * for a complete multi-level teaching package about the current code.
 * Powers Learning Mode. Never throws — always resolves to a tagged result.
 */
export async function learnCode(req: LearnRequest): Promise<LearnResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(`${API_BASE_URL}/api/learn`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message ?? `Learning Mode returned an error (HTTP ${res.status}).`,
      };
    }

    return data as LearnSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "The Learning Mode request timed out. Please try again." };
    }
    return {
      success: false,
      message: "Could not reach Learning Mode. Make sure the Express server is running.",
    };
  }
}

export interface LanguageDifference {
  aspect: string;
  explanation: string;
}

export interface CodeConversion {
  convertedCode: string;
  preservedLogicSummary: string;
  differences: LanguageDifference[];
  conversionNotes: string;
}

export interface ConvertRequest {
  sourceLanguage: string;
  targetLanguage: string;
  sourceCode: string;
}

export interface ConvertSuccess {
  success: true;
  conversion: CodeConversion;
}

export interface ConvertFailure {
  success: false;
  message: string;
}

export type ConvertResult = ConvertSuccess | ConvertFailure;

/**
 * Calls the Express backend's POST /api/convert endpoint, which asks
 * OpenAI to convert code between two languages while preserving logic.
 * Never throws — always resolves to a tagged result.
 */
export async function convertCode(req: ConvertRequest): Promise<ConvertResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(`${API_BASE_URL}/api/convert`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message ?? `Code Conversion returned an error (HTTP ${res.status}).`,
      };
    }

    return data as ConvertSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "The conversion request timed out. Please try again." };
    }
    return {
      success: false,
      message: "Could not reach Code Conversion. Make sure the Express server is running.",
    };
  }
}

/**
 * Calls the Express backend's POST /api/analyze endpoint, which sends the
 * current editor language/code to OpenAI and returns a structured code
 * quality report for the Code Quality Analyzer. Never throws — always
 * resolves to a tagged result.
 */
export async function analyzeCode(req: AnalyzeRequest): Promise<AnalyzeResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 40000);

    const res = await fetch(`${API_BASE_URL}/api/analyze`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message ?? `The analyzer returned an error (HTTP ${res.status}).`,
      };
    }

    return data as AnalyzeSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return { success: false, message: "The analysis request timed out. Please try again." };
    }
    return {
      success: false,
      message: "Could not reach the analyzer service. Make sure the Express server is running.",
    };
  }
}

/**
 * Calls the Express backend's POST /api/explain endpoint, which sends the
 * language, compiler error, and source code to OpenAI and returns a
 * structured explanation. Like executeCode, this never throws — it always
 * resolves to a tagged result so the AI panel can render it directly.
 */
export async function explainError(req: ExplainRequest): Promise<ExplainResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 35000);

    const res = await fetch(`${API_BASE_URL}/api/explain`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ??
          `The AI explanation service returned an error (HTTP ${res.status}).`,
      };
    }

    return data as ExplainSuccess;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        message: "The AI explanation request timed out. Please try again.",
      };
    }
    return {
      success: false,
      message:
        "Could not reach the AI explanation service. Make sure the Express server is running.",
    };
  }
}

/**
 * Calls the Express backend's POST /api/execute endpoint, which in turn
 * compiles + runs the code via the Groq AI engine. Never throws for expected failure
 * cases (bad code, unreachable backend, etc.) — it always resolves to a
 * tagged result so the UI can render it directly.
 */
export async function executeCode(
  req: ExecuteRequest
): Promise<ExecuteResult> {
  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 25000);

    const res = await fetch(`${API_BASE_URL}/api/execute`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(req),
      signal: controller.signal,
    });
    clearTimeout(timeout);

    const data = await res.json().catch(() => null);

    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message:
          data?.message ??
          `The compiler service returned an error (HTTP ${res.status}).`,
      };
    }

    return data as ExecuteResponse;
  } catch (err) {
    if (err instanceof DOMException && err.name === "AbortError") {
      return {
        success: false,
        message: "The request timed out. Please try again.",
      };
    }
    return {
      success: false,
      message:
        "Could not reach the compiler backend. Make sure the Express server is running and NEXT_PUBLIC_API_BASE_URL is set correctly.",
    };
  }
}

/* ==========================================================================
   AUTHENTICATION & USER TYPES AND APIS
   ========================================================================== */

export interface User {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  provider: "local" | "google" | "github";
  role: "student" | "faculty" | "admin" | "user";
  institutionId?: string;
  departmentId?: string;
  university?: string;
  department?: string;
  title?: string;
  bio?: string;
  collegeName?: string;
  stream?: string;
  rollNo?: string;
  isDemoAccount?: boolean;
  plan: "free" | "pro" | "team" | "enterprise";
  subscriptionStatus: "active" | "inactive" | "trialing" | "canceled";
  subscriptionExpiry?: string | null;
  credits: number;
  createdAt: string;
  updatedAt: string;
  lastLogin: string;
}

export interface AuthResponse {
  success: boolean;
  message?: string;
  user?: User;
  token?: string;
}

export async function loginUser(identifier: string, password: string): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email: identifier, identifier, rollNo: identifier, password }),
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message || "Invalid credentials.",
      };
    }
    return data as AuthResponse;
  } catch {
    return {
      success: false,
      message: "Could not connect to authentication server.",
    };
  }
}

export async function loginFacultyDemo(): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/faculty-demo`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message || "Could not log into Demo Faculty account.",
      };
    }
    return data as AuthResponse;
  } catch {
    return {
      success: false,
      message: "Could not connect to Faculty Demo authentication server.",
    };
  }
}

export interface GoogleAuthPayload {
  credential?: string;
  accessToken?: string;
  userInfo?: {
    email: string;
    name?: string;
    picture?: string;
  };
  isDemoGoogle?: boolean;
}

export async function loginWithGoogle(data: GoogleAuthPayload): Promise<AuthResponse> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
      credentials: "include",
    });
    const result = await res.json().catch(() => null);
    if (!res.ok || !result || result.success === false) {
      return {
        success: false,
        message: result?.message || "Google authentication failed.",
      };
    }
    return result as AuthResponse;
  } catch {
    return {
      success: false,
      message: "Could not connect to authentication server for Google Sign-In.",
    };
  }
}

export interface RegisterOptions {
  role?: "student" | "faculty";
  rollNo?: string;
  departmentId?: string;
  batchYear?: number;
  collegeName?: string;
  stream?: string;
  branch?: string;
  section?: string;
  title?: string;
  avatar?: string;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
  optionsOrRole?: "student" | "faculty" | RegisterOptions
): Promise<AuthResponse> {
  const payload: Record<string, any> = { name, email, password };
  if (typeof optionsOrRole === "string") {
    payload.role = optionsOrRole;
  } else if (optionsOrRole && typeof optionsOrRole === "object") {
    Object.assign(payload, optionsOrRole);
    if (!payload.role) payload.role = "student";
  } else {
    payload.role = "student";
  }

  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success === false) {
      return {
        success: false,
        message: data?.message || "Could not complete registration.",
      };
    }
    return data as AuthResponse;
  } catch {
    return {
      success: false,
      message: "Could not connect to registration server.",
    };
  }
}

export async function logoutUser(): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/logout`, {
      method: "POST",
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    return data || { success: true };
  } catch {
    return { success: true };
  }
}

export async function fetchMe(token?: string): Promise<AuthResponse & { isNetworkError?: boolean }> {
  try {
    const headers: Record<string, string> = { "Content-Type": "application/json" };
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
      method: "GET",
      headers,
      credentials: "include",
    });
    const data = await res.json().catch(() => null);
    if (!res.ok || !data || data.success === false) {
      return { success: false, message: data?.message || "Session unauthenticated." };
    }
    return data as AuthResponse;
  } catch {
    return { success: false, message: "Could not fetch user session.", isNetworkError: true };
  }
}

export async function requestForgotPassword(email: string): Promise<{ success: boolean; message: string; demoNote?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/auth/forgot-password`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    const data = await res.json().catch(() => null);
    return data || { success: true, message: "Instructions dispatched." };
  } catch {
    return { success: false, message: "Network error requesting password reset." };
  }
}

/* ==========================================================================
   FACULTY DASHBOARD TYPES AND APIS
   ========================================================================== */

export interface FacultyInsight {
  id: string;
  type: "warning" | "critical" | "info" | "trend";
  title: string;
  description: string;
  actionable: string;
}

export interface ActivityItem {
  id: string;
  studentName: string;
  rollNumber: string;
  section: string;
  language: string;
  status: string;
  detail: string;
  timestamp: string;
}

export interface InstitutionInfo {
  id: string;
  name: string;
  code: string;
  logo: string;
}

export interface FacultyOverviewData {
  totalStudents: number;
  activeStudents: number;
  atRiskStudents: number;
  programsExecuted: number;
  compilationErrors: number;
  aiExplanationsUsed: number;
  averageCodingScore: number;
  insights: FacultyInsight[];
  recentActivity: ActivityItem[];
  institution: InstitutionInfo;
}

export interface StudentSummary {
  id: string;
  userId: string;
  name: string;
  rollNumber: string;
  email: string;
  branch: string;
  year: number;
  section: string;
  institutionId: string;
  programsExecuted: number;
  successfulExecutions: number;
  compilerErrors: number;
  aiExplanations: number;
  codingScore: number;
  lastActive: string;
  status: "Active" | "At Risk" | "Inactive";
  avatar?: string;
  frequentMistakes?: string[];
  languageStats?: Record<string, number>;
}

export interface StudentDetailData extends StudentSummary {
  institutionName: string;
  department: string;
  progressTimeline: Array<{ week: string; score: number; executions: number; errors: number }>;
  errorCategories: Array<{ category: string; count: number }>;
  attemptedPrograms: Array<{ id: string; title: string; language: string; status: string; attempts: number; timeSpent: string; score: number }>;
}

export interface ErrorCategoryStat {
  category: string;
  count: number;
  percentage: number;
  description: string;
}

export interface LanguageWiseError {
  language: string;
  syntax: number;
  compilation: number;
  type: number;
  runtime: number;
  logic: number;
  total: number;
}

export interface CommonErrorItem {
  error: string;
  count: number;
  affectedStudents: number;
  primaryLanguage: string;
}

export interface ErrorAnalyticsData {
  totalErrors: number;
  byCategory: ErrorCategoryStat[];
  languageWise: LanguageWiseError[];
  mostCommonErrors: CommonErrorItem[];
  weeklyTrend: Array<{ day: string; syntax: number; compilation: number; runtime: number }>;
}

export interface LanguageStat {
  language: string;
  code: string;
  executions: number;
  successRate: number;
  errorRate: number;
  color: string;
}

export interface LanguageAnalyticsData {
  mostUsedLanguage: string;
  languages: LanguageStat[];
}

export interface ClassSection {
  id: string;
  institutionId: string;
  facultyId: string;
  name: string;
  branch?: string;
  section: string;
  classCode?: string;
  year: number;
  studentCount: number;
}

export interface TestCase {
  id?: string;
  input: string;
  expectedOutput: string;
  isHidden: boolean;
  explanation?: string;
}

export interface SubmissionRecord {
  id: string;
  assignmentId: string;
  studentId: string;
  studentName: string;
  rollNumber: string;
  language: string;
  sourceCode: string;
  status: string;
  score: number;
  submittedAt: string;
  executionTime: string;
  compilerErrors?: string;
  aiExplanation?: string;
}

export interface AssignmentItem {
  id: string;
  facultyId: string;
  classId: string;
  className: string;
  title: string;
  description: string;
  instructions?: string;
  assignmentType?: string;
  languageMode: "ANY" | "RESTRICTED";
  preferredLanguage?: string;
  allowedLanguages: string[];
  testCases?: TestCase[];
  points?: number;
  difficulty?: "easy" | "medium" | "hard";
  startDate?: string;
  deadline: string;
  maxAttempts?: number;
  totalAssigned: number;
  submissionsCount: number;
  avgScore: number;
  createdAt: string;
  submitted?: boolean;
  latestSubmission?: SubmissionRecord;
}

export interface AssignmentAnalyticsData {
  assignment: AssignmentItem;
  totalSubmissions: number;
  successRate: number;
  avgScore: number;
  mostUsedLanguage: string;
  languageUsage: Record<string, number>;
  submissions: SubmissionRecord[];
}

export interface FacultySubscriptionData {
  institution: string;
  plan: string;
  status: string;
  facultySeatsMax: number;
  facultySeatsUsed: number;
  studentSeatsMax: number;
  studentSeatsUsed: number;
  aiCreditsQuota: number;
  aiCreditsUsed: number;
  billingCycle: string;
  nextRenewal: string;
  features: string[];
}

export async function fetchFacultyOverview(token?: string | null): Promise<{ success: boolean; data?: FacultyOverviewData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/overview`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch overview." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching faculty overview." };
  }
}

export async function fetchFacultyStudents(
  params: { search?: string; branch?: string; section?: string; year?: string; status?: string; sortBy?: string; sortOrder?: string; page?: number; limit?: number },
  token?: string | null
): Promise<{ success: boolean; data?: { students: StudentSummary[]; pagination: { total: number; page: number; limit: number; totalPages: number } }; message?: string }> {
  try {
    const query = new URLSearchParams();
    if (params.search) query.set("search", params.search);
    if (params.branch) query.set("branch", params.branch);
    if (params.section) query.set("section", params.section);
    if (params.year) query.set("year", params.year);
    if (params.status) query.set("status", params.status);
    if (params.sortBy) query.set("sortBy", params.sortBy);
    if (params.sortOrder) query.set("sortOrder", params.sortOrder);
    if (params.page) query.set("page", String(params.page));
    if (params.limit) query.set("limit", String(params.limit));

    const res = await fetch(`${API_BASE_URL}/api/faculty/students?${query.toString()}`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch students." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching students list." };
  }
}

export async function fetchFacultyStudentDetail(studentId: string, token?: string | null): Promise<{ success: boolean; data?: StudentDetailData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/students/${studentId}`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch student details." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching student performance detail." };
  }
}

export async function fetchFacultyErrorAnalytics(token?: string | null): Promise<{ success: boolean; data?: ErrorAnalyticsData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/error-analytics`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch error analytics." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching error analytics." };
  }
}

export async function fetchFacultyLanguageAnalytics(token?: string | null): Promise<{ success: boolean; data?: LanguageAnalyticsData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/language-analytics`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch language analytics." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching language analytics." };
  }
}

export async function fetchFacultyClasses(token?: string | null): Promise<{ success: boolean; data?: { institutionId: string; institutionName: string; department: string; classes: ClassSection[] }; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/classes`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch classes." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching classes." };
  }
}

export async function addClassSection(classData: { name: string; section: string; year: number }, token?: string | null): Promise<{ success: boolean; data?: ClassSection; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/classes`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(classData),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to create class section." };
    return json;
  } catch {
    return { success: false, message: "Network error creating class section." };
  }
}

export async function fetchFacultyAssignments(token?: string | null): Promise<{ success: boolean; data?: AssignmentItem[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/assignments`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch assignments." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching assignments." };
  }
}

export async function createFacultyAssignment(
  assignmentData: {
    title: string;
    description?: string;
    instructions?: string;
    deadline: string;
    classId: string;
    languageMode: "ANY" | "RESTRICTED";
    preferredLanguage?: string;
    allowedLanguages?: string[];
    testCases?: Array<{ id?: string; input: string; expectedOutput: string; isHidden?: boolean; explanation?: string }>;
    points?: number;
    difficulty?: "easy" | "medium" | "hard";
    maxAttempts?: number;
    startDate?: string;
  },
  token?: string | null
): Promise<{ success: boolean; data?: AssignmentItem; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/assignments`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(assignmentData),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to create assignment." };
    return json;
  } catch {
    return { success: false, message: "Network error creating assignment." };
  }
}

export async function updateFacultyAssignment(
  assignmentId: string,
  assignmentData: {
    title?: string;
    description?: string;
    instructions?: string;
    deadline?: string;
    classId?: string;
    languageMode?: "ANY" | "RESTRICTED";
    preferredLanguage?: string;
    allowedLanguages?: string[];
    testCases?: Array<{ id?: string; input: string; expectedOutput: string; isHidden?: boolean; explanation?: string }>;
    points?: number;
    difficulty?: "easy" | "medium" | "hard";
    maxAttempts?: number;
  },
  token?: string | null
): Promise<{ success: boolean; data?: AssignmentItem; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/assignments/${assignmentId}`, {
      method: "PUT",
      headers: getAuthHeaders(token),
      body: JSON.stringify(assignmentData),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to update assignment." };
    return json;
  } catch {
    return { success: false, message: "Network error updating assignment." };
  }
}

export async function submitStudentAssignment(
  assignmentId: string,
  submissionData: {
    language: string;
    sourceCode: string;
    status?: string;
    score?: number;
    executionTime?: string;
    compilerErrors?: string;
    aiExplanation?: string;
  },
  token?: string | null
): Promise<{ success: boolean; data?: SubmissionRecord; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/assignments/${assignmentId}/submit`, {
      method: "POST",
      headers: getAuthHeaders(token),
      body: JSON.stringify(submissionData),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Submission rejected." };
    return json;
  } catch {
    return { success: false, message: "Network error submitting assignment." };
  }
}

export async function fetchAssignmentAnalytics(
  assignmentId: string,
  token?: string | null
): Promise<{ success: boolean; data?: AssignmentAnalyticsData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/assignments/${assignmentId}/analytics`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch assignment analytics." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching assignment analytics." };
  }
}

export async function fetchStudentAssignments(
  token?: string | null
): Promise<{ success: boolean; data?: AssignmentItem[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/student-assignments`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch student assignments." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching student assignments." };
  }
}

export async function fetchFacultyReports(token?: string | null): Promise<{ success: boolean; data?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/reports`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch reports." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching reports." };
  }
}

export async function fetchFacultySubscription(token?: string | null): Promise<{ success: boolean; data?: FacultySubscriptionData; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/faculty/subscription`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) return { success: false, message: json?.message || "Failed to fetch subscription architecture info." };
    return json;
  } catch {
    return { success: false, message: "Network error fetching subscription info." };
  }
}

export interface StudentProfileData {
  id: string;
  name: string;
  email: string;
  avatar?: string | null;
  rollNo?: string;
  bio?: string;
  collegeName?: string;
  stream?: string;
  primaryLanguage?: string;
  graduationYear?: number;
  karmaPoints?: number;
  handles: {
    leetcode: string;
    codeforces: string;
    codechef: string;
    hackerrank: string;
    github: string;
  };
}

export interface StudentDashboardSummary {
  problemsSolved: number;
  problemsAttempted: number;
  contestsParticipated: number;
  accuracy: number;
  maxSolvedInADay: number;
  longestStreak: number;
  currentStreak: number;
  overallScore: number;
  lastSubmission: string;
}

export interface ProblemItem {
  id: string;
  title: string;
  difficulty: "Easy" | "Medium" | "Hard";
  category: string;
  source: string;
  status: "Accepted" | "Attempted";
  accuracy: string;
  timeComplexity: string;
  solvedAt: string;
  problemUrl?: string;
}

export interface ScoreComponent {
  id: string;
  label: string;
  points: number;
  max: number;
  badge: string;
  color: string;
}

export interface ScoreBreakdown {
  overallScore: number;
  tier: string;
  tierColor: string;
  nextTier: string;
  nextTierTarget: number;
  progressPercentage: number;
  components: ScoreComponent[];
}

export interface StudentDashboardData {
  profile: StudentProfileData;
  summary: StudentDashboardSummary;
  scoreBreakdown?: ScoreBreakdown;
  ratingGraph: Array<{ month: string; rating: number; solves?: number }>;
  problems?: ProblemItem[];
  solvedProblems?: string[];
  unsolvedProblems?: string[];
  contests?: string[];
  coursework: {
    totalAssignments: number;
    submittedAssignments: number;
    assignments: any[];
  };
  doubtsStats: {
    asked: number;
    answered: number;
    accepted: number;
    karma: number;
  };
  submissions: {
    verdicts: Array<{ label: string; count: number; color: string }>;
    languages: Array<{ language: string; submissions: number; percentage: number; color?: string }>;
    topics?: Array<{ tag: string; count: number; proficiency: string; color: string }>;
    tags?: Array<{ tag: string; count: number; color: string }>;
  };
  platforms: Record<string, { handle: string; connected: boolean; [key: string]: any }>;
  leaderboard?: LeaderboardStudent[];
}

export async function fetchStudentDashboard(
  token?: string | null
): Promise<{ success: boolean; data?: StudentDashboardData; message?: string } & Partial<StudentDashboardData>> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/dashboard`, {
      headers: getAuthHeaders(token),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to fetch student dashboard data." };
    }
    return { success: true, data: json, ...json };
  } catch {
    return { success: false, message: "Network error fetching student dashboard data." };
  }
}

export async function updateStudentProfile(
  payload: {
    name?: string;
    avatar?: string;
    bio?: string;
    title?: string;
    rollNo?: string;
    collegeName?: string;
    stream?: string;
    primaryLanguage?: string;
    graduationYear?: number;
    leetcodeHandle?: string;
    codechefHandle?: string;
    codeforcesHandle?: string;
    hackerrankHandle?: string;
    githubHandle?: string;
  },
  token?: string | null
): Promise<{ success: boolean; user?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/profile`, {
      method: "PUT",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(payload),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to update profile." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error updating student profile." };
  }
}

export async function syncExternalPlatforms(
  handles: {
    leetcodeHandle?: string;
    codechefHandle?: string;
    codeforcesHandle?: string;
    hackerrankHandle?: string;
    githubHandle?: string;
  },
  token?: string | null
): Promise<{ success: boolean; externalStats?: any; user?: any; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/sync-external`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify(handles),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to sync external platforms." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error syncing external platforms." };
  }
}

export interface LeaderboardStudent {
  rank: number;
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rollNo?: string;
  collegeName?: string;
  stream?: string;
  overallScore?: number;
  karmaPoints?: number;
  leetcodeHandle?: string;
  codechefHandle?: string;
  codeforcesHandle?: string;
  hackerrankHandle?: string;
  githubHandle?: string;
  createdAt?: string;
}

export async function fetchStudentLeaderboard(
  token?: string | null
): Promise<{ success: boolean; data: LeaderboardStudent[]; count?: number; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/leaderboard`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, data: [], message: json?.message || "Failed to fetch leaderboard." };
    }
    return { success: true, data: json.data || [], count: json.count || 0 };
  } catch {
    return { success: false, data: [], message: "Network error fetching student leaderboard." };
  }
}

export interface PublicStudentProfile {
  id: string;
  name: string;
  email: string;
  avatar?: string;
  rollNo?: string;
  bio?: string;
  collegeName?: string;
  stream?: string;
  primaryLanguage?: string;
  graduationYear?: number | null;
  karmaPoints: number;
  overallScore: number;
  rank?: number | null;
  tier?: string;
  tierColor?: string;
  connectionStatus?: "SELF" | "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED";
  handles: {
    leetcode?: string;
    codeforces?: string;
    codechef?: string;
    hackerrank?: string;
    github?: string;
  };
  platforms: {
    leetcode?: { connected: boolean; handle?: string; totalSolved?: number; easy?: number; medium?: number; hard?: number; ranking?: number; rating?: number };
    codeforces?: { connected: boolean; handle?: string; rating?: number; rank?: string; totalSolved?: number };
    codechef?: { connected: boolean; handle?: string; rating?: number; stars?: string; totalSolved?: number };
    hackerrank?: { connected: boolean; handle?: string; totalSolved?: number };
    github?: { connected: boolean; handle?: string; repos?: number; followers?: number };
  };
  summary: {
    problemsSolved: number;
    overallScore: number;
  };
  coursework?: {
    totalAssignments: number;
    submittedAssignments: number;
  };
}

export interface DirectMessageItem {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: { id: string; name: string; avatar?: string; email: string };
  receiver?: { id: string; name: string; avatar?: string; email: string };
}

export interface ConversationSummary {
  peerId: string;
  peer: {
    id: string;
    name: string;
    avatar?: string;
    email: string;
    stream?: string;
    collegeName?: string;
  };
  lastMessage: {
    content: string;
    createdAt: string;
    senderId: string;
  };
  unreadCount: number;
}

export interface NotificationItem {
  id: string;
  userId: string;
  actorId?: string;
  type: "CONNECTION_REQUEST" | "CONNECTION_ACCEPTED" | "MESSAGE" | "LEADERBOARD" | "SYSTEM" | string;
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: string;
}

export interface ConnectionData {
  connections: Array<{ connectionId: string; connectedAt: string; peer: any }>;
  pendingReceived: Array<{ requestId: string; receivedAt: string; peer: any }>;
  pendingSent: Array<{ requestId: string; sentAt: string; peer: any }>;
}

export async function searchStudents(
  query: string,
  token?: string | null
): Promise<{ success: boolean; data: LeaderboardStudent[]; count?: number; message?: string }> {
  try {
    if (!query.trim()) return { success: true, data: [], count: 0 };
    const res = await fetch(`${API_BASE_URL}/api/users/search?q=${encodeURIComponent(query)}`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, data: [], message: json?.message || "Failed to search students." };
    }
    return { success: true, data: json.data || [], count: json.count || 0 };
  } catch {
    return { success: false, data: [], message: "Network error searching students." };
  }
}

export async function fetchPublicStudentProfile(
  studentId: string,
  token?: string | null
): Promise<{ success: boolean; profile?: PublicStudentProfile; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/users/${studentId}/public-profile`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to fetch student profile." };
    }
    return { success: true, profile: json.profile };
  } catch {
    return { success: false, message: "Network error fetching student profile." };
  }
}

export async function fetchConnections(
  token?: string | null
): Promise<{ success: boolean; connections: any[]; pendingReceived: any[]; pendingSent: any[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/connections`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, connections: [], pendingReceived: [], pendingSent: [], message: json?.message };
    }
    return json;
  } catch {
    return { success: false, connections: [], pendingReceived: [], pendingSent: [], message: "Network error fetching connections." };
  }
}

export async function sendConnectionRequest(
  targetUserId: string,
  token?: string | null
): Promise<{ success: boolean; message?: string; connection?: any }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/connections/request`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ targetUserId }),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to send connection request." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error sending connection request." };
  }
}

export async function respondConnectionRequest(
  requestId: string,
  action: "accept" | "decline",
  token?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/connections/respond`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ requestId, action }),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to respond to request." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error responding to request." };
  }
}

export async function removeConnection(
  targetUserId: string,
  token?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/connections/${targetUserId}`, {
      method: "DELETE",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to remove connection." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error removing connection." };
  }
}

export async function getConnectionStatus(
  targetUserId: string,
  token?: string | null
): Promise<{ success: boolean; status: "SELF" | "NONE" | "PENDING_SENT" | "PENDING_RECEIVED" | "ACCEPTED" }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/connections/status/${targetUserId}`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    return { success: Boolean(json?.success), status: json?.status || "NONE" };
  } catch {
    return { success: false, status: "NONE" };
  }
}

export async function fetchConversations(
  token?: string | null
): Promise<{ success: boolean; data: ConversationSummary[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/messages/conversations`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, data: [], message: json?.message || "Failed to fetch conversations." };
    }
    return { success: true, data: json.data || [] };
  } catch {
    return { success: false, data: [], message: "Network error fetching conversations." };
  }
}

export async function fetchDirectMessages(
  peerId: string,
  token?: string | null
): Promise<{ success: boolean; data: DirectMessageItem[]; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/messages/${peerId}`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, data: [], message: json?.message || "Failed to fetch messages." };
    }
    return { success: true, data: json.data || [] };
  } catch {
    return { success: false, data: [], message: "Network error fetching messages." };
  }
}

export async function sendDirectMessage(
  receiverId: string,
  content: string,
  token?: string | null
): Promise<{ success: boolean; message?: string; data?: DirectMessageItem }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/messages`, {
      method: "POST",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      body: JSON.stringify({ receiverId, content }),
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, message: json?.message || "Failed to send message." };
    }
    return json;
  } catch {
    return { success: false, message: "Network error sending message." };
  }
}

export async function fetchNotifications(
  token?: string | null
): Promise<{ success: boolean; data: NotificationItem[]; unreadCount: number; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications`, {
      method: "GET",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      return { success: false, data: [], unreadCount: 0, message: json?.message || "Failed to fetch notifications." };
    }
    return { success: true, data: json.data || [], unreadCount: json.unreadCount || 0 };
  } catch {
    return { success: false, data: [], unreadCount: 0, message: "Network error fetching notifications." };
  }
}

export async function markNotificationRead(
  id: string,
  token?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${id}/read`, {
      method: "PATCH",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    return await res.json().catch(() => ({ success: false }));
  } catch {
    return { success: false, message: "Network error marking notification as read." };
  }
}

export async function markAllNotificationsRead(
  token?: string | null
): Promise<{ success: boolean; message?: string }> {
  try {
    const res = await fetch(`${API_BASE_URL}/api/notifications/read-all`, {
      method: "PATCH",
      headers: { ...getAuthHeaders(token), "Content-Type": "application/json" },
      credentials: "include",
    });
    return await res.json().catch(() => ({ success: false }));
  } catch {
    return { success: false, message: "Network error marking notifications as read." };
  }
}
