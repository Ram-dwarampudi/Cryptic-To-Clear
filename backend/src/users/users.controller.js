const userModel = require("../models/user.model");
const facultyModel = require("../models/faculty.model");
let prisma = null;
try {
  prisma = require("../config/db");
} catch {
  console.warn("Prisma not loaded in users.controller");
}



/**
 * @route GET /api/users/profile
 * @desc Get user profile
 */
exports.getProfile = async (req, res) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }
    return res.status(200).json({
      success: true,
      user: userModel.sanitizeUser(user),
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * @route PUT /api/users/profile
 * @desc Update user profile details and external coding handles
 */
exports.updateProfile = async (req, res, next) => {
  try {
    const {
      name,
      avatar,
      bio,
      rollNo,
      collegeName,
      stream,
      primaryLanguage,
      graduationYear,
      leetcodeHandle,
      codechefHandle,
      codeforcesHandle,
      hackerrankHandle,
      githubHandle,
    } = req.body;

    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const updateData = {};
    if (name !== undefined) updateData.name = name.trim();
    if (avatar !== undefined) updateData.avatar = avatar;
    if (bio !== undefined) updateData.bio = bio;
    if (rollNo !== undefined) updateData.rollNo = rollNo;
    if (collegeName !== undefined) updateData.collegeName = collegeName;
    if (stream !== undefined) updateData.stream = stream;
    if (primaryLanguage !== undefined) updateData.primaryLanguage = primaryLanguage;
    if (graduationYear !== undefined) updateData.graduationYear = parseInt(graduationYear, 10) || null;
    if (leetcodeHandle !== undefined) updateData.leetcodeHandle = leetcodeHandle.trim();
    if (codechefHandle !== undefined) updateData.codechefHandle = codechefHandle.trim();
    if (codeforcesHandle !== undefined) updateData.codeforcesHandle = codeforcesHandle.trim();
    if (hackerrankHandle !== undefined) updateData.hackerrankHandle = hackerrankHandle.trim();
    if (githubHandle !== undefined) updateData.githubHandle = githubHandle.trim();

    const updatedUser = await userModel.updateUser(req.user.id, updateData);

    return res.status(200).json({
      success: true,
      message: "Profile updated successfully.",
      user: userModel.sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * Helper to fetch Codeforces stats
 */
async function fetchCodeforcesStats(handle) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(handle)}`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (data.status === "OK" && data.result && data.result.length > 0) {
      const u = data.result[0];
      return {
        handle: u.handle,
        rating: u.rating || 1200,
        maxRating: u.maxRating || 1200,
        rank: u.rank || "newbie",
        maxRank: u.maxRank || "newbie",
        contribution: u.contribution || 0,
      };
    }
  } catch {
    // Network or rate-limit fallback
  }
  return null;
}

/**
 * Helper to fetch LeetCode stats
 */
async function fetchLeetCodeStats(handle) {
  if (!handle) return null;
  try {
    const res = await fetch(`https://leetcode-stats-api.herokuapp.com/${encodeURIComponent(handle)}`, {
      signal: AbortSignal.timeout(4000),
    });
    const data = await res.json();
    if (data.status === "success") {
      return {
        totalSolved: data.totalSolved || 0,
        easySolved: data.easySolved || 0,
        mediumSolved: data.mediumSolved || 0,
        hardSolved: data.hardSolved || 0,
        acceptanceRate: data.acceptanceRate || 65,
        ranking: data.ranking || null,
      };
    }
  } catch {
    // Fallback
  }
  return null;
}

/**
 * @route POST /api/users/sync-external
 * @desc Sync and recalculate external coding stats (LeetCode, Codeforces, CodeChef) & Unified Rating
 */
/**
 * Determine rating tier name from score
 */
function getTierInfo(score) {
  if (score >= 1200) return { tier: "Grandmaster", nextTier: "Legendary", nextTarget: 1600, color: "#ef4444" };
  if (score >= 950) return { tier: "Master", nextTier: "Grandmaster", nextTarget: 1200, color: "#a855f7" };
  if (score >= 800) return { tier: "Expert", nextTier: "Master", nextTarget: 950, color: "#38bdf8" };
  if (score >= 650) return { tier: "Specialist", nextTier: "Expert", nextTarget: 800, color: "#22c55e" };
  if (score >= 500) return { tier: "Apprentice", nextTier: "Specialist", nextTarget: 650, color: "#eab308" };
  return { tier: "Novice", nextTier: "Apprentice", nextTarget: 500, color: "#94a3b8" };
}

/**
 * @route POST /api/users/sync-external
 * @desc Sync and recalculate external coding stats & Unified Developer Score
 */
exports.syncExternal = async (req, res, next) => {
  try {
    const { leetcodeHandle, codechefHandle, codeforcesHandle, hackerrankHandle, githubHandle } = req.body;
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const lcHandle = leetcodeHandle !== undefined ? leetcodeHandle.trim() : (user.leetcodeHandle || "");
    const cfHandle = codeforcesHandle !== undefined ? codeforcesHandle.trim() : (user.codeforcesHandle || "");
    const ccHandle = codechefHandle !== undefined ? codechefHandle.trim() : (user.codechefHandle || "");
    const hrHandle = hackerrankHandle !== undefined ? hackerrankHandle.trim() : (user.hackerrankHandle || "");
    const ghHandle = githubHandle !== undefined ? githubHandle.trim() : (user.githubHandle || "");

    const [cfStats, lcStats] = await Promise.all([
      fetchCodeforcesStats(cfHandle),
      fetchLeetCodeStats(lcHandle),
    ]);

    const lcSolved = lcStats?.totalSolved || 0;
    const ccSolved = 0;
    const cfRating = cfStats?.rating || 0;
    const internalSolved = 0;

    const totalSolved = lcSolved + ccSolved + internalSolved;
    const totalAttempted = lcStats ? Math.round(lcSolved / ((lcStats.acceptanceRate || 100) / 100)) : totalSolved;
    const accuracy = totalAttempted > 0 ? Number(((totalSolved / totalAttempted) * 100).toFixed(1)) : 0;

    // Dynamic Unified Developer Score Formula:
    const externalScore = Math.round((lcSolved * 1.5) + (cfRating ? cfRating * 0.15 : 0));
    const internalScore = internalSolved * 4.5;
    const courseworkScore = 0;
    const karmaScore = Math.min((user.karmaPoints || 0) * 2, 150);

    const overallScore = Math.min(Math.max(externalScore + internalScore + courseworkScore + karmaScore, 0), 2500);

    const externalStats = {
      lastSyncedAt: new Date().toISOString(),
      platforms: {
        leetcode: {
          handle: lcHandle,
          connected: Boolean(lcHandle),
          totalSolved: lcSolved,
          easy: lcStats?.easySolved || 0,
          medium: lcStats?.mediumSolved || 0,
          hard: lcStats?.hardSolved || 0,
          ranking: lcStats?.ranking || null,
        },
        codeforces: {
          handle: cfHandle,
          connected: Boolean(cfHandle),
          rating: cfStats?.rating || null,
          rank: cfStats?.rank || null,
          maxRating: cfStats?.maxRating || null,
        },
        codechef: {
          handle: ccHandle,
          connected: Boolean(ccHandle),
          rating: null,
          stars: null,
        },
        hackerrank: {
          handle: hrHandle,
          connected: Boolean(hrHandle),
          badges: [],
        },
        github: {
          handle: ghHandle,
          connected: Boolean(ghHandle),
          repos: 0,
        },
      },
      summary: {
        problemsSolved: totalSolved,
        problemsAttempted: totalAttempted,
        contestsParticipated: 0,
        accuracy,
        maxSolvedInADay: 0,
        longestStreak: 0,
        currentStreak: 0,
        overallScore,
        lastSubmission: totalSolved > 0 ? "Recently" : "None",
      },
      scoreBreakdown: {
        externalScore,
        internalScore,
        courseworkScore,
        karmaScore,
        overallScore,
      },
    };

    const updatedUser = await userModel.updateUser(req.user.id, {
      leetcodeHandle: lcHandle,
      codeforcesHandle: cfHandle,
      codechefHandle: ccHandle,
      hackerrankHandle: hrHandle,
      githubHandle: ghHandle,
      overallScore,
      externalStats: JSON.stringify(externalStats),
    });

    return res.status(200).json({
      success: true,
      message: "Coding profiles linked & Unified Developer Score re-evaluated!",
      externalStats,
      user: userModel.sanitizeUser(updatedUser),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/users/dashboard
 * @desc Full Developer Command Center & Student Profile Dashboard
 */
exports.getDashboard = async (req, res, next) => {
  try {
    const user = await userModel.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    // 1. Coursework & Lab Assignments
    let assignments = [];
    try {
      assignments = facultyModel.getStudentAssignments(req.user.id) || [];
    } catch {
      assignments = [];
    }

    // 2. Doubts & Karma
    let doubtsAskedCount = 0;
    let doubtsAnsweredCount = 0;
    let acceptedAnswersCount = 0;
    if (prisma) {
      try {
        const [dAsked, dAns, dAcc] = await Promise.all([
          prisma.doubt.count({ where: { authorId: req.user.id } }),
          prisma.doubtAnswer.count({ where: { authorId: req.user.id } }),
          prisma.doubtAnswer.count({ where: { authorId: req.user.id, isAccepted: true } }),
        ]);
        doubtsAskedCount = dAsked || 0;
        doubtsAnsweredCount = dAns || 0;
        acceptedAnswersCount = dAcc || 0;
      } catch {
        // Fallback
      }
    }

    // 3. Parse or calculate externalStats
    let stats = user.externalStats;
    if (typeof stats === "string") {
      try {
        stats = JSON.parse(stats);
      } catch {
        stats = null;
      }
    }

    const overallScore = user.overallScore || stats?.summary?.overallScore || 0;
    const tierInfo = getTierInfo(overallScore);

    const summary = stats?.summary || {
      problemsSolved: 0,
      problemsAttempted: 0,
      contestsParticipated: 0,
      accuracy: 0,
      maxSolvedInADay: 0,
      longestStreak: 0,
      currentStreak: 0,
      overallScore: 0,
      lastSubmission: "No submissions yet",
    };

    // 4. Detailed transparent score composition
    const scoreBreakdown = {
      overallScore,
      tier: tierInfo.tier,
      tierColor: tierInfo.color,
      nextTier: tierInfo.nextTier,
      nextTierTarget: tierInfo.nextTarget,
      progressPercentage: tierInfo.nextTarget > 0 ? Math.min(Math.round((overallScore / tierInfo.nextTarget) * 100), 99) : 0,
      components: [
        {
          id: "external",
          label: "External Solves (LeetCode + CodeChef + Codeforces)",
          points: stats?.scoreBreakdown?.externalScore || 0,
          max: 800,
          badge: "Weighted Difficulty",
          color: "#f59e0b",
        },
        {
          id: "internal",
          label: "Cryptic to Clear In-Platform Solves & Compiler Runs",
          points: stats?.scoreBreakdown?.internalScore || 0,
          max: 500,
          badge: "Verified Code",
          color: "#D4AF37",
        },
        {
          id: "coursework",
          label: "Academic Labs & Coursework Submissions",
          points: stats?.scoreBreakdown?.courseworkScore || 0,
          max: 200,
          badge: "Faculty Graded",
          color: "#38bdf8",
        },
        {
          id: "karma",
          label: "Community Doubt Resolution & Peer Karma",
          points: Math.min((user.karmaPoints || 0) * 2, 150),
          max: 150,
          badge: "Helpful Answers",
          color: "#a855f7",
        },
      ],
    };

    // 5. Rating progression timeline
    const ratingGraph = overallScore > 0 ? [{ month: "Current", rating: overallScore, solves: summary.problemsSolved }] : [];

    // 6. Submissions Breakdown (Verdict, Language, Topic)
    const submissions = {
      verdicts: summary.problemsSolved > 0 ? [
        { label: "ACCEPTED", count: summary.problemsSolved, color: "#22c55e" },
      ] : [],
      languages: [],
      topics: [],
    };

    const platforms = stats?.platforms || {
      leetcode: {
        handle: user.leetcodeHandle || "",
        connected: Boolean(user.leetcodeHandle),
        totalSolved: 0,
        easy: 0,
        medium: 0,
        hard: 0,
        ranking: null,
      },
      codeforces: {
        handle: user.codeforcesHandle || "",
        connected: Boolean(user.codeforcesHandle),
        rating: null,
        rank: null,
        maxRating: null,
      },
      codechef: {
        handle: user.codechefHandle || "",
        connected: Boolean(user.codechefHandle),
        rating: null,
        stars: null,
      },
      hackerrank: {
        handle: user.hackerrankHandle || "",
        connected: Boolean(user.hackerrankHandle),
        badges: [],
      },
      github: {
        handle: user.githubHandle || "",
        connected: Boolean(user.githubHandle),
        repos: 0,
      },
    };

    return res.status(200).json({
      success: true,
      profile: {
        id: user.id,
        name: user.name,
        email: user.email,
        avatar: user.avatar,
        rollNo: user.rollNo || "",
        bio: user.bio || "",
        collegeName: user.collegeName || "",
        stream: user.stream || "",
        primaryLanguage: user.primaryLanguage || "",
        graduationYear: user.graduationYear || null,
        karmaPoints: user.karmaPoints || 0,
        handles: {
          leetcode: user.leetcodeHandle || "",
          codeforces: user.codeforcesHandle || "",
          codechef: user.codechefHandle || "",
          hackerrank: user.hackerrankHandle || "",
          github: user.githubHandle || "",
        },
      },
      summary,
      scoreBreakdown,
      ratingGraph,
      problems: [],
      coursework: {
        totalAssignments: assignments.length,
        submittedAssignments: assignments.filter((a) => a.submitted).length,
        assignments,
      },
      doubtsStats: {
        asked: doubtsAskedCount,
        answered: doubtsAnsweredCount,
        accepted: acceptedAnswersCount,
        karma: user.karmaPoints || 0,
      },
      submissions,
      platforms,
    });
  } catch (err) {
    next(err);
  }
};
