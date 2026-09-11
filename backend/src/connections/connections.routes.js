const express = require("express");
const controller = require("./connections.controller");
const { requireAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

router.use(requireAuth);

router.get("/", controller.getConnections);
router.post("/request", controller.sendRequest);
router.post("/respond", controller.respondRequest);
router.get("/status/:targetUserId", controller.getStatus);
router.delete("/:targetUserId", controller.removeConnection);

module.exports = router;
