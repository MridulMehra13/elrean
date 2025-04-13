const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const verifyToken = require("../middleware/authMiddleware");

const User = require("../models/User");

// Track video progress
router.post("/:courseId/video", verifyToken, async (req, res) => {
  const { videoTitle } = req.body;
  const userId = req.user.id;
  const { courseId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user.courseProgress) user.courseProgress = {};

    if (!user.courseProgress[courseId]) {
      user.courseProgress[courseId] = { watched: [] };
    }

    if (!user.courseProgress[courseId].watched.includes(videoTitle)) {
      user.courseProgress[courseId].watched.push(videoTitle);
    }

    await user.save();

    res.json({ message: "Progress updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

module.exports = router;
