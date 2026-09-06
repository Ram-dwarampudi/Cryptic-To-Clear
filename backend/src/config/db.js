const { PrismaClient } = require("@prisma/client");
const logger = require("../utils/logger");

const prisma = new PrismaClient({
  log:
    process.env.NODE_ENV === "development"
      ? ["error", "warn"]
      : ["error"],
});

// Test connection on startup
prisma
  .$connect()
  .then(() => {
    logger.info("Database connection established successfully (Prisma ORM)");
  })
  .catch((err) => {
    logger.error("Failed to connect to database:", err);
  });

module.exports = prisma;
