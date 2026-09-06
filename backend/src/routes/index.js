const express = require("express");

const analyzeRoutes = require("./analyze.routes");
const chatRoutes = require("./chat.routes");
const convertRoutes = require("./convert.routes");
const debugRoutes = require("./debug.routes");
const executeRoutes = require("./execute.routes");
const explainRoutes = require("./explain.routes");
const healthRoutes = require("./health.routes");
const languagesRoutes = require("./languages.routes");
const learnRoutes = require("./learn.routes");

const authRoutes = require("../auth/auth.routes");
const facultyRoutes = require("../faculty/faculty.routes");
const usersRoutes = require("../users/users.routes");
const subscriptionsRoutes = require("../subscriptions/subscriptions.routes");
const historyRoutes = require("../history/history.routes");
const projectsRoutes = require("../projects/projects.routes");
const interviewsRoutes = require("../interviews/interviews.routes");
const doubtsRoutes = require("../doubts/doubts.routes");

const router = express.Router();

router.use("/health", healthRoutes);
router.use("/languages", languagesRoutes);
router.use("/execute", executeRoutes);
router.use("/explain", explainRoutes);
router.use("/chat", chatRoutes);
router.use("/analyze", analyzeRoutes);
router.use("/debug", debugRoutes);
router.use("/learn", learnRoutes);
router.use("/convert", convertRoutes);
router.use("/auth", authRoutes);
router.use("/faculty", facultyRoutes);
router.use("/users", usersRoutes);
router.use("/subscriptions", subscriptionsRoutes);
router.use("/history", historyRoutes);
router.use("/projects", projectsRoutes);
router.use("/interviews", interviewsRoutes);
router.use("/doubts", doubtsRoutes);

module.exports = router;
