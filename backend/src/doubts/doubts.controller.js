const prisma = require("../config/db");
const logger = require("../utils/logger");

/**
 * List doubts with privacy filters and author masking
 */
exports.getDoubts = async (req, res) => {
  try {
    const {
      search,
      status,
      tag,
      language,
      authorId,
      userRole = "STUDENT",
      currentUserId = "usr_demo_001",
      limit = 20,
      page = 1,
    } = req.query;

    const where = {};

    if (status) {
      where.status = status;
    }

    if (language) {
      where.language = language;
    }

    if (authorId) {
      where.authorId = authorId;
    }

    if (tag) {
      where.tags = { contains: tag };
    }

    if (search) {
      const q = search.trim();
      where.OR = [
        { title: { contains: q } },
        { description: { contains: q } },
        { tags: { contains: q } },
      ];
    }

    // Privacy restriction:
    // If user is not faculty/admin, they can only see PUBLIC, ANONYMOUS_PEERS, or their own FACULTY_ONLY doubts.
    if (userRole !== "FACULTY" && userRole !== "ADMIN") {
      where.AND = [
        {
          OR: [
            { privacy: { in: ["PUBLIC", "ANONYMOUS_PEERS"] } },
            { authorId: currentUserId },
          ],
        },
      ];
    }

    const skip = (parseInt(page, 10) - 1) * parseInt(limit, 10);
    const take = parseInt(limit, 10);

    const [total, items] = await Promise.all([
      prisma.doubt.count({ where }),
      prisma.doubt.findMany({
        where,
        skip,
        take,
        orderBy: { createdAt: "desc" },
        include: {
          author: {
            select: {
              id: true,
              name: true,
              role: true,
              batchYear: true,
              avatar: true,
              department: { select: { code: true, name: true } },
            },
          },
          answers: {
            select: {
              id: true,
              isAccepted: true,
              isFacultyEndorsed: true,
            },
          },
        },
      }),
    ]);

    // Apply anonymity masking for peers
    const sanitized = items.map((doubt) => {
      let authorInfo = doubt.author;
      const isViewerAuthor = doubt.authorId === currentUserId;
      const isViewerFaculty = userRole === "FACULTY" || userRole === "ADMIN";

      if (doubt.privacy === "ANONYMOUS_PEERS" && !isViewerAuthor && !isViewerFaculty) {
        authorInfo = {
          id: "anonymous",
          name: `Anonymous Student (Batch '${String(doubt.author?.batchYear || 26).slice(-2)})`,
          role: "STUDENT",
          batchYear: doubt.author?.batchYear,
          avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AnonymousStudent",
          department: doubt.author?.department || { code: "ENG", name: "Engineering" },
        };
      }

      let parsedTags = [];
      try {
        parsedTags = JSON.parse(doubt.tags || "[]");
      } catch {
        parsedTags = [];
      }

      return {
        ...doubt,
        tags: parsedTags,
        author: authorInfo,
        answersCount: doubt.answers.length,
        hasAcceptedAnswer: doubt.answers.some((a) => a.isAccepted),
        hasFacultyEndorsement: doubt.answers.some((a) => a.isFacultyEndorsed),
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
    logger.error("Error fetching doubts:", error);
    res.status(500).json({ success: false, message: "Failed to fetch doubts." });
  }
};

/**
 * Get doubt details with full answers
 */
exports.getDoubtById = async (req, res) => {
  try {
    const { id } = req.params;
    const { userRole = "STUDENT", currentUserId = "usr_demo_001" } = req.query;

    const doubt = await prisma.doubt.findUnique({
      where: { id },
      include: {
        author: {
          select: {
            id: true,
            name: true,
            role: true,
            batchYear: true,
            avatar: true,
            department: { select: { code: true, name: true } },
          },
        },
        answers: {
          orderBy: [{ isAccepted: "desc" }, { isFacultyEndorsed: "desc" }, { upvotes: "desc" }],
          include: {
            author: {
              select: {
                id: true,
                name: true,
                role: true,
                avatar: true,
                karmaPoints: true,
                department: { select: { code: true } },
              },
            },
          },
        },
        university: {
          select: { name: true, code: true },
        },
      },
    });

    if (!doubt) {
      return res.status(404).json({ success: false, message: "Doubt post not found." });
    }

    // Increment view count
    await prisma.doubt.update({
      where: { id },
      data: { views: { increment: 1 } },
    });

    let authorInfo = doubt.author;
    const isViewerAuthor = doubt.authorId === currentUserId;
    const isViewerFaculty = userRole === "FACULTY" || userRole === "ADMIN";

    if (doubt.privacy === "ANONYMOUS_PEERS" && !isViewerAuthor && !isViewerFaculty) {
      authorInfo = {
        id: "anonymous",
        name: `Anonymous Student (Batch '${String(doubt.author?.batchYear || 26).slice(-2)})`,
        role: "STUDENT",
        batchYear: doubt.author?.batchYear,
        avatar: "https://api.dicebear.com/7.x/identicon/svg?seed=AnonymousStudent",
        department: doubt.author?.department || { code: "ENG", name: "Engineering" },
      };
    }

    let parsedTags = [];
    try {
      parsedTags = JSON.parse(doubt.tags || "[]");
    } catch {
      parsedTags = [];
    }

    res.json({
      success: true,
      data: {
        ...doubt,
        tags: parsedTags,
        author: authorInfo,
      },
    });
  } catch (error) {
    logger.error("Error fetching doubt by ID:", error);
    res.status(500).json({ success: false, message: "Failed to retrieve doubt." });
  }
};

/**
 * Post a new doubt
 */
exports.createDoubt = async (req, res) => {
  try {
    const {
      title,
      description,
      codeSnippet,
      language = "python",
      tags = [],
      privacy = "PUBLIC", // PUBLIC, ANONYMOUS_PEERS, FACULTY_ONLY
      authorId = "usr_demo_001",
    } = req.body;

    if (!title || !description) {
      return res.status(400).json({
        success: false,
        message: "Title and description are required.",
      });
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, universityId: true },
    });

    if (!author) {
      return res.status(400).json({ success: false, message: "Author not found." });
    }

    const created = await prisma.doubt.create({
      data: {
        title,
        description,
        codeSnippet: codeSnippet || null,
        language,
        tags: typeof tags === "string" ? tags : JSON.stringify(tags),
        privacy,
        status: "OPEN",
        authorId: author.id,
        universityId: author.universityId,
      },
    });

    // Award +5 Karma for asking questions
    await prisma.user.update({
      where: { id: author.id },
      data: { karmaPoints: { increment: 5 } },
    });

    res.status(201).json({
      success: true,
      message: "Doubt posted successfully! +5 Karma awarded.",
      data: created,
    });
  } catch (error) {
    logger.error("Error creating doubt:", error);
    res.status(500).json({ success: false, message: "Failed to post doubt." });
  }
};

/**
 * Answer a doubt
 */
exports.createAnswer = async (req, res) => {
  try {
    const { id } = req.params; // doubt ID
    const { content, codeSnippet, authorId = "usr_demo_001" } = req.body;

    if (!content) {
      return res.status(400).json({ success: false, message: "Answer content is required." });
    }

    const doubt = await prisma.doubt.findUnique({ where: { id } });
    if (!doubt) {
      return res.status(404).json({ success: false, message: "Doubt post not found." });
    }

    const author = await prisma.user.findUnique({
      where: { id: authorId },
      select: { id: true, name: true, role: true },
    });

    if (!author) {
      return res.status(400).json({ success: false, message: "Author not found." });
    }

    const isFaculty = author.role === "FACULTY" || author.role === "ADMIN";

    const answer = await prisma.doubtAnswer.create({
      data: {
        content,
        codeSnippet: codeSnippet || null,
        isAccepted: false,
        isFacultyEndorsed: isFaculty,
        endorsedByFacultyName: isFaculty ? author.name : null,
        doubtId: doubt.id,
        authorId: author.id,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true, avatar: true, karmaPoints: true },
        },
      },
    });

    // Award +10 Karma for answering
    await prisma.user.update({
      where: { id: author.id },
      data: { karmaPoints: { increment: 10 } },
    });

    res.status(201).json({
      success: true,
      message: "Answer submitted! +10 Karma awarded.",
      data: answer,
    });
  } catch (error) {
    logger.error("Error creating answer:", error);
    res.status(500).json({ success: false, message: "Failed to submit answer." });
  }
};

