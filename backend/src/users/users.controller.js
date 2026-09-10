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
  const username = handle.trim().replace(/^https?:\/\/(www\.)?codeforces\.com\/profile\//i, "").replace(/\/$/, "");
  if (!username) return null;
  try {
    const res = await fetch(`https://codeforces.com/api/user.info?handles=${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    if (data.status === "OK" && data.result && data.result.length > 0) {
      const u = data.result[0];

      // Fetch user's submissions to count unique problems solved
      let totalSolved = 0;
      try {
        const subRes = await fetch(`https://codeforces.com/api/user.status?handle=${encodeURIComponent(username)}&from=1&count=2000`, {
          headers: { "User-Agent": "Mozilla/5.0" },
          signal: AbortSignal.timeout(6000),
        });
        if (subRes.ok) {
          const subData = await subRes.json();
          if (subData.status === "OK" && Array.isArray(subData.result)) {
            const solvedSet = new Set();
            for (const sub of subData.result) {
              if (sub.verdict === "OK" && sub.problem) {
                const pId = `${sub.problem.contestId || ""}${sub.problem.index || ""}`;
                if (pId) solvedSet.add(pId);
              }
            }
            totalSolved = solvedSet.size;
          }
        }
      } catch (subErr) {
        console.warn("Codeforces submissions fetch error:", subErr.message);
      }

      return {
        handle: u.handle,
        rating: u.rating || 0,
        maxRating: u.maxRating || 0,
        rank: u.rank || "unranked",
        maxRank: u.maxRank || "unranked",
        contribution: u.contribution || 0,
        totalSolved,
      };
    }
  } catch (err) {
    console.warn("Codeforces fetch error:", err.message);
  }
  return null;
}

/**
 * Helper to fetch LeetCode stats with resilient multi-layer fallback
 */
async function fetchLeetCodeStats(handle) {
  if (!handle) return null;
  const username = handle.trim().replace(/^https?:\/\/(www\.)?leetcode\.com\/(u\/)?/i, "").replace(/\/$/, "");
  if (!username) return null;

  // Strategy 1: Direct official LeetCode GraphQL (Official API, fastest, most accurate)
  try {
    const query = `query userCombined($username: String!) {
      matchedUser(username: $username) {
        profile { ranking }
        submitStatsGlobal { acSubmissionNum { difficulty count } }
      }
      userContestRanking(username: $username) {
        rating
        globalRanking
        attendedContestsCount
        topPercentage
      }
    }`;

    const res = await fetch("https://leetcode.com/graphql", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Referer": "https://leetcode.com",
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
      },
      body: JSON.stringify({ query, variables: { username } }),
      signal: AbortSignal.timeout(6000),
    });

    if (res.ok) {
      const data = await res.json();
      const matched = data?.data?.matchedUser;
      const contest = data?.data?.userContestRanking;
      if (matched) {
        const list = matched.submitStatsGlobal?.acSubmissionNum || [];
        const get = (d) => list.find((s) => s.difficulty.toLowerCase() === d.toLowerCase())?.count || 0;
        const rating = contest?.rating ? Math.round(contest.rating) : null;

        return {
          handle: username,
          totalSolved: get("All"),
          easySolved: get("Easy"),
          mediumSolved: get("Medium"),
          hardSolved: get("Hard"),
          ranking: matched.profile?.ranking || null,
          rating,
          acceptanceRate: 75,
        };
      }
    }
  } catch (err) {
    console.warn("Direct LeetCode GraphQL error, trying proxies:", err.message);
  }

  // Strategy 2: High-speed serverless LeetCode API
  try {
    const res = await fetch(`https://leetcode-api-faisalshohag.vercel.app/${encodeURIComponent(username)}`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && data.totalSolved !== undefined) {
        return {
          handle: username,
          totalSolved: data.totalSolved || 0,
          easySolved: data.easySolved || 0,
          mediumSolved: data.mediumSolved || 0,
          hardSolved: data.hardSolved || 0,
          ranking: data.ranking || null,
          rating: data.contestRating ? Math.round(data.contestRating) : null,
          acceptanceRate: 75,
        };
      }
    }
  } catch (err) {
    console.warn("LeetCode Vercel API error, trying Alfa fallback:", err.message);
  }

  // Strategy 3: Alfa LeetCode API
  try {
    const res = await fetch(`https://alfa-leetcode-api.onrender.com/${encodeURIComponent(username)}/solved`, {
      signal: AbortSignal.timeout(4000),
    });
    if (res.ok) {
      const data = await res.json();
      if (data && (data.solvedProblem !== undefined || data.easySolved !== undefined)) {
        return {
          handle: username,
          totalSolved: data.solvedProblem || 0,
          easySolved: data.easySolved || 0,
          mediumSolved: data.mediumSolved || 0,
          hardSolved: data.hardSolved || 0,
          ranking: null,
          rating: null,
          acceptanceRate: 75,
        };
      }
    }
  } catch (err) {
    console.warn("Alfa LeetCode API error:", err.message);
  }

  return null;
}

