const express = require("express");
const controller = require("./doubts.controller");
const { optionalAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

router.get("/", optionalAuth, controller.getDoubts);
router.get("/stats/me", optionalAuth, controller.getUserDoubtStats);
router.get("/:id", optionalAuth, controller.getDoubtById);
router.post("/", optionalAuth, controller.createDoubt);
router.post("/:id/answers", optionalAuth, controller.createAnswer);
router.patch("/:id/accept/:answerId", optionalAuth, controller.acceptAnswer);
router.post("/answers/:answerId/endorse", optionalAuth, controller.endorseAnswer);
router.post("/:id/upvote", optionalAuth, controller.upvoteDoubt);

module.exports = router;
