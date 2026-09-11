const express = require("express");
const usersController = require("./users.controller");
const { requireAuth } = require("../auth/middleware/auth.middleware");

const router = express.Router();

// Public / student accessible leaderboard & search
router.get("/leaderboard", usersController.getLeaderboard);
router.get("/search", usersController.searchStudents);
router.get("/:id/public-profile", usersController.getPublicProfile);

router.use(requireAuth);
router.get("/profile", usersController.getProfile);
router.put("/profile", usersController.updateProfile);
router.post("/sync-external", usersController.syncExternal);
router.get("/dashboard", usersController.getDashboard);

module.exports = router;
