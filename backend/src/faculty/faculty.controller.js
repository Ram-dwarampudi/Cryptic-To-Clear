const facultyModel = require("../models/faculty.model");

/**
 * Get high-level overview metrics & AI insights for faculty dashboard
 */
exports.getOverview = async (req, res, next) => {
  try {
    const data = await facultyModel.getOverview();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get paginated list of students with search, filter, sort
 */
exports.getStudents = async (req, res, next) => {
  try {
    const {
      search,
      branch,
      section,
      year,
      status,
      sortBy,
      sortOrder,
      page,
      limit,
    } = req.query;

    const data = await facultyModel.getStudents({
      search: search || "",
      branch: branch || "",
      section: section || "",
      year: year || "",
      status: status || "",
      sortBy: sortBy || "codingScore",
      sortOrder: sortOrder || "desc",
      page: Number(page) || 1,
      limit: Number(limit) || 10,
    });

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get detailed individual performance for a single student
 */
exports.getStudentDetail = async (req, res, next) => {
  try {
    const { studentId } = req.params;
    const data = await facultyModel.getStudentDetail(studentId);

    if (!data) {
      return res.status(404).json({
        success: false,
        message: "Student record not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get common error analytics & distribution
 */
exports.getErrorAnalytics = async (req, res, next) => {
  try {
    const data = facultyModel.getErrorAnalytics();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get programming language analytics
 */
exports.getLanguageAnalytics = async (req, res, next) => {
  try {
    const data = facultyModel.getLanguageAnalytics();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get classes and sections
 */
exports.getClasses = async (req, res, next) => {
  try {
    const data = await facultyModel.getClasses();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Add a new class section
 */
exports.addClass = async (req, res, next) => {
  try {
    const { name, section, year } = req.body;
    if (!name || !section) {
      return res.status(400).json({
        success: false,
        message: "Please provide class name and section.",
      });
    }

    const newClass = facultyModel.addClass({ name, section, year });
    return res.status(201).json({
      success: true,
      message: "Class section created successfully.",
      data: newClass,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assignments list
 */
exports.getAssignments = async (req, res, next) => {
  try {
    const data = facultyModel.getAssignments();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Create a new assignment (Language Selection is Optional)
 */
exports.createAssignment = async (req, res, next) => {
  try {
    const {
      title,
      description,
      instructions,
      deadline,
      classId,
      languageMode,
      allowedLanguages,
      points,
      difficulty,
      maxAttempts,
      startDate,
    } = req.body;

    if (!title || !deadline) {
      return res.status(400).json({
        success: false,
        message: "Assignment title and deadline are required.",
      });
    }

    if (languageMode === "RESTRICTED" && (!Array.isArray(allowedLanguages) || allowedLanguages.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one programming language must be selected when restricting allowed languages.",
      });
    }

    const assignment = facultyModel.addAssignment({
      title,
      description: description || "",
      instructions: instructions || "",
      deadline,
      classId,
      languageMode: languageMode === "RESTRICTED" ? "RESTRICTED" : "ANY",
      allowedLanguages: allowedLanguages || [],
      points,
      difficulty,
      maxAttempts,
      startDate,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment created successfully.",
      data: assignment,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Update an existing assignment
 */
exports.updateAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const {
      title,
      description,
      instructions,
      deadline,
      classId,
      languageMode,
      allowedLanguages,
      points,
      difficulty,
      maxAttempts,
    } = req.body;

    if (languageMode === "RESTRICTED" && (!Array.isArray(allowedLanguages) || allowedLanguages.length === 0)) {
      return res.status(400).json({
        success: false,
        message: "At least one programming language must be selected when restricting allowed languages.",
      });
    }

    const updated = facultyModel.updateAssignment(assignmentId, {
      title,
      description,
      instructions,
      deadline,
      classId,
      languageMode,
      allowedLanguages,
      points,
      difficulty,
      maxAttempts,
    });

    if (!updated) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Assignment updated successfully.",
      data: updated,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Submit code for an assignment with strict backend language validation
 */
exports.submitAssignment = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const { language, sourceCode, status, score, executionTime, compilerErrors, aiExplanation } = req.body;

    const studentId = req.user ? req.user.id : "usr_std_001";
    const studentName = req.user ? req.user.name : "Alex Rivera";
    const rollNumber = req.user && req.user.rollNumber ? req.user.rollNumber : "21CS001";

    const submission = facultyModel.submitAssignment({
      assignmentId,
      studentId,
      studentName,
      rollNumber,
      language,
      sourceCode,
      status,
      score,
      executionTime,
      compilerErrors,
      aiExplanation,
    });

    return res.status(201).json({
      success: true,
      message: "Assignment submission accepted successfully!",
      data: submission,
    });
  } catch (error) {
    if (error.statusCode) {
      return res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
    }
    next(error);
  }
};

/**
 * Get detailed analytics for a specific assignment
 */
exports.getAssignmentAnalytics = async (req, res, next) => {
  try {
    const { assignmentId } = req.params;
    const analytics = facultyModel.getAssignmentAnalytics(assignmentId);

    if (!analytics) {
      return res.status(404).json({
        success: false,
        message: "Assignment not found.",
      });
    }

    return res.status(200).json({
      success: true,
      data: analytics,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get assignments for student workspace
 */
exports.getStudentAssignments = async (req, res, next) => {
  try {
    const studentId = req.user ? req.user.id : "std_001";
    const data = facultyModel.getStudentAssignments(studentId);
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get downloadable reports data
 */
exports.getReports = async (req, res, next) => {
  try {
    const overview = await facultyModel.getOverview();
    const studentsRes = await facultyModel.getStudents({ limit: 1000 });
    const errors = facultyModel.getErrorAnalytics();
    const languages = facultyModel.getLanguageAnalytics();

    return res.status(200).json({
      success: true,
      data: {
        generatedAt: new Date().toISOString(),
        institution: overview.institution.name,
        summary: {
          totalStudents: overview.totalStudents,
          activeStudents: overview.activeStudents,
          atRiskStudents: overview.atRiskStudents,
          programsExecuted: overview.programsExecuted,
          compilationErrors: overview.compilationErrors,
          averageCodingScore: overview.averageCodingScore,
        },
        students: studentsRes.students,
        errors: errors.byCategory,
        languages: languages.languages,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Get institution subscription architecture status & seat limits
 */
exports.getSubscription = async (req, res, next) => {
  try {
    const data = facultyModel.getSubscriptionDetails();
    return res.status(200).json({
      success: true,
      data,
    });
  } catch (error) {
    next(error);
  }
};
