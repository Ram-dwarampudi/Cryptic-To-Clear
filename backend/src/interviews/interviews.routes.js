const express = require("express");
const controller = require("./interviews.controller");

const router = express.Router();

router.get("/", controller.getInterviews);
router.get("/companies", controller.getCompanyStats);
router.get("/:id", controller.getInterviewById);
router.post("/", controller.createInterview);
router.post("/:id/upvote", controller.upvoteInterview);

module.exports = router;
