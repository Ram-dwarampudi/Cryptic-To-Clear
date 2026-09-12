const prisma = require("../config/db");
const logger = require("../utils/logger");

/**
 * List interview experiences with search, filters, and privacy masking
 */
exports.getInterviews = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const { search, company, difficulty, driveType, year, limit = 20, page = 1 } = req.query;

    const where = {};

    if (company) {
      where.companyName = { equals: company };
    }

    if (difficulty) {
      where.difficulty = { equals: difficulty };
    }

    if (driveType) {
      where.driveType = { equals: driveType };
    }

    if (year) {
      where.graduationYear = parseInt(year, 10);
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { companyName: { contains: q } },
        { roleTitle: { contains: q } },
        { summary: { contains: q } },
        { tips: { contains: q } },
        { roundsData: { contains: q } },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, items] = await Promise.all([
      prisma.interviewExperience.count({ where }),
      prisma.interviewExperience.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          student: {
            select: {
              id: true,
              name: true,
              role: true,
              batchYear: true,
              avatar: true,
              department: { select: { code: true, name: true } },
            },
          },
          university: {
            select: { name: true, code: true },
          },
        },
      }),
    ]);

    // Apply privacy masking for anonymous posts
    const sanitized = items.map((item) => {
      let studentInfo = item.student;
      if (item.isAnonymous) {
        studentInfo = {
          id: "anonymous",
          name: `Anonymous Senior (Batch '${String(item.graduationYear || 25).slice(-2)})`,
          role: "STUDENT",
          batchYear: item.graduationYear,
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AnonymousSenior",
          department: item.student?.department || { code: "ENG", name: "Engineering" },
        };
      }

      let parsedRounds = [];
      try {
        parsedRounds = JSON.parse(item.roundsData || "[]");
      } catch {
        parsedRounds = [];
      }

      return {
        ...item,
        rounds: parsedRounds,
        student: studentInfo,
      };
    });

    res.json({
      success: true,
      data: sanitized,
      pagination: {
        total,
        page: parseInt(page, 10),
        limit: take,
        totalPages: Math.ceil(total / take),
      },
    });
  } catch (error) {
    logger.error("Error fetching interviews:", error);
    res.status(500).json({ success: false, message: "Failed to fetch interview experiences." });
  }
};

/**
 * Get popular company stats and aggregate counts
 */
exports.getCompanyStats = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const all = await prisma.interviewExperience.findMany({
      select: {
        companyName: true,
        companyLogo: true,
        packageCTC: true,
      },
    });

    const companyMap = {};
    for (const item of all) {
      if (!companyMap[item.companyName]) {
        companyMap[item.companyName] = {
          companyName: item.companyName,
          companyLogo: item.companyLogo,
          count: 0,
          packages: [],
        };
      }
      companyMap[item.companyName].count += 1;
      if (item.packageCTC) {
        companyMap[item.companyName].packages.push(item.packageCTC);
      }
    }

    const companies = Object.values(companyMap).sort((a, b) => b.count - a.count);

    res.json({
      success: true,
      data: companies,
    });
  } catch (error) {
    logger.error("Error fetching company stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch company stats." });
  }
};

/**
 * Get single interview details
 */
exports.getInterviewById = async (req, res) => {
  try {
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    const { id } = req.params;
    const item = await prisma.interviewExperience.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            role: true,
            batchYear: true,
            avatar: true,
            department: { select: { code: true, name: true } },
          },
        },
        university: {
          select: { name: true, code: true },
        },
      },
    });

    if (!item) {
      return res.status(404).json({ success: false, message: "Interview experience not found." });
    }

    let studentInfo = item.student;
    if (item.isAnonymous) {
      studentInfo = {
        id: "anonymous",
        name: `Anonymous Senior (Batch '${String(item.graduationYear || 25).slice(-2)})`,
        role: "STUDENT",
        batchYear: item.graduationYear,
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AnonymousSenior",
        department: item.student?.department || { code: "ENG", name: "Engineering" },
      };
    }

    let parsedRounds = [];
    try {
      parsedRounds = JSON.parse(item.roundsData || "[]");
    } catch {
      parsedRounds = [];
    }

    res.json({
      success: true,
      data: {
        ...item,
        rounds: parsedRounds,
        student: studentInfo,
      },
    });
  } catch (error) {
    logger.error("Error fetching interview by ID:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve interview experience." });
  }
};

/**
 * Submit new interview experience
 */
exports.createInterview = async (req, res) => {
  try {
    const {
      companyName,
      companyLogo,
      roleTitle,
      jobType = "FULL_TIME",
      packageCTC,
      location,
      driveType = "ON_CAMPUS",
      difficulty = "MEDIUM",
      selectionStatus = "SELECTED",
      graduationYear,
      summary,
      rounds,
      tips,
      preparationResources,
      isAnonymous = false,
      studentId,
    } = req.body;

    if (!companyName || !roleTitle || !summary) {
      return res.status(400).json({
        success: false,
        message: "Company name, role title, and summary are required.",
      });
    }

    // Associate with logged-in student, requested ID, or active student in DB
    const candidateId = req.user?.id || studentId || "usr_demo_001";
    let student = await prisma.user.findUnique({
      where: { id: candidateId },
      select: { id: true, universityId: true, batchYear: true },
    });

    if (!student) {
      student = await prisma.user.findFirst({
        where: { role: "STUDENT" },
        select: { id: true, universityId: true, batchYear: true },
      });
      if (!student) {
        student = await prisma.user.findFirst({
          select: { id: true, universityId: true, batchYear: true },
        });
      }
    }

    if (!student) {
      return res.status(400).json({
        success: false,
        message: "Valid student account required to post interview experiences.",
      });
    }

    const created = await prisma.interviewExperience.create({
      data: {
        companyName,
        companyLogo:
          companyLogo ||
          `https://api.dicebear.com/7.x/identicon/svg?seed=${encodeURIComponent(companyName)}`,
        roleTitle,
        jobType,
        packageCTC,
        location,
        driveType,
        difficulty,
        selectionStatus,
        graduationYear: graduationYear || student.batchYear || 2025,
        summary,
        roundsData: typeof rounds === "string" ? rounds : JSON.stringify(rounds || []),
        tips,
        preparationResources,
        isAnonymous: Boolean(isAnonymous),
        studentId: student.id,
        universityId: student.universityId,
      },
    });

    // Award karma points to the contributor
    await prisma.user.update({
      where: { id: student.id },
      data: { karmaPoints: { increment: 25 } },
    });

    res.status(201).json({
      success: true,
      message: "Interview experience posted successfully! +25 Karma awarded.",
      data: created,
    });
  } catch (error) {
    logger.error("Error creating interview experience:", error);
    res.status(500).json({ success: false, message: "Failed to post interview experience." });
  }
};

/**
 * Upvote an experience
 */
exports.upvoteInterview = async (req, res) => {
  try {
    const { id } = req.params;
    const updated = await prisma.interviewExperience.update({
      where: { id },
      data: { upvotes: { increment: 1 } },
    });
    res.json({ success: true, upvotes: updated.upvotes });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upvote." });
  }
};
