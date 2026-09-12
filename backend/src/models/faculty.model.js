const fs = require("fs");
const path = require("path");
const userModel = require("./user.model");
const { ACADEMIC_BRANCHES, ACADEMIC_SECTIONS, BRANCH_NAMES } = require("../constants/academic");

const DATA_FILE_PATH = path.join(__dirname, "../data/faculty_store.json");

/**
 * Institutional Faculty Repository connecting registered students,
 * 25 Branch-Section classes, and academic performance.
 */

class FacultyModel {
  constructor() {
    this.institution = {
      id: "inst_01",
      name: "Institutional Portal",
      code: "CAMPUS",
      logo: "",
      subscription: {
        plan: "Standard",
        status: "active",
        facultySeatsMax: 0,
        facultySeatsUsed: 0,
        studentSeatsMax: 0,
        studentSeatsUsed: 0,
        aiCreditsQuota: 0,
        aiCreditsUsed: 0,
        billingCycle: "Annual",
        nextRenewal: "",
      },
    };

    this.departments = [];
    this.classes = [];
    this.students = [];
    this.assignments = [];
    this.submissions = [];
    this.recentActivity = [];

    this._loadStore();
    this._migrateAssignments();
  }

  _seedDefaultAssignments() {
    this.assignments = [
      {
        id: "asg_find_largest",
        facultyId: "usr_faculty_demo",
        classId: "cls_cse_a",
        className: "CSE - Section A (3rd Year)",
        title: "Find the largest of all elements in the given array",
        description: "Given an array of integers, find and return the largest element present in the array. Read the number of elements N followed by N space-separated integers, and output the single maximum value.",
        instructions: "Read N followed by N integers from standard input. Constraints: 1 <= N <= 10^5, -10^9 <= arr[i] <= 10^9.",
        assignmentType: "coding",
        languageMode: "ANY",
        allowedLanguages: [],
        points: 100,
        difficulty: "easy",
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxAttempts: 5,
        totalAssigned: 35,
        submissionsCount: 0,
        avgScore: 0,
        createdAt: new Date().toISOString(),
        testCases: [
          {
            id: "tc_fl_1",
            input: "5\n1 8 7 56 90",
            expectedOutput: "90",
            isHidden: false,
            explanation: "90 is the largest integer in [1, 8, 7, 56, 90]",
          },
          {
            id: "tc_fl_2",
            input: "4\n-10 -20 -5 -1",
            expectedOutput: "-1",
            isHidden: false,
            explanation: "All negative numbers, maximum is -1",
          },
          {
            id: "tc_fl_3",
            input: "1\n42",
            expectedOutput: "42",
            isHidden: false,
            explanation: "Single element array with value 42",
          },
          {
            id: "tc_fl_4",
            input: "6\n100 200 150 500 400 300",
            expectedOutput: "500",
            isHidden: true,
            explanation: "Hidden evaluation test case 1",
          },
          {
            id: "tc_fl_5",
            input: "7\n0 0 0 0 0 0 1",
            expectedOutput: "1",
            isHidden: true,
            explanation: "Hidden evaluation test case 2",
          },
        ],
      },
      {
        id: "asg_palindrome_checker",
        facultyId: "usr_faculty_demo",
        classId: "cls_cse_a",
        className: "All Engineering Sections",
        title: "Palindrome String Checker",
        description: "Check if the given string reads the same forwards and backwards. Output 'true' if the string is a palindrome, otherwise output 'false'.",
        instructions: "Read a single word from standard input without whitespace. Constraints: 1 <= length(S) <= 10^4.",
        assignmentType: "coding",
        languageMode: "ANY",
        allowedLanguages: [],
        points: 100,
        difficulty: "easy",
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxAttempts: 5,
        totalAssigned: 35,
        submissionsCount: 0,
        avgScore: 0,
        createdAt: new Date().toISOString(),
        testCases: [
          {
            id: "tc_pal_1",
            input: "racecar",
            expectedOutput: "true",
            isHidden: false,
            explanation: "racecar reversed is racecar",
          },
          {
            id: "tc_pal_2",
            input: "hello",
            expectedOutput: "false",
            isHidden: false,
            explanation: "hello reversed is olleh, not equal",
          },
          {
            id: "tc_pal_3",
            input: "madam",
            expectedOutput: "true",
            isHidden: true,
            explanation: "Hidden evaluation test case",
          },
        ],
      },
      {
        id: "asg_two_sum",
        facultyId: "usr_faculty_demo",
        classId: "cls_cse_a",
        className: "All Engineering Sections",
        title: "Target Sum Pair Finder",
        description: "Given an array of integers and a target sum, determine if there exists two distinct elements whose sum equals target. Output 'YES' if such a pair exists, otherwise 'NO'.",
        instructions: "Line 1: N and Target. Line 2: N space-separated integers. Constraints: 2 <= N <= 10^5.",
        assignmentType: "coding",
        languageMode: "ANY",
        allowedLanguages: [],
        points: 100,
        difficulty: "medium",
        startDate: new Date().toISOString(),
        deadline: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString(),
        maxAttempts: 5,
        totalAssigned: 35,
        submissionsCount: 0,
        avgScore: 0,
        createdAt: new Date().toISOString(),
        testCases: [
          {
            id: "tc_ts_1",
            input: "4 9\n2 7 11 15",
            expectedOutput: "YES",
            isHidden: false,
            explanation: "2 + 7 = 9",
          },
          {
            id: "tc_ts_2",
            input: "3 6\n3 2 4",
            expectedOutput: "YES",
            isHidden: false,
            explanation: "2 + 4 = 6",
          },
          {
            id: "tc_ts_3",
            input: "2 10\n1 2",
            expectedOutput: "NO",
            isHidden: false,
            explanation: "1 + 2 = 3 != 10",
          },
          {
            id: "tc_ts_4",
            input: "5 100\n10 20 30 40 50",
            expectedOutput: "NO",
            isHidden: true,
            explanation: "Hidden evaluation test case",
          },
        ],
      },
    ];
  }

