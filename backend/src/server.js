const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const cookieParser = require("cookie-parser");
const env = require("./config/env");
const logger = require("./utils/logger");
const errorHandler = require("./middleware/errorHandler");
const apiRoutes = require("./routes/index");

const app = express();

// Security headers
app.use(helmet({ contentSecurityPolicy: false }));

// CORS configuration
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || process.env.NODE_ENV !== "production") {
        return callback(null, true);
      }
      if (Array.isArray(env.corsOrigin) && env.corsOrigin.includes(origin)) {
        return callback(null, true);
      }
      return callback(null, true);
    },
    credentials: true,
  })
);

app.use(cookieParser());
app.use(express.json({ limit: "15mb" }));
app.use(express.urlencoded({ limit: "15mb", extended: true }));

// Mount HTTP Request Logger
app.use(logger.requestLogger);

// Mount central API routes
app.use("/api", apiRoutes);

// Root route
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    name: "Cryptic to Clear API",
    status: "healthy",
    version: "1.0.0",
  });
});

// 404 handler for unknown routes
app.use((req, res) => {
  res.status(404).json({ success: false, message: "Route not found." });
});

// Centralized Error Handler Middleware
app.use(errorHandler);

const server = app.listen(env.port, () => {
  logger.info(`Cryptic to Clear backend listening on port ${env.port}`);
});

// Graceful shutdown handling
["SIGTERM", "SIGINT"].forEach((signal) => {
  process.on(signal, () => {
    logger.info(`${signal} received, shutting down gracefully...`);
    server.close(() => process.exit(0));
    setTimeout(() => process.exit(1), 10000).unref();
  });
});

module.exports = app;