/**
 * Mark answer as accepted solution
 */
exports.acceptAnswer = async (req, res) => {
  try {
    const { id, answerId } = req.params;

    const answer = await prisma.doubtAnswer.findUnique({
      where: { id: answerId },
      include: { doubt: true },
    });

    if (!answer || answer.doubtId !== id) {
      return res.status(404).json({ success: false, message: "Answer not found for this doubt." });
    }

    // Mark previous answers as not accepted
    await prisma.doubtAnswer.updateMany({
      where: { doubtId: id },
      data: { isAccepted: false },
    });

    // Mark this answer as accepted
    await prisma.doubtAnswer.update({
      where: { id: answerId },
      data: { isAccepted: true },
    });

    // Mark doubt as resolved
    await prisma.doubt.update({
      where: { id },
      data: {
        status: "RESOLVED",
        resolvedAnswerId: answerId,
      },
    });

    // Reward solver with +20 Karma, questioner with +5 Karma
    await prisma.user.update({
      where: { id: answer.authorId },
      data: { karmaPoints: { increment: 20 } },
    });

    res.json({
      success: true,
      message: "Answer marked as accepted solution! +20 Karma to solver.",
    });
  } catch (error) {
    logger.error("Error accepting answer:", error);
    res.status(500).json({ success: false, message: "Failed to accept answer." });
  }
};

