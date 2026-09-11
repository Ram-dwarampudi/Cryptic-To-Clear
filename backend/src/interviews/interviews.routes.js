const express = require("express");
const controller = require("./interviews.controller");
const { optionalAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

router.get("/", optionalAuth, controller.getInterviews);
router.get("/companies", controller.getCompanyStats);
router.get("/:id", optionalAuth, controller.getInterviewById);
router.post("/", optionalAuth, controller.createInterview);
router.post("/:id/upvote", optionalAuth, controller.upvoteInterview);

module.exports = router;
