const express = require("express");
const controller = require("./messages.controller");
const { requireAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/conversations", controller.getConversations);
router.get("/:peerId", controller.getConversation);
router.post("/", controller.sendMessage);
router.patch("/:peerId/read", controller.markRead);

module.exports = router;