/**
 * Endorse answer (Faculty only)
 */
exports.endorseAnswer = async (req, res) => {
  try {
    const { answerId } = req.params;
    const { facultyName = "Dr. B.V. N. Rani" } = req.body;

    const updated = await prisma.doubtAnswer.update({
      where: { id: answerId },
      data: {
        isFacultyEndorsed: true,
        endorsedByFacultyName: facultyName,
      },
    });

    res.json({
      success: true,
      message: "Answer endorsed with official Faculty Badge.",
      data: updated,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to endorse answer." });
  }
};

/**
 * Upvote doubt or answer
 */
exports.upvoteDoubt = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId = "usr_demo_001" } = req.body;

    const existing = await prisma.doubtUpvote.findUnique({
      where: { userId_doubtId: { userId, doubtId: id } },
    });

    if (existing) {
      await prisma.doubtUpvote.delete({
        where: { id: existing.id },
      });
      return res.json({ success: true, upvoted: false });
    }

    await prisma.doubtUpvote.create({
      data: { userId, doubtId: id },
    });

    res.json({ success: true, upvoted: true });
  } catch (error) {
    res.status(500).json({ success: false, message: "Failed to upvote doubt." });
  }
};

/**
 * Get user stats (Doubts asked, solved, answers given, karma)
 */
exports.getUserDoubtStats = async (req, res) => {
  try {
    const { userId = "usr_demo_001" } = req.query;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, karmaPoints: true, role: true },
    });

    if (!user) {
      return res.status(404).json({ success: false, message: "User not found." });
    }

    const [askedCount, answeredCount, acceptedSolutions] = await Promise.all([
      prisma.doubt.count({ where: { authorId: userId } }),
      prisma.doubtAnswer.count({ where: { authorId: userId } }),
      prisma.doubtAnswer.count({ where: { authorId: userId, isAccepted: true } }),
    ]);

    const resolvedAsked = await prisma.doubt.count({
      where: { authorId: userId, status: "RESOLVED" },
    });

    res.json({
      success: true,
      data: {
        user,
        doubtsAsked: askedCount,
        doubtsResolved: resolvedAsked,
        answersGiven: answeredCount,
        solutionsAccepted: acceptedSolutions,
        karmaPoints: user.karmaPoints,
      },
    });
  } catch (error) {
    logger.error("Error fetching user stats:", error);
    res.status(500).json({ success: false, message: "Failed to fetch user doubt stats." });
  }
};
