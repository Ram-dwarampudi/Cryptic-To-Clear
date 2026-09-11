const express = require("express");
const controller = require("./notifications.controller");
const { requireAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", controller.getNotifications);
router.patch("/read-all", controller.markAllRead);
router.patch("/:id/read", controller.markRead);

module.exports = router;
