const express = require("express");
const controller = require("./doubts.controller");

const router = express.Router();

router.get("/", controller.getDoubts);
router.get("/stats/me", controller.getUserDoubtStats);
router.get("/:id", controller.getDoubtById);
router.post("/", controller.createDoubt);
router.post("/:id/answers", controller.createAnswer);
router.patch("/:id/accept/:answerId", controller.acceptAnswer);
router.post("/answers/:answerId/endorse", controller.endorseAnswer);
router.post("/:id/upvote", controller.upvoteDoubt);

module.exports = router;
