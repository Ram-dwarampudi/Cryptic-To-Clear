const path = require("path");
// Always resolve backend/.env and root .env regardless of where the node process was launched
require("dotenv").config({ path: path.resolve(__dirname, "../../.env"), override: true });
require("dotenv").config({ path: path.resolve(__dirname, "../../../.env"), override: true });
require("dotenv").config({ override: true });

const parseCorsOrigins = (value) => {
  if (!value) {
    return ["http://localhost:3000", "http://127.0.0.1:3000"];
  }

  return value
    .split(",")
    .map((origin) => origin.trim())
    .filter(Boolean);
};

const filterValidKeys = (keys) =>
  keys
    .filter(Boolean)
    .map((k) => k.trim())
    .filter(
      (k) =>
        !k.toLowerCase().includes("your_") &&
        !k.toLowerCase().includes("placeholder") &&
        k.length > 5
    );

const env = {
  port: process.env.PORT || 5000,
  corsOrigin: parseCorsOrigins(process.env.CORS_ORIGIN),

  // AI provider configuration.
  // Groq, NVIDIA, and Gemini supported as providers.
  groq: {
    apiKeys: filterValidKeys([
      process.env.GROQ_API_KEY,
      process.env.GROQ_API_KEY_PRIMARY,
      process.env.GROQ_API_KEY_SECONDARY,
    ]),
    model: process.env.GROQ_MODEL || "openai/gpt-oss-120b",
    baseUrl: process.env.GROQ_BASE_URL || "https://api.groq.com/openai/v1",
    requestTimeoutMs: Number(process.env.GROQ_TIMEOUT_MS) || 6000,
  },
  nvidia: {
    apiKeys: filterValidKeys([
      process.env.NVIDIA_API_KEY,
      process.env.NVIDIA_API_KEY_PRIMARY,
      process.env.NVIDIA_API_KEY_SECONDARY,
    ]),
    model: process.env.NVIDIA_MODEL || "nvidia/nemotron-3-ultra-550b-a55b",
    baseUrl: process.env.NVIDIA_BASE_URL || "https://integrate.api.nvidia.com/v1",
    requestTimeoutMs: Number(process.env.NVIDIA_TIMEOUT_MS) || 12000,
  },
  gemini: {
    apiKeys: filterValidKeys([
      process.env.GEMINI_API_KEY,
      process.env.GEMINI_API_KEY_PRIMARY,
      process.env.GEMINI_API_KEY_SECONDARY,
    ]),
    model: process.env.GEMINI_MODEL || "gemini-2.0-flash",
    baseUrl: process.env.GEMINI_BASE_URL || "https://generativelanguage.googleapis.com/v1beta/openai",
    requestTimeoutMs: Number(process.env.GEMINI_TIMEOUT_MS) || 12000,
  },
  judge0: {
    baseUrl: process.env.JUDGE0_BASE_URL || "https://judge0-ce.p.rapidapi.com",
    apiKey: process.env.JUDGE0_API_KEY || "",
    apiHost: process.env.JUDGE0_API_HOST || "judge0-ce.p.rapidapi.com",
  },
  piston: {
    baseUrl: process.env.PISTON_BASE_URL || "https://emkc.org/api/v2/piston",
  },
  jwt: {
    secret: process.env.JWT_SECRET || "cryptic-to-clear-jwt-secret-key-2026-key",
    expiresIn: process.env.JWT_EXPIRES_IN || "7d",
    cookieMaxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in ms
  },
  compiler: {
    javaPath: process.env.JAVA_PATH || "java",
    javacPath: process.env.JAVAC_PATH || "javac",
    pythonPath: process.env.PYTHON_PATH || "python",
    gccPath: process.env.GCC_PATH || "gcc",
    gppPath: process.env.GPP_PATH || "g++",
    goPath: process.env.GO_PATH || "go",
    executionTimeoutMs: Number(process.env.EXECUTION_TIMEOUT_MS) || 5000,
    maxBufferBytes: Number(process.env.MAX_BUFFER_BYTES) || 1024 * 1024,
  },
};

module.exports = env;
