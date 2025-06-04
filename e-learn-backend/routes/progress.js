const express = require("express");
const router = express.Router();
const Course = require("../models/Course");
const verifyToken = require("../middleware/authMiddleware");

const User = require("../models/User");

// Track video progress
router.post("/progress/:courseId/video", verifyToken, async (req, res) => {
  const { courseId } = req.params;
  const { videoTitle } = req.body;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ error: "Course not found" });

    if (!course.progress) course.progress = {};

    const userProgress = course.progress[req.user.id] || [];

    if (!userProgress.includes(videoTitle)) {
      course.progress[req.user.id] = [...userProgress, videoTitle];
      await course.save();
    }

    res.json({ success: true });
  } catch (err) {
    console.error("Failed to update progress:", err);
    res.status(500).json({ error: "Failed to update progress" });
  }
});

module.exports = router;
