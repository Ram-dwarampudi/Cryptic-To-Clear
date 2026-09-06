const bcrypt = require("bcryptjs");

/**
 * In-Memory User Repository with persistent fallback and future DB compatibility (Mongoose/Prisma ready).
 */
class UserModel {
  constructor() {
    this.users = new Map();

    // Seed default demo account
    this._seedDemoAccount();
  }

  _seedDemoAccount() {
    const demoPassword = bcrypt.hashSync("Password123!", 10);
    const demoUser = {
      id: "usr_demo_001",
      name: "Demo Student",
      email: "demo@cryptictoclear.io",
      passwordHash: demoPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=DemoUser",
      provider: "local",
      role: "student",
      institutionId: "inst_mit_01",
      departmentId: "dept_cs_01",
      plan: "free",
      subscriptionStatus: "active",
      subscriptionExpiry: null,
      credits: 100,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastLogin: new Date().toISOString(),
    };
    this.users.set(demoUser.id, demoUser);

    const facultyPassword = bcrypt.hashSync("Faculty123!", 10);
    const demoFaculty = {
      id: "usr_faculty_demo",
      name: "Dr.B.V.NRani",
      email: "faculty@cryptictoclear.io",
      passwordHash: facultyPassword,
      avatar: "https://api.dicebear.com/7.x/avataaars/svg?seed=FacultyDemo",
      provider: "local",
      role: "faculty",
      institutionId: "inst_mit_01",
      departmentId: "dept_cs_01",
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

  async findByEmail(email) {
    if (!email) return null;
    const normalizedEmail = email.trim().toLowerCase();
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === normalizedEmail) {
        return user;
      }
    }
    return null;
  }

  async findById(id) {
    if (!id) return null;
    return this.users.get(id) || null;
  }

  async create({ name, email, password, provider = "local", avatar = null, role = "student", institutionId = "inst_mit_01", departmentId = "dept_cs_01" }) {
    const existing = await this.findByEmail(email);
    if (existing) {
      const err = new Error("User with this email already exists.");
      err.statusCode = 409;
      throw err;
    }

    const passwordHash = password ? await bcrypt.hash(password, 10) : null;
    const id = `usr_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`;
    const now = new Date().toISOString();

    const newUser = {
      id,
      name: name ? name.trim() : "Developer",
      email: email.trim().toLowerCase(),
      passwordHash,
      avatar: avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(email)}`,
      provider,
      role: role || "student",
      institutionId,
      departmentId,
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
}

module.exports = new UserModel();
