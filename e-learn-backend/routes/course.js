// routes/course.js
const express = require("express");
const Course = require("../models/Course");
const UserCoursePreference = require("../models/UserCoursePreference");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();
const mongoose = require('mongoose');


router.use(verifyToken);

// ✅ Robust YouTube ID extractor
const extractYoutubeId = (url) => {
  const regExp = /(?:youtu\.be\/|youtube\.com\/(?:.*v=|v\/|embed\/|.*\/))([\w-]{11})/;
  const match = url.match(regExp);
  return match ? match[1] : null;
};

// ✅ Get all courses
router.get("/", async (req, res) => {
  try {
    const courses = await Course.find().populate("enrolledStudents", "_id");
    const userId = req.user.id;

    const updatedCourses = courses.map((course) => {
      const isEnrolled = course.enrolledStudents.some(
        (student) => student._id.toString() === userId
      );
      return {
        ...course._doc,
        isEnrolled,
      };
    });

    res.json(updatedCourses);
  } catch (err) {
    console.error("Failed to fetch courses:", err);
    res.status(500).json({ error: "Failed to fetch courses" });
  }
});

// ✅ Create new course
router.post("/", async (req, res) => {
  try {
    const { title, description, videoLinks, textResources } = req.body;

    if (!videoLinks || !Array.isArray(videoLinks) || videoLinks.length === 0) {
      return res.status(400).json({ error: "At least one video link is required." });
    }

    const videos = videoLinks.map((video, index) => {
      if (video.source === "upload") {
        return {
          title: video.title || `Uploaded Video ${index + 1}`,
          url: video.url, // expected to be /api/video/stream/:fileId
          source: "upload",
          thumbnail: video.thumbnail || "/default-thumbnail.jpg",
        };
      } else {
        const videoId = extractYoutubeId(video.url || video);
        return {
          title: video.title || `YouTube Video ${index + 1}`,
          url: video.url || video,
          source: "youtube",
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
        };
      }
    });

    const newCourse = new Course({
      title,
      description,
      videos,
      textResources: Array.isArray(textResources) ? textResources : [],
    });

    await newCourse.save();
    res.status(201).json(newCourse);
  } catch (err) {
    console.error("Failed to create course:", err);
    res.status(500).json({ error: "Failed to create course" });
  }
});

// ✅ Enroll in course
router.post("/:id/enroll", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    const course = await Course.findById(courseId);
    if (!course) return res.status(404).json({ message: "Course not found" });

    if (!course.enrolledStudents.includes(userId)) {
      course.enrolledStudents.push(userId);
      await course.save();
    }

    res.status(200).json({ message: "Enrolled successfully" });
  } catch (error) {
    console.error("Enroll error:", error);
    res.status(500).json({ message: "Server error during enrollment" });
  }
});

// ✅ Get course by ID
router.get("/:id", verifyToken, async (req, res) => {
  const { id } = req.params;

  if (!mongoose.Types.ObjectId.isValid(id)) {
    return res.status(400).json({ error: "Invalid course ID format" });
  }

  try {
    if (!req.user || !req.user.id) {
      return res.status(401).json({ error: "Unauthorized: No user info found." });
    }
    const course = await Course.findById(id).lean();
    if (!course) return res.status(404).json({ error: "Course not found" });

    const enrolledStudents = course.enrolledStudents || [];
    const isEnrolled = Array.isArray(enrolledStudents) && enrolledStudents.some(
      (studentId) => studentId.toString() === req.user.id
    );
    const progress = (course.progress && course.progress[req.user.id]) || [];

    // Get user learning mode preference
    const userPref = await UserCoursePreference.findOne({
      userId: req.user.id,
      courseId: id,
    });

    res.json({
      ...course,
      isEnrolled,
      userProgress: progress,
      learningModePreference: userPref ? userPref.learningMode : null,
    });
  } catch (err) {
    console.error("Failed to fetch course details:", err);
    res.status(500).json({ error: "Failed to fetch course details", details: err.message });
  }
});

// API to get user learning mode preference for a course
router.get("/:id/learning-mode", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;

  try {
    const userPref = await UserCoursePreference.findOne({ userId, courseId });
    if (!userPref) {
      return res.status(404).json({ message: "Preference not found" });
    }
    res.json({ learningMode: userPref.learningMode });
  } catch (err) {
    console.error("Error fetching learning mode preference:", err);
    res.status(500).json({ error: "Server error" });
  }
});

// API to set user learning mode preference for a course
router.post("/:id/learning-mode", async (req, res) => {
  const courseId = req.params.id;
  const userId = req.user.id;
  const { learningMode } = req.body;

  if (!["video", "text"].includes(learningMode)) {
    return res.status(400).json({ error: "Invalid learning mode" });
  }

  try {
    const userPref = await UserCoursePreference.findOneAndUpdate(
      { userId, courseId },
      { learningMode },
      { upsert: true, new: true }
    );
    res.json({ message: "Preference saved", learningMode: userPref.learningMode });
  } catch (err) {
    console.error("Error saving learning mode preference:", err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