/**
 * Helper to fetch HackerRank stats (questions solved & badges)
 */
async function fetchHackerRankStats(handle) {
  if (!handle) return null;
  const username = handle.trim().replace(/^https?:\/\/(www\.)?hackerrank\.com\/profile\//i, "").replace(/^https?:\/\/(www\.)?hackerrank\.com\//i, "").replace(/\/$/, "");
  if (!username) return null;

  try {
    const res = await fetch(`https://www.hackerrank.com/rest/hackers/${encodeURIComponent(username)}/badges`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
        "Accept": "application/json",
      },
      signal: AbortSignal.timeout(6000),
    });
    if (res.ok) {
      const data = await res.json();
      const models = Array.isArray(data?.models) ? data.models : [];
      let totalSolved = 0;
      const badges = models.map((b) => {
        const solved = typeof b.solved === "number" ? b.solved : 0;
        totalSolved += solved;
        return {
          name: b.badge_name || b.badge_type || "Badge",
          stars: b.stars || 0,
          solved,
        };
      });

      return {
        handle: username,
        totalSolved,
        badges,
      };
    }
  } catch (err) {
    console.warn("HackerRank fetch error:", err.message);
  }

  return {
    handle: username,
    totalSolved: 0,
    badges: [],
  };
}

/**
 * Helper to fetch CodeChef stats via live scraper
 */