  _loadStore() {
    try {
      if (fs.existsSync(DATA_FILE_PATH)) {
        const raw = fs.readFileSync(DATA_FILE_PATH, "utf-8");
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed.assignments) && parsed.assignments.length > 0) {
          this.assignments = parsed.assignments;
        }
        if (Array.isArray(parsed.classes) && parsed.classes.length > 0) {
          this.classes = parsed.classes;
        }
        if (Array.isArray(parsed.submissions)) {
          this.submissions = parsed.submissions;
        }
      }
    } catch (err) {
      console.warn("[FacultyModel] Could not load faculty store from disk:", err.message);
    }

    if (!Array.isArray(this.assignments) || this.assignments.length === 0) {
      this._seedDefaultAssignments();
      this._saveStore();
    }
  }

  _saveStore() {
    try {
      const dir = path.dirname(DATA_FILE_PATH);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }
      fs.writeFileSync(
        DATA_FILE_PATH,
        JSON.stringify(
          {
            assignments: this.assignments,
            classes: this.classes,
            submissions: this.submissions,
          },
          null,
          2
        ),
        "utf-8"
      );
    } catch (err) {
      console.warn("[FacultyModel] Could not persist faculty store to disk:", err.message);
    }
  }

  /**
   * Helper to retrieve all enrolled student accounts dynamically from UserModel
   */
  async _getAllEnrolledStudents() {
    const dbStudents = await userModel.getAllStudents();
    return dbStudents.map((u, idx) => {
      let branch = u.branch;
      let section = u.section;

      // Safe fallback / migration inference for existing students without branch/section
      if (!branch || !ACADEMIC_BRANCHES.includes(branch)) {
        if (u.rollNo) {
          const roll = u.rollNo.toUpperCase();
          if (roll.includes("57") || roll.includes("CSBS")) branch = "CSBS";
          else if (roll.includes("05") || roll.includes("CSE")) branch = "CSE";
          else if (roll.includes("12") || roll.includes("IT")) branch = "IT";
          else if (roll.includes("54") || roll.includes("AIDS") || roll.includes("AI-DS")) branch = "AIDS";
          else if (roll.includes("42") || roll.includes("AIML") || roll.includes("AI-ML")) branch = "AIML";
        }
        if (!branch && u.stream) {
          const s = u.stream.toUpperCase();
          if (s.includes("BUSINESS") || s.includes("CSBS")) branch = "CSBS";
          else if (s.includes("INFORMATION") || s.includes("IT")) branch = "IT";
          else if (s.includes("DATA SCIENCE") || s.includes("AIDS")) branch = "AIDS";
          else if (s.includes("MACHINE LEARNING") || s.includes("AIML")) branch = "AIML";
          else branch = "CSE";
        }
        if (!branch) branch = "CSE";
      }

      if (!section || !ACADEMIC_SECTIONS.includes(section)) {
        section = "A";
      }

      const rollNumber = u.rollNo || `24${branch}${String(idx + 1).padStart(3, "0")}`;
      const codingScore = u.overallScore > 0 ? Math.min(100, Math.round(u.overallScore / 10)) : 78;
      const status = codingScore >= 70 ? "Active" : codingScore >= 50 ? "At Risk" : "Inactive";

      return {
        id: u.id,
        userId: u.id,
        name: u.name || "Student",
        rollNumber,
        email: u.email,
        branch,
        section,
        year: u.batchYear ? Math.max(1, Math.min(4, new Date().getFullYear() - u.batchYear + 1)) : 3,
        institutionId: u.institutionId || "inst_01",
        programsExecuted: u.overallScore ? Math.max(1, Math.floor(u.overallScore / 15)) : 22,
        successfulExecutions: u.overallScore ? Math.max(1, Math.floor(u.overallScore / 18)) : 19,
        compilerErrors: 3,
        aiExplanations: 0,
        codingScore,
        lastActive: u.lastLogin || u.updatedAt || new Date().toISOString(),
        status,
        avatar: u.avatar,
        frequentMistakes: ["Syntax Error", "Logic Error"],
        languageStats: { c: 6, cpp: 12, java: 4, python: 2 },
      };
    });
  }

  // Institutional overview data
  async getOverview() {
    const students = await this._getAllEnrolledStudents();
    const totalStudents = students.length;
    const activeStudents = students.filter((s) => s.status === "Active").length;
    const atRiskStudents = students.filter((s) => s.status === "At Risk").length;
    const programsExecuted = students.reduce((acc, s) => acc + (s.programsExecuted || 0), 0) + this.submissions.length;
    const compilationErrors = students.reduce((acc, s) => acc + (s.compilerErrors || 0), 0);
    const aiExplanationsUsed = 0;
    const averageCodingScore =
      students.length > 0
        ? Number((students.reduce((a, b) => a + (b.codingScore || 0), 0) / students.length).toFixed(1))
        : 0;

    return {
      totalStudents,
      activeStudents,
      atRiskStudents,
      programsExecuted,
      compilationErrors,
      aiExplanationsUsed,
      averageCodingScore,
      insights: [],
      recentActivity: this.recentActivity,
      institution: this.institution,
    };
  }

  // Student directory with search, filter, sort, pagination
  async getStudents({ search = "", branch = "", section = "", year = "", status = "", sortBy = "codingScore", sortOrder = "desc", page = 1, limit = 10 }) {
    let result = await this._getAllEnrolledStudents();

    if (search) {
      const q = search.toLowerCase().trim();
      result = result.filter(
        (s) =>
          (s.name && s.name.toLowerCase().includes(q)) ||
          (s.rollNumber && s.rollNumber.toLowerCase().includes(q)) ||
          (s.email && s.email.toLowerCase().includes(q))
      );
    }

    if (branch) result = result.filter((s) => s.branch === branch);
    if (section) result = result.filter((s) => s.section === section);
    if (year) result = result.filter((s) => s.year === Number(year));
    if (status) result = result.filter((s) => s.status === status);

    result.sort((a, b) => {
      let valA = a[sortBy];
      let valB = b[sortBy];
      if (typeof valA === "string") {
        valA = valA.toLowerCase();
        valB = valB.toLowerCase();
      }
      if (valA < valB) return sortOrder === "asc" ? -1 : 1;
      if (valA > valB) return sortOrder === "asc" ? 1 : -1;
      return 0;
    });

    const total = result.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginated = result.slice(startIndex, startIndex + limit);

    return {
      students: paginated,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    };
  }

  // Student detailed performance
  async getStudentDetail(studentId) {
    const students = await this._getAllEnrolledStudents();
    const student = students.find((s) => s.id === studentId || s.userId === studentId);
    if (!student) return null;

    return {
      ...student,
      institutionName: this.institution.name,
      department: BRANCH_NAMES[student.branch] || "Computer Science & Engineering",
      progressTimeline: [
        { week: "Week 1", score: 65, executions: 20, errors: 8 },
        { week: "Week 2", score: 72, executions: 35, errors: 10 },
        { week: "Week 3", score: 80, executions: 42, errors: 6 },
        { week: "Week 4", score: 88, executions: 55, errors: 5 },
        { week: "Week 5", score: student.codingScore, executions: student.programsAttempted || 25, errors: student.compilerErrors },
      ],
      errorCategories: [
        { category: "Syntax Errors", count: Math.round(student.compilerErrors * 0.35) },
        { category: "Compilation Errors", count: Math.round(student.compilerErrors * 0.30) },
        { category: "Type Errors", count: Math.round(student.compilerErrors * 0.15) },
        { category: "Runtime Errors", count: Math.round(student.compilerErrors * 0.12) },
        { category: "Logic Errors", count: Math.round(student.compilerErrors * 0.08) },
      ],
      attemptedPrograms: [
        { id: "p1", title: "Binary Search Tree Implementation", language: "cpp", status: "Success", attempts: 3, timeSpent: "25m", score: 95 },
        { id: "p2", title: "Dynamic Memory Allocation in C", language: "c", status: "Success", attempts: 5, timeSpent: "40m", score: 88 },
        { id: "p3", title: "Bank Account Inheritance System", language: "java", status: "Success", attempts: 2, timeSpent: "18m", score: 92 },
        { id: "p4", title: "Matrix Multiplication", language: "python", status: "Success", attempts: 1, timeSpent: "12m", score: 100 },
      ],
    };
  }

  // Error Analytics
  getErrorAnalytics() {
    return {
      totalErrors: 342,
      byCategory: [
        { category: "Syntax Errors", count: 118, percentage: 34.5, description: "Missing semicolons, unmatched brackets, keyword typos" },
        { category: "Compilation Errors", count: 96, percentage: 28.1, description: "Undeclared variables, header missing, type mismatch" },
        { category: "Type Errors", count: 48, percentage: 14.0, description: "Incompatible assignment, implicit pointer cast" },
        { category: "Runtime Errors", count: 52, percentage: 15.2, description: "Segmentation fault, divide by zero, array out of bounds" },
        { category: "Logic Errors", count: 28, percentage: 8.2, description: "Infinite loops, incorrect formula execution" },
      ],
      languageWise: [
        { language: "C", syntax: 42, compilation: 38, type: 15, runtime: 32, logic: 10, total: 137 },
        { language: "C++", syntax: 36, compilation: 30, type: 18, runtime: 12, logic: 8, total: 104 },
        { language: "Java", syntax: 25, compilation: 18, type: 12, runtime: 5, logic: 6, total: 66 },
        { language: "Python", syntax: 15, compilation: 10, type: 3, runtime: 3, logic: 4, total: 35 },
      ],
      mostCommonErrors: [
        { error: "Segmentation fault (core dumped)", count: 32, affectedStudents: 23, primaryLanguage: "C" },
        { error: "expected ';' before 'return'", count: 28, affectedStudents: 20, primaryLanguage: "C/C++" },
        { error: "cannot find symbol / undefined variable", count: 24, affectedStudents: 18, primaryLanguage: "Java" },
        { error: "IndentationError: unexpected indent", count: 15, affectedStudents: 12, primaryLanguage: "Python" },
        { error: "subscripted value is neither array nor pointer", count: 14, affectedStudents: 11, primaryLanguage: "C" },
      ],
      weeklyTrend: [
        { day: "Mon", syntax: 20, compilation: 15, runtime: 8 },
        { day: "Tue", syntax: 24, compilation: 18, runtime: 10 },
        { day: "Wed", syntax: 18, compilation: 22, runtime: 14 },
        { day: "Thu", syntax: 22, compilation: 19, runtime: 12 },
        { day: "Fri", syntax: 19, compilation: 12, runtime: 5 },
        { day: "Sat", syntax: 8, compilation: 6, runtime: 2 },
        { day: "Sun", syntax: 7, compilation: 4, runtime: 1 },
      ],
    };
  }

  // Language Usage Analytics
  getLanguageAnalytics() {
    return {
      mostUsedLanguage: "C++",
      languages: [
        { language: "C", code: "c", executions: 620, successRate: 77.9, errorRate: 22.1, color: "#a8b9cc" },
        { language: "C++", code: "cpp", executions: 680, successRate: 84.7, errorRate: 15.3, color: "#6cb6ff" },
        { language: "Java", code: "java", executions: 360, successRate: 81.6, errorRate: 18.4, color: "#ff9d6c" },
        { language: "Python", code: "python", executions: 185, successRate: 81.0, errorRate: 19.0, color: "#9ee6a8" },
      ],
    };
  }

  // Classes / Sections: 5 branches x 5 sections = 25 classes
  async getClasses() {
    const students = await this._getAllEnrolledStudents();

    const classes = [];
    for (const b of ACADEMIC_BRANCHES) {
      for (const s of ACADEMIC_SECTIONS) {
        const matchingStudents = students.filter(
          (std) => std.branch === b && std.section === s
        );

        classes.push({
          id: `cls_${b.toLowerCase()}_${s.toLowerCase()}`,
          institutionId: this.institution.id,
          facultyId: "usr_faculty_demo",
          name: `${b} (${BRANCH_NAMES[b] || b})`,
          branch: b,
          section: `Section ${s}`,
          sectionCode: s,
          classCode: `${b}-${s}`,
          year: 3,
          studentCount: matchingStudents.length,
        });
      }
    }

    // Append any custom added classes if any
    for (const customCls of this.classes) {
      if (!classes.some((c) => c.id === customCls.id)) {
        classes.push(customCls);
      }
    }

    return {
      institutionId: this.institution.id,
      institutionName: this.institution.name,
      department: "School of Computing & Engineering",
      classes,
    };
  }

  addClass(newClassData) {
    const id = `cls_${Date.now().toString(36)}`;
    const newClass = {
      id,
      institutionId: this.institution.id,
      facultyId: "usr_faculty_demo",
      name: newClassData.name,
      section: newClassData.section,
      year: Number(newClassData.year) || 3,
      studentCount: 0,
    };
    this.classes.push(newClass);
    this._saveStore();
    return newClass;
  }

  // Migration helper for backward compatibility
  _migrateAssignments() {
    if (!Array.isArray(this.assignments)) return;
    this.assignments.forEach((asg) => {
      if (!asg.languageMode) {
        if (asg.language && asg.language !== "any" && asg.language !== "all") {
          asg.languageMode = "RESTRICTED";
          asg.allowedLanguages = [asg.language.toLowerCase()];
        } else {
          asg.languageMode = "ANY";
          asg.allowedLanguages = [];
        }
      }
      if (!asg.allowedLanguages) asg.allowedLanguages = [];
      if (!asg.testCases || !Array.isArray(asg.testCases)) asg.testCases = [];
      if (!asg.points) asg.points = 100;
      if (!asg.assignmentType) asg.assignmentType = "coding";
      if (!asg.difficulty) asg.difficulty = "medium";
    });
  }

  // Assignments
  getAssignments() {
    this._migrateAssignments();
    return this.assignments;
  }

  getAssignmentById(id) {
    this._migrateAssignments();
    return this.assignments.find((a) => a.id === id) || null;
  }

  _findClassById(classId) {
    if (!classId) return null;
    const custom = this.classes.find((c) => c.id === classId);
    if (custom) return custom;

    for (const b of ACADEMIC_BRANCHES) {
      for (const s of ACADEMIC_SECTIONS) {
        const id = `cls_${b.toLowerCase()}_${s.toLowerCase()}`;
        if (id === classId) {
          return {
            id,
            name: `${b} (${BRANCH_NAMES[b] || b})`,
            branch: b,
            section: `Section ${s}`,
            sectionCode: s,
            studentCount: 35,
          };
        }
      }
    }
    return null;
  }

  addAssignment(data) {
    this._migrateAssignments();
    const id = `asg_${Date.now().toString(36)}`;
    const targetClass = this._findClassById(data.classId) || this.classes[0];

    const languageMode = data.languageMode === "RESTRICTED" ? "RESTRICTED" : "ANY";
    const allowedLanguages = languageMode === "RESTRICTED" && Array.isArray(data.allowedLanguages)
      ? data.allowedLanguages.map((l) => l.toLowerCase().trim())
      : [];

    const testCases = Array.isArray(data.testCases)
      ? data.testCases.map((tc, idx) => ({
          id: tc.id || `tc_${id}_${idx + 1}`,
          input: tc.input || "",
          expectedOutput: tc.expectedOutput || "",
          isHidden: !!tc.isHidden,
          explanation: tc.explanation || (tc.isHidden ? "Hidden Test Case" : "Revealed Test Case"),
        }))
      : [];

    const newAsg = {
      id,
      facultyId: "usr_faculty_demo",
      classId: data.classId || (targetClass ? targetClass.id : "cls_cs3a"),
      className: targetClass ? `${targetClass.name} (${targetClass.section})` : "General Section",
      title: data.title,
      description: data.description || "",
      instructions: data.instructions || "",
      assignmentType: data.assignmentType || "coding",
      languageMode,
      allowedLanguages,
      testCases,
      points: Number(data.points) || 100,
      difficulty: data.difficulty || "medium",
      startDate: data.startDate || new Date().toISOString(),
      deadline: data.deadline,
      maxAttempts: Number(data.maxAttempts) || 5,
      totalAssigned: targetClass ? targetClass.studentCount : 35,
      submissionsCount: 0,
      avgScore: 0,
      createdAt: new Date().toISOString(),
    };

    this.assignments.unshift(newAsg);
    this._saveStore();
    return newAsg;
  }

  updateAssignment(id, data) {
    this._migrateAssignments();
    const asg = this.assignments.find((a) => a.id === id);
    if (!asg) return null;

    if (data.title) asg.title = data.title;
    if (data.description !== undefined) asg.description = data.description;
    if (data.instructions !== undefined) asg.instructions = data.instructions;
    if (data.points !== undefined) asg.points = Number(data.points);
    if (data.difficulty) asg.difficulty = data.difficulty;
    if (data.deadline) asg.deadline = data.deadline;
    if (data.maxAttempts !== undefined) asg.maxAttempts = Number(data.maxAttempts);

    if (data.languageMode !== undefined) {
      asg.languageMode = data.languageMode === "RESTRICTED" ? "RESTRICTED" : "ANY";
    }
    if (data.allowedLanguages !== undefined && Array.isArray(data.allowedLanguages)) {
      asg.allowedLanguages = data.allowedLanguages.map((l) => l.toLowerCase().trim());
    }

    if (Array.isArray(data.testCases)) {
      asg.testCases = data.testCases.map((tc, idx) => ({
        id: tc.id || `tc_${id}_${idx + 1}`,
        input: tc.input || "",
        expectedOutput: tc.expectedOutput || "",
        isHidden: !!tc.isHidden,
        explanation: tc.explanation || (tc.isHidden ? "Hidden Test Case" : "Revealed Test Case"),
      }));
    }

    if (data.classId && data.classId !== asg.classId) {
      asg.classId = data.classId;
      const targetClass = this._findClassById(data.classId);
      if (targetClass) {
        asg.className = `${targetClass.name} (${targetClass.section})`;
        asg.totalAssigned = targetClass.studentCount;
      }
    }

    this._saveStore();
    return asg;
  }

  submitAssignment({ assignmentId, studentId, studentName, rollNumber, language, sourceCode, status = "Success", score = 100, executionTime = "15ms", compilerErrors = "", aiExplanation = "" }) {
    this._migrateAssignments();
    const asg = this.assignments.find((a) => a.id === assignmentId);
    if (!asg) {
      const err = new Error("Assignment not found.");
      err.statusCode = 404;
      throw err;
    }

    const selectedLangNorm = (language || "").toLowerCase().trim();
    if (!selectedLangNorm) {
      const err = new Error("Please select a programming language for your submission.");
      err.statusCode = 400;
      throw err;
    }

    // Backend Validation Requirement 6 & 7:
    if (asg.languageMode === "RESTRICTED") {
      const permittedNorm = (asg.allowedLanguages || []).map((l) => l.toLowerCase().trim());
      if (!permittedNorm.includes(selectedLangNorm)) {
        const readablePermitted = permittedNorm.map((l) => (l === "cpp" ? "C++" : l.toUpperCase())).join(", ");
        const err = new Error(
          `${language} is not allowed for this assignment. Please select one of the permitted languages: ${readablePermitted || "None"}.`
        );
        err.statusCode = 400;
        throw err;
      }
    }

    const subId = `sub_${Date.now().toString(36)}`;
    const newSubmission = {
      id: subId,
      assignmentId,
      studentId: studentId || "std_001",
      studentName: studentName || "Alex Rivera",
      rollNumber: rollNumber || "21CS001",
      language: selectedLangNorm,
      sourceCode: sourceCode || "",
      status: status || "Success",
      score: Number(score) || 100,
      submittedAt: new Date().toISOString(),
      executionTime: executionTime || "15ms",
      compilerErrors: compilerErrors || "",
      aiExplanation: aiExplanation || "",
    };

    if (!Array.isArray(this.submissions)) this.submissions = [];
    this.submissions.unshift(newSubmission);

    // Update assignment submission metrics
    const asgSubmissions = this.submissions.filter((s) => s.assignmentId === assignmentId);
    asg.submissionsCount = asgSubmissions.length;
    const totalScore = asgSubmissions.reduce((sum, s) => sum + s.score, 0);
    asg.avgScore = Math.round((totalScore / (asgSubmissions.length || 1)) * 10) / 10;

    this._saveStore();
    return newSubmission;
  }

  getAssignmentAnalytics(assignmentId) {
    this._migrateAssignments();
    const asg = this.assignments.find((a) => a.id === assignmentId);
    if (!asg) return null;

    const subs = (this.submissions || []).filter((s) => s.assignmentId === assignmentId);
    const totalSubmissions = subs.length;

    // Language Usage Counts
    const languageCounts = { c: 0, cpp: 0, java: 0, python: 0 };
    let successCount = 0;

    subs.forEach((s) => {
      const l = s.language.toLowerCase();
      if (languageCounts[l] !== undefined) languageCounts[l]++;
      else languageCounts[l] = 1;
      if (s.status === "Success") successCount++;
    });

    let mostUsedLanguage = "N/A";
    let maxCount = -1;
    Object.entries(languageCounts).forEach(([lang, count]) => {
      if (count > maxCount && count > 0) {
        maxCount = count;
        mostUsedLanguage = lang === "cpp" ? "C++" : lang.toUpperCase();
      }
    });

    return {
      assignment: asg,
      totalSubmissions,
      successRate: totalSubmissions > 0 ? Math.round((successCount / totalSubmissions) * 100) : 0,
      avgScore: asg.avgScore,
      mostUsedLanguage,
      languageUsage: languageCounts,
      submissions: subs,
    };
  }

  getStudentAssignments(studentId) {
    this._migrateAssignments();
    return this.assignments.map((asg) => {
      const mySubmissions = (this.submissions || []).filter(
        (s) => s.assignmentId === asg.id && (s.studentId === studentId || studentId === "all")
      );
      const latestSub = mySubmissions[0] || null;
      return {
        ...asg,
        submitted: !!latestSub,
        latestSubmission: latestSub,
      };
    });
  }

  // Subscription Details
  getSubscriptionDetails() {
    return {
      institution: this.institution.name,
      ...this.institution.subscription,
      features: [
        "Unlimited Student Accounts",
        "AI Explanation Engine (Unlimited Queries)",
        "Real-Time Compiler & Visual Debugger",
        "Role-Based Faculty Dashboard & Analytics",
        "Custom Class & Optional-Language Assignments",
        "CSV & PDF Performance Export",
      ],
    };
  }
}

module.exports = new FacultyModel();
