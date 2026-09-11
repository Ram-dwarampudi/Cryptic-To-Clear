const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const axios = require("axios");
const env = require("../config/env");
const userModel = require("../models/user.model");
const { resolveStudentFromRegistration } = require("../utils/studentLookup");
const { ACADEMIC_BRANCHES, ACADEMIC_SECTIONS } = require("../constants/academic");

/**
 * Generate JWT token for user
 */
const generateToken = (user) => {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
      plan: user.plan,
    },
    env.jwt.secret,
    { expiresIn: env.jwt.expiresIn }
  );
};

/**
 * Attach token cookie to response
 */
const sendTokenResponse = (user, statusCode, res, message) => {
  const token = generateToken(user);
  const cookieOptions = {
    expires: new Date(Date.now() + env.jwt.cookieMaxAge),
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: process.env.NODE_ENV === "production" ? "strict" : "lax",
  };

  const sanitizedUser = userModel.sanitizeUser(user);

  res.status(statusCode).cookie("token", token, cookieOptions).json({
    success: true,
    message,
    token,
    user: sanitizedUser,
  });
};

/**
 * @route GET /api/auth/lookup-student
 * @desc Auto-fetch student details from registration number & email
 */
exports.lookupStudent = (req, res) => {
  const { rollNo, email } = req.query;
  const result = resolveStudentFromRegistration(rollNo, email);
  return res.status(200).json({
    success: true,
    data: result,
  });
};

/**
 * @route POST /api/auth/register
 * @desc Register new user account with auto-fetched academic details
 */
exports.register = async (req, res, next) => {
  try {
    const { name, email, password, role = "student", rollNo, avatar } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide both an email address and password.",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long.",
      });
    }

    const isFaculty = (role || "").toLowerCase() === "faculty";
    let branch = req.body.branch ? req.body.branch.trim().toUpperCase() : null;
    let section = req.body.section ? req.body.section.trim().toUpperCase() : null;

    if (!isFaculty) {
      if (!branch || !ACADEMIC_BRANCHES.includes(branch)) {
        return res.status(400).json({
          success: false,
          message: `Please select a valid branch (${ACADEMIC_BRANCHES.join(", ")}).`,
        });
      }
      if (!section || !ACADEMIC_SECTIONS.includes(section)) {
        return res.status(400).json({
          success: false,
          message: `Please select a valid section (${ACADEMIC_SECTIONS.join(", ")}).`,
        });
      }
    }

    let academicDetails = {
      rollNo: rollNo ? rollNo.trim().toUpperCase() : null,
      collegeName: req.body.collegeName || null,
      stream: req.body.stream || req.body.department || null,
      branch,
      section,
      batchYear: req.body.batchYear ? parseInt(req.body.batchYear, 10) : null,
      graduationYear: req.body.graduationYear ? parseInt(req.body.graduationYear, 10) : null,
    };

    if (rollNo && !isFaculty) {
      const resolved = resolveStudentFromRegistration(rollNo, email);
      academicDetails = {
        ...academicDetails,
        ...resolved,
        rollNo: resolved.rollNo || rollNo.trim().toUpperCase(),
        branch: branch || resolved.branch || null,
        section: section || resolved.section || null,
      };
    }

    const newUser = await userModel.create({
      name: name ? name.trim() : (isFaculty ? "Faculty Member" : "Student"),
      email: email.trim().toLowerCase(),
      password,
      role: isFaculty ? "FACULTY" : "STUDENT",
      avatar: avatar || null,
      rollNo: academicDetails.rollNo || rollNo,
      collegeName: academicDetails.collegeName,
      stream: academicDetails.stream,
      branch: academicDetails.branch,
      section: academicDetails.section,
      batchYear: academicDetails.batchYear,
      graduationYear: academicDetails.graduationYear,
      provider: "local",
    });

    sendTokenResponse(newUser, 201, res, "Account created successfully! Welcome to Cryptic to Clear.");
  } catch (error) {
    if (error.statusCode === 409) {
      return res.status(409).json({ success: false, message: error.message });
    }
    next(error);
  }
};

/**
 * @route POST /api/auth/login
 * @desc Authenticate user via College Email OR Registration Number and issue token
 */
exports.login = async (req, res, next) => {
  try {
    const { email, identifier, rollNo, password } = req.body;
    const loginIdentifier = (email || identifier || rollNo || "").trim();

    if (!loginIdentifier || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide your Registration Number / College Email and password.",
      });
    }

    const user = await userModel.findByEmailOrRollNo(loginIdentifier);

    if (!user || !user.passwordHash) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your Registration Number / Email and password.",
      });
    }

    const isMatch = await userModel.comparePassword(password, user.passwordHash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials. Please verify your Registration Number / Email and password.",
      });
    }

    await userModel.updateLastLogin(user.id);
    sendTokenResponse(user, 200, res, "Successfully logged in!");
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/logout
 * @desc Clear authentication session
 */