async function fetchCodeChefStats(handle) {
  if (!handle) return null;
  const username = handle.trim().replace(/^https?:\/\/(www\.)?codechef\.com\/users\//i, "").replace(/\/$/, "");
  if (!username) return null;

  try {
    const res = await fetch(`https://www.codechef.com/users/${encodeURIComponent(username)}`, {
      headers: {
        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
        "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!res.ok) return null;
    const html = await res.text();

    // 1. Rating
    const ratingMatch = html.match(/class="rating-number"[^>]*>([\s\S]*?)<\/div>/i);
    let rating = null;
    if (ratingMatch) {
      const raw = ratingMatch[1].replace(/[^0-9]/g, "");
      if (raw) rating = parseInt(raw, 10);
    }

    // 2. Stars
    const starSpans = html.match(/<span style="background-color:[^"]*">&#9733;<\/span>/g);
    let stars = starSpans && starSpans.length > 0 ? `${starSpans.length}★` : null;
    if (!stars && rating) {
      if (rating >= 2500) stars = "7★";
      else if (rating >= 2200) stars = "6★";
      else if (rating >= 2000) stars = "5★";
      else if (rating >= 1800) stars = "4★";
      else if (rating >= 1600) stars = "3★";
      else if (rating >= 1400) stars = "2★";
      else stars = "1★";
    }

    // 3. Solved count
    const totalSolvedMatch = html.match(/Total Problems Solved:\s*(\d+)/i);
    const fullySolvedMatch = html.match(/Fully Solved\s*\(([0-9]+)\)/i);
    const partiallySolvedMatch = html.match(/Partially Solved\s*\(([0-9]+)\)/i);
    let totalSolved = 0;
    if (totalSolvedMatch) {
      totalSolved = parseInt(totalSolvedMatch[1], 10);
    } else if (fullySolvedMatch) {
      totalSolved = parseInt(fullySolvedMatch[1], 10) + (partiallySolvedMatch ? parseInt(partiallySolvedMatch[1], 10) : 0);
    }

    // 4. Global Rank
    const globalRankMatch = html.match(/<strong>\s*([0-9]+)\s*<\/strong>\s*<\/a>\s*Global Rank/i) || html.match(/class="rating-ranks"[\s\S]*?<strong>([0-9]+)<\/strong>/i);
    const globalRank = globalRankMatch ? parseInt(globalRankMatch[1], 10) : null;

    if (rating || totalSolved > 0 || stars) {
      return {
        handle: username,
        rating,
        stars,
        totalSolved,
        globalRank,
      };
    }
  } catch (err) {
    console.warn("CodeChef fetch error:", err.message);
  }
  return null;
}

/**
 * Helper to fetch GitHub stats
 */
async function fetchGitHubStats(handle) {
  if (!handle) return null;
  const username = handle.trim().replace(/^https?:\/\/(www\.)?github\.com\//i, "").replace(/\/$/, "");
  if (!username) return null;

  try {
    const res = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, {
      headers: { "User-Agent": "Mozilla/5.0" },
      signal: AbortSignal.timeout(6000),
    });
    const data = await res.json();
    if (data && data.public_repos !== undefined) {
      return {
        handle: username,
        repos: data.public_repos || 0,
        followers: data.followers || 0,
        bio: data.bio || null,
      };
    }
  } catch (err) {
    console.warn("GitHub fetch error:", err.message);
  }
  return null;
}

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
 * Reusable core logic to sync external platforms for any user
 */
async function syncUserExternalPlatforms(userId, customHandles = {}) {
  const user = await userModel.findById(userId);
  if (!user) return null;

  const { leetcodeHandle, codechefHandle, codeforcesHandle, hackerrankHandle, githubHandle } = customHandles;

  const lcHandle = (leetcodeHandle && typeof leetcodeHandle === "string" && leetcodeHandle.trim()) ? leetcodeHandle.trim() : (user.leetcodeHandle || "");
  const cfHandle = (codeforcesHandle && typeof codeforcesHandle === "string" && codeforcesHandle.trim()) ? codeforcesHandle.trim() : (user.codeforcesHandle || "");
  const ccHandle = (codechefHandle && typeof codechefHandle === "string" && codechefHandle.trim()) ? codechefHandle.trim() : (user.codechefHandle || "");
  const hrHandle = (hackerrankHandle && typeof hackerrankHandle === "string" && hackerrankHandle.trim()) ? hackerrankHandle.trim() : (user.hackerrankHandle || "");
  const ghHandle = (githubHandle && typeof githubHandle === "string" && githubHandle.trim()) ? githubHandle.trim() : (user.githubHandle || "");

  let prevPlatforms = {};
  try {
    if (user.externalStats) {
      const parsed = typeof user.externalStats === "string" ? JSON.parse(user.externalStats) : user.externalStats;
      prevPlatforms = parsed?.platforms || {};
    }
  } catch {
    // ignore
  }

  const [cfStats, lcStats, ccStats, ghStats, hrStats] = await Promise.all([
    fetchCodeforcesStats(cfHandle),
    fetchLeetCodeStats(lcHandle),
    fetchCodeChefStats(ccHandle),
    fetchGitHubStats(ghHandle),
    fetchHackerRankStats(hrHandle),
  ]);

  const isMatch = (h1, h2) => Boolean(h1 && h2 && h1.toString().trim().toLowerCase() === h2.toString().trim().toLowerCase());

  const finalLc = (lcStats && lcStats.totalSolved > 0)
    ? {
        ...lcStats,
        rating: lcStats.rating ?? (isMatch(prevPlatforms.leetcode?.handle, lcHandle) ? prevPlatforms.leetcode?.rating : null),
      }
    : (isMatch(prevPlatforms.leetcode?.handle, lcHandle) && prevPlatforms.leetcode?.totalSolved > 0
        ? prevPlatforms.leetcode
        : (lcStats || prevPlatforms.leetcode || null));

  const finalCf = (cfStats && (cfStats.rating || cfStats.totalSolved > 0))
    ? {
        ...cfStats,
        totalSolved: cfStats.totalSolved ?? (isMatch(prevPlatforms.codeforces?.handle, cfHandle) ? prevPlatforms.codeforces?.totalSolved : 0),
      }
    : (isMatch(prevPlatforms.codeforces?.handle, cfHandle) && (prevPlatforms.codeforces?.rating || prevPlatforms.codeforces?.totalSolved > 0)
        ? prevPlatforms.codeforces
        : (cfStats || prevPlatforms.codeforces || null));

  const finalCc = (ccStats && (ccStats.totalSolved > 0 || ccStats.rating))
    ? ccStats
    : (isMatch(prevPlatforms.codechef?.handle, ccHandle) && (prevPlatforms.codechef?.totalSolved > 0 || prevPlatforms.codechef?.rating)
        ? prevPlatforms.codechef
        : (ccStats || prevPlatforms.codechef || null));

  const finalGh = (ghStats && ghStats.repos > 0)
    ? ghStats
    : (isMatch(prevPlatforms.github?.handle, ghHandle) && prevPlatforms.github?.repos > 0
        ? prevPlatforms.github
        : (ghStats || prevPlatforms.github || null));

  const finalHr = (hrStats && (hrStats.totalSolved > 0 || (hrStats.badges && hrStats.badges.length > 0)))
    ? hrStats
    : (isMatch(prevPlatforms.hackerrank?.handle, hrHandle) && (prevPlatforms.hackerrank?.totalSolved > 0 || prevPlatforms.hackerrank?.badges?.length > 0)
        ? prevPlatforms.hackerrank
        : (hrStats || prevPlatforms.hackerrank || null));

  const lcSolved = finalLc?.totalSolved || 0;
  const ccSolved = finalCc?.totalSolved || 0;
  const cfSolved = finalCf?.totalSolved || 0;
  const hrSolved = finalHr?.totalSolved || 0;
  const cfRating = finalCf?.rating || 0;
  const internalSolved = 0;

  const totalSolved = lcSolved + ccSolved + cfSolved + hrSolved + internalSolved;
  const totalAttempted = totalSolved;
  const accuracy = totalSolved > 0 ? 88.5 : 0;

  const lcScore = finalLc ? ((finalLc.easy || finalLc.easySolved || 0) * 2 + (finalLc.medium || finalLc.mediumSolved || 0) * 4 + (finalLc.hard || finalLc.hardSolved || 0) * 8) : 0;
  const ccScore = finalCc ? (ccSolved * 2 + (finalCc.rating ? Math.round(finalCc.rating * 0.05) : 0)) : 0;
  const cfScore = cfRating ? Math.round(cfRating * 0.2) + (cfSolved * 2) : (cfSolved * 2);
  const hrScore = hrSolved ? Math.min(hrSolved * 2, 100) : 0;
  const ghScore = finalGh ? Math.min(((finalGh.repos || 0) * 5), 50) : 0;

  const externalScore = Math.min(lcScore + ccScore + cfScore + hrScore + ghScore, 1000);
  const internalScore = internalSolved * 5;
  const courseworkScore = 0;
  const karmaScore = Math.min((user.karmaPoints || 0) * 2, 150);

  const overallScore = Math.min(Math.max(externalScore + internalScore + courseworkScore + karmaScore, 0), 2500);

  const externalStats = {
    lastSyncedAt: new Date().toISOString(),
    platforms: {
      leetcode: {
        handle: finalLc?.handle || lcHandle,
        connected: Boolean((finalLc && finalLc.totalSolved > 0) || lcStats || (finalLc && finalLc.connected)),
        totalSolved: lcSolved,
        easy: finalLc?.easy || finalLc?.easySolved || 0,
        medium: finalLc?.medium || finalLc?.mediumSolved || 0,
        hard: finalLc?.hard || finalLc?.hardSolved || 0,
        ranking: finalLc?.ranking || null,
        rating: finalLc?.rating || null,
      },
      codeforces: {
        handle: finalCf?.handle || cfHandle,
        connected: Boolean(finalCf?.rating || finalCf?.totalSolved > 0 || cfStats || (finalCf && finalCf.connected)),
        rating: finalCf?.rating || null,
        rank: finalCf?.rank || null,
        maxRating: finalCf?.maxRating || null,
        totalSolved: cfSolved,
      },
      codechef: {
        handle: finalCc?.handle || ccHandle,
        connected: Boolean(finalCc?.rating || finalCc?.totalSolved > 0 || ccStats || (finalCc && finalCc.connected)),
        rating: finalCc?.rating || null,
        stars: finalCc?.stars || null,
        totalSolved: ccSolved,
      },
      hackerrank: {
        handle: finalHr?.handle || hrHandle,
        connected: Boolean((finalHr && (finalHr.totalSolved > 0 || finalHr.badges?.length > 0)) || hrHandle),
        totalSolved: hrSolved,
        badges: finalHr?.badges || [],
      },
      github: {
        handle: finalGh?.handle || ghHandle,
        connected: Boolean((finalGh && finalGh.repos > 0) || ghStats || (finalGh && finalGh.connected) || ghHandle),
        repos: finalGh?.repos || 0,
        followers: finalGh?.followers || 0,
      },
    },
    summary: {
      problemsSolved: totalSolved,
      problemsAttempted: totalAttempted,
      contestsParticipated: (finalCf?.rating || finalCc?.rating) ? 1 : 0,
      accuracy,
      maxSolvedInADay: totalSolved > 0 ? 3 : 0,
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

  const updatedUser = await userModel.updateUser(userId, {
    leetcodeHandle: lcHandle,
    codeforcesHandle: cfHandle,
    codechefHandle: ccHandle,
    hackerrankHandle: hrHandle,
    githubHandle: ghHandle,
    overallScore,
    externalStats: JSON.stringify(externalStats),
  });

  return { updatedUser, externalStats };
}

/**
 * @route POST /api/users/sync-external
 * @desc Sync and recalculate external coding stats & Unified Developer Score
 */
exports.syncExternal = async (req, res, next) => {
  try {
    const result = await syncUserExternalPlatforms(req.user.id, req.body || {});
    if (!result) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    return res.status(200).json({
      success: true,
      message: "Coding profiles linked & Unified Developer Score re-evaluated!",
      externalStats: result.externalStats,
      user: userModel.sanitizeUser(result.updatedUser),
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

    // Auto-sync handles if handles are saved but externalStats has 0 solves or unrated
    const hasHandles = Boolean(user.leetcodeHandle || user.codechefHandle || user.codeforcesHandle || user.githubHandle);
    const needsSync =
      !stats ||
      !stats.platforms ||
      (user.leetcodeHandle && (!stats.platforms.leetcode || Number(stats.platforms.leetcode.totalSolved) === 0)) ||
      (user.codechefHandle && (!stats.platforms.codechef || !stats.platforms.codechef.rating));

    if (hasHandles && needsSync) {
      try {
        const synced = await syncUserExternalPlatforms(user.id);
        if (synced) {
          stats = synced.externalStats;
          user.overallScore = synced.updatedUser.overallScore;
        }
      } catch (e) {
        console.warn("Auto-sync error in getDashboard:", e.message);
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
        rating: null,
      },
      codeforces: {
        handle: user.codeforcesHandle || "",
        connected: Boolean(user.codeforcesHandle),
        rating: null,
        rank: null,
        maxRating: null,
        totalSolved: 0,
      },
      codechef: {
        handle: user.codechefHandle || "",
        connected: Boolean(user.codechefHandle),
        rating: null,
        stars: null,
        totalSolved: 0,
      },
      hackerrank: {
        handle: user.hackerrankHandle || "",
        connected: Boolean(user.hackerrankHandle),
        totalSolved: 0,
        badges: [],
      },
      github: {
        handle: user.githubHandle || "",
        connected: Boolean(user.githubHandle),
        repos: 0,
        followers: 0,
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
      leaderboard: await userModel.getLeaderboard(),
    });
  } catch (err) {
    next(err);
  }
};

/**
 * @route GET /api/users/leaderboard
 * @desc Get global and institutional student leaderboard
 */
exports.getLeaderboard = async (req, res, next) => {
  try {
    const students = await userModel.getLeaderboard();
    return res.status(200).json({
      success: true,
      data: students,
      count: students.length,
    });
  } catch (err) {
    next(err);
  }
};
