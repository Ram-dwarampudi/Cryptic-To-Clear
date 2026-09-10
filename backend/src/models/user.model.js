const bcrypt = require("bcryptjs");
let prisma = null;
try {
  prisma = require("../config/db");
} catch {
  console.warn("Prisma client not available for UserModel, running in in-memory mode.");
}

/**
 * User Repository supporting Prisma PostgreSQL with persistent memory fallback.
 */
class UserModel {
  constructor() {
    this.users = new Map();

    // Seed default demo account in memory as fallback
    this._seedDemoAccount();
  }

  _seedDemoAccount() {
    const demoPassword = bcrypt.hashSync("Password123!", 10);
    const demoUser = {
      id: "usr_demo_001",
      name: "Demo Student",
      email: "demo@cryptictoclear.io",
      passwordHash: demoPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoStudent",
      provider: "local",
      role: "student",
      rollNo: null,
      batchYear: null,
      karmaPoints: 0,
      university: null,
      department: null,
      institutionId: null,
      departmentId: null,
      plan: "free",
      subscriptionStatus: "active",
      subscriptionExpiry: null,
      credits: 100,
      overallScore: 0,
      externalStats: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    this.users.set(demoUser.id, demoUser);

    const facultyPassword = bcrypt.hashSync("Faculty123!", 10);
    const demoFaculty = {
      id: "usr_faculty_demo",
      name: "Dr. B.V. N. Rani",
      email: "faculty@cryptictoclear.io",
      passwordHash: facultyPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FacultyDemo",
      provider: "local",
      role: "faculty",
      rollNo: "FAC-CSE-01",
      institutionId: "inst_aut_01",
      departmentId: "dept_cse_01",
      university: "Apex University of Technology",
      department: "Computer Science & Engineering",
      title: "Professor of Computer Science",
      plan: "enterprise",
      subscriptionStatus: "active",
      subscriptionExpiry: null,
      credits: 10000,
      isDemoAccount: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    this.users.set(demoFaculty.id, demoFaculty);
  }

  /**
   * Remove sensitive fields before returning user object to client
   */
  sanitizeUser(user) {
    if (!user) return null;
    const { passwordHash, ...sanitized } = user;
    return sanitized;
  }

  /**
   * Standardize user object format across Prisma DB and memory
   */
  _formatUser(dbUser) {
    if (!dbUser) return null;
    let parsedStats = null;
    if (dbUser.externalStats) {
      try {
        parsedStats = typeof dbUser.externalStats === "string" ? JSON.parse(dbUser.externalStats) : dbUser.externalStats;
      } catch {
        parsedStats = null;
      }
    }

    return {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      avatar: dbUser.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(dbUser.email)}`,
      provider: "local",
      role: (dbUser.role || "student").toLowerCase(),
      rollNo: dbUser.rollNo || null,
      batchYear: dbUser.batchYear || null,
      bio: dbUser.bio || "",
      collegeName: dbUser.collegeName || (dbUser.university ? dbUser.university.name : null),
      stream: dbUser.stream || (dbUser.department ? dbUser.department.name : null),
      primaryLanguage: dbUser.primaryLanguage || null,
      graduationYear: dbUser.graduationYear || dbUser.batchYear || null,
      leetcodeHandle: dbUser.leetcodeHandle || "",
      codechefHandle: dbUser.codechefHandle || "",
      codeforcesHandle: dbUser.codeforcesHandle || "",
      hackerrankHandle: dbUser.hackerrankHandle || "",
      githubHandle: dbUser.githubHandle || "",
      externalStats: parsedStats,
      overallScore: Number(dbUser.overallScore ?? 0),
      karmaPoints: Number(dbUser.karmaPoints ?? 0),
      universityId: dbUser.universityId,
      university: dbUser.university ? dbUser.university.name : null,
      departmentId: dbUser.departmentId,
      department: dbUser.department ? dbUser.department.name : null,
      plan: (dbUser.role || "").toUpperCase() === "FACULTY" ? "enterprise" : "free",
      subscriptionStatus: "active",
      subscriptionExpiry: null,
      credits: (dbUser.role || "").toUpperCase() === "FACULTY" ? 10000 : 100,
      isDemoAccount: dbUser.email.includes("demo"),
      createdAt: dbUser.createdAt instanceof Date ? dbUser.createdAt.toISOString() : dbUser.createdAt,
      updatedAt: dbUser.updatedAt instanceof Date ? dbUser.updatedAt.toISOString() : dbUser.updatedAt,
    };
  }

  async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();

    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { email: normalizedEmail },
          include: { university: true, department: true },
        });
        if (dbUser) {
          const userObj = this._formatUser(dbUser);
          this.users.set(dbUser.id, userObj);
          return userObj;
        }
      } catch (err) {
        console.warn("Prisma findByEmail error, using in-memory:", err.message);
      }
    }

    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findByEmailOrRollNo(identifier) {
    if (!identifier) return null;
    const cleanId = identifier.trim();
    const normalizedEmail = cleanId.toLowerCase();

    if (prisma) {
      try {
        const dbUser = await prisma.user.findFirst({
          where: {
            OR: [
              { email: { equals: normalizedEmail, mode: "insensitive" } },
              { rollNo: { equals: cleanId, mode: "insensitive" } },
            ],
          },
          include: { university: true, department: true },
        });
        if (dbUser) {
          const userObj = this._formatUser(dbUser);
          this.users.set(dbUser.id, userObj);
          return userObj;
        }
      } catch (err) {
        console.warn("Prisma findByEmailOrRollNo error, using in-memory:", err.message);
      }
    }

    for (const user of this.users.values()) {
      if (
        user.email.toLowerCase() === normalizedEmail ||
        (user.rollNo && user.rollNo.toLowerCase() === cleanId.toLowerCase())
      ) {
        return user;
      }
    }
    return null;
  }

  async findById(id) {
    if (!id) return null;

    if (prisma) {
      try {
        const dbUser = await prisma.user.findUnique({
          where: { id },
          include: { university: true, department: true },
        });
        if (dbUser) {
          const userObj = this._formatUser(dbUser);
          this.users.set(dbUser.id, userObj);
          return userObj;
        }
      } catch (err) {
        console.warn("Prisma findById error, using in-memory:", err.message);
      }
    }

    return this.users.get(id) || null;
  }

  async updateUser(id, updateData) {
    if (!id) return null;

    if (prisma) {
      try {
        const dbUser = await prisma.user.update({
          where: { id },
          data: updateData,
          include: { university: true, department: true },
        });
        const userObj = this._formatUser(dbUser);
        this.users.set(id, userObj);
        return userObj;
      } catch (err) {
        console.warn("Prisma updateUser error, fallback to memory:", err.message);
      }
    }

    const memoryUser = this.users.get(id);
    if (memoryUser) {
      Object.assign(memoryUser, updateData, { updatedAt: new Date().toISOString() });
      this.users.set(id, memoryUser);
      return memoryUser;
    }
    return null;
  }

  async create({
    name,
    email,
    password,
    provider = "local",
    avatar = null,
    role = "student",
    rollNo = null,
    batchYear = null,
    collegeName = null,
    stream = null,
    graduationYear = null,
    universityId = null,
    departmentId = null,
  }) {
    const existing = await this.findByEmail(email);
    if (existing) {
      const err = new Error("User with this email already exists.");
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const normalizedEmail = email.trim().toLowerCase();
    const formattedName = name ? name.trim() : "Student";
    const userRole = (role || "student").toUpperCase();

    if (prisma) {
      try {
        let targetUniId = universityId;
        if (!targetUniId) {
          const defaultUni = await prisma.university.findFirst();
          if (defaultUni) targetUniId = defaultUni.id;
        }

        let targetDeptId = departmentId;
        if (!targetDeptId && targetUniId) {
          const defaultDept = await prisma.department.findFirst({
            where: { universityId: targetUniId },
          });
          if (defaultDept) targetDeptId = defaultDept.id;
        }

        const createdDbUser = await prisma.user.create({
          data: {
            name: formattedName,
            email: normalizedEmail,
            passwordHash: passwordHash || "",
            role: userRole,
            rollNo: rollNo || null,
            batchYear: batchYear ? parseInt(batchYear, 10) : null,
            collegeName: collegeName || null,
            stream: stream || null,
            graduationYear: graduationYear ? parseInt(graduationYear, 10) : null,
            avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
            karmaPoints: 0,
            overallScore: 0,
            externalStats: null,
            universityId: targetUniId || null,
            departmentId: targetDeptId || null,
          },
          include: { university: true, department: true },
        });

        const userObj = {
          id: createdDbUser.id,
          name: createdDbUser.name,
          email: createdDbUser.email,
          passwordHash: createdDbUser.passwordHash,
          avatar: createdDbUser.avatar,
          provider: "local",
          role: createdDbUser.role.toLowerCase(),
          rollNo: createdDbUser.rollNo,
          batchYear: createdDbUser.batchYear,
          collegeName: createdDbUser.collegeName,
          stream: createdDbUser.stream,
          graduationYear: createdDbUser.graduationYear,
          karmaPoints: createdDbUser.karmaPoints,
          universityId: createdDbUser.universityId,
          university: createdDbUser.university ? createdDbUser.university.name : null,
          departmentId: createdDbUser.departmentId,
          department: createdDbUser.department ? createdDbUser.department.name : null,
          plan: createdDbUser.role === "FACULTY" ? "enterprise" : "free",
          subscriptionStatus: "active",
          subscriptionExpiry: null,
          credits: createdDbUser.role === "FACULTY" ? 10000 : 100,
          createdAt: createdDbUser.createdAt.toISOString(),
          updatedAt: createdDbUser.updatedAt.toISOString(),
        };

        this.users.set(createdDbUser.id, userObj);
        return userObj;
      } catch (err) {
        console.warn("Prisma user creation failed, falling back to memory:", err.message);
      }
    }

    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newUser = {
      id,
      name: formattedName,
      email: normalizedEmail,
      passwordHash,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(normalizedEmail)}`,
      provider,
      role: role ? role.toLowerCase() : "student",
      rollNo,
      batchYear: batchYear ? parseInt(batchYear, 10) : null,
      university: null,
      department: null,
      institutionId: null,
      departmentId: departmentId || null,
      plan: role === "faculty" ? "enterprise" : "free",
      subscriptionStatus: "active",
      subscriptionExpiry: null,
      credits: role === "faculty" ? 5000 : 50,
      createdAt: now,
      updatedAt: now,
      lastLogin: now,
    };

    this.users.set(id, newUser);
    return newUser;
  }

  async updateLastLogin(id) {
    const user = this.users.get(id);
    if (user) {
      user.lastLogin = new Date().toISOString();
      user.updatedAt = new Date().toISOString();
      this.users.set(id, user);
    }
    return user;
  }

  async updateSubscription(id, { plan, subscriptionStatus, subscriptionExpiry, credits }) {
    const user = this.users.get(id);
    if (!user) return null;

    if (plan !== undefined) user.plan = plan;
    if (subscriptionStatus !== undefined) user.subscriptionStatus = subscriptionStatus;
    if (subscriptionExpiry !== undefined) user.subscriptionExpiry = subscriptionExpiry;
    if (credits !== undefined) user.credits = credits;

    user.updatedAt = new Date().toISOString();
    this.users.set(id, user);
    return user;
  }

  async comparePassword(password, passwordHash) {
    if (!password || !passwordHash) return false;
    return bcrypt.compare(password, passwordHash);
  }

  async getLeaderboard() {
    if (prisma) {
      try {
        const dbUsers = await prisma.user.findMany({
          where: {
            OR: [
              { role: "STUDENT" },
              { role: "student" },
            ],
          },
          include: { university: true, department: true },
          orderBy: [
            { overallScore: "desc" },
            { karmaPoints: "desc" },
            { createdAt: "asc" },
          ],
        });

        if (dbUsers && dbUsers.length > 0) {
          return dbUsers.map((u, idx) => {
            const formatted = this._formatUser(u);
            return {
              rank: idx + 1,
              ...this.sanitizeUser(formatted),
            };
          });
        }
      } catch (err) {
        console.warn("Prisma getLeaderboard error, using in-memory fallback:", err.message);
      }
    }

    const students = Array.from(this.users.values())
      .filter((u) => (u.role || "").toLowerCase() === "student")
      .sort((a, b) => (b.overallScore || 0) - (a.overallScore || 0) || (b.karmaPoints || 0) - (a.karmaPoints || 0))
      .map((u, idx) => ({
        rank: idx + 1,
        ...this.sanitizeUser(u),
      }));

    return students;
  }
}

module.exports = new UserModel();