exports.logout = (req, res) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 5 * 1000),
    httpOnly: true,
  });

  return res.status(200).json({
    success: true,
    message: "Logged out successfully.",
  });
};

/**
 * @route GET /api/auth/me
 * @desc Get currently logged in user session
 */
exports.getMe = async (req, res) => {
  return res.status(200).json({
    success: true,
    user: req.user,
  });
};

/**
 * @route POST /api/auth/faculty-demo
 * @desc Authenticate as Demo Faculty Account without credentials
 */
exports.facultyDemo = async (req, res, next) => {
  try {
    const demoFaculty = await userModel.findByEmail("faculty@cryptictoclear.io");
    if (!demoFaculty) {
      return res.status(404).json({
        success: false,
        message: "Demo faculty account not configured.",
      });
    }

    await userModel.updateLastLogin(demoFaculty.id);
    sendTokenResponse(demoFaculty, 200, res, "Successfully logged into Demo Faculty Account!");
  } catch (error) {
    next(error);
  }
};

/**
 * @route POST /api/auth/forgot-password
 * @desc Password reset request placeholder
 */
exports.forgotPassword = async (req, res) => {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({
      success: false,
      message: "Please enter your email address.",
    });
  }

  const user = await userModel.findByEmail(email);
  if (!user) {
    // Return generic success for privacy
    return res.status(200).json({
      success: true,
      message: "If an account exists with that email, password reset instructions have been sent.",
    });
  }

  return res.status(200).json({
    success: true,
    message: "Password reset link has been dispatched to your email address.",
    demoNote: "In development/demo mode, use Demo account credentials: demo@cryptictoclear.io / Password123! or faculty@cryptictoclear.io / Faculty123!",
  });
};

/**
 * @route POST /api/auth/google
 * @desc Authenticate with Google ID Token, Access Token, or OAuth Profile
 */
exports.googleAuth = async (req, res, next) => {
  try {
    const { credential, accessToken, userInfo, isDemoGoogle } = req.body;
    let googleUser = null;

    if (credential) {
      // Verify Google ID Token via Google's tokeninfo endpoint
      const response = await axios.get(
        `https://oauth2.googleapis.com/tokeninfo?id_token=${encodeURIComponent(credential)}`,
        { timeout: 8000 }
      );
      googleUser = {
        email: response.data.email,
        name: response.data.name || response.data.given_name || "Google User",
        picture: response.data.picture,
        sub: response.data.sub,
      };
    } else if (accessToken) {
      // Fetch user profile from Google's userinfo endpoint
      const response = await axios.get("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 8000,
      });
      googleUser = {
        email: response.data.email,
        name: response.data.name || response.data.given_name || "Google User",
        picture: response.data.picture,
        sub: response.data.sub,
      };
    } else if (isDemoGoogle && userInfo && userInfo.email) {
      // Instant development/preview test mode
      googleUser = {
        email: userInfo.email,
        name: userInfo.name || "Google Student",
        picture: userInfo.picture || `https://api.dicebear.com/7.x/avataaars/svg?seed=${encodeURIComponent(userInfo.email)}`,
        sub: "demo-google-" + Date.now(),
      };
    }

    if (!googleUser || !googleUser.email) {
      return res.status(400).json({
        success: false,
        message: "Unable to verify Google credentials. Please try signing in again.",
      });
    }

    const normalizedEmail = googleUser.email.trim().toLowerCase();
    let user = await userModel.findByEmail(normalizedEmail);

    if (!user) {
      // Create new user account in database from Google profile
      const tempPassword = crypto.randomBytes(32).toString("hex");
      user = await userModel.create({
        name: googleUser.name || "Student",
        email: normalizedEmail,
        password: tempPassword,
        avatar: googleUser.picture || null,
        role: "student",
        provider: "google",
      });
    } else {
      // If user exists, update avatar if currently placeholder
      if (googleUser.picture && (!user.avatar || user.avatar.includes("dicebear"))) {
        await userModel.updateUser(user.id, { avatar: googleUser.picture });
        user.avatar = googleUser.picture;
      }
      if (typeof userModel.updateLastLogin === "function") {
        await userModel.updateLastLogin(user.id);
      }
    }

    sendTokenResponse(user, 200, res, `Signed in successfully with Google as ${user.name}!`);
  } catch (error) {
    console.error("Google Auth error:", error.response?.data || error.message);
    return res.status(401).json({
      success: false,
      message: error.response?.data?.error_description || "Google authentication failed. Please try again.",
    });
  }
};
