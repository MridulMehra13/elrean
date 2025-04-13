// routes/course.js
const express = require("express");
const Course = require("../models/Course");
const verifyToken = require("../middleware/authMiddleware");
const router = express.Router();

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
    const { title, description, videoLinks } = req.body;

    if (!videoLinks || !Array.isArray(videoLinks) || videoLinks.length === 0) {
      return res.status(400).json({ error: "At least one video link is required." });
    }

    const videos = videoLinks.map((link, index) => {
      const videoId = extractYoutubeId(link);
      return {
        title: `YouTube Video ${index + 1}`,
        url: link,
        source: "youtube",
        thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
      };
    });

    const newCourse = new Course({
      title,
      description,
      videos,
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
router.get("/:id", async (req, res) => {
  try {
    const course = await Course.findById(req.params.id).lean();
    if (!course) return res.status(404).json({ error: "Course not found" });

    const isEnrolled = course.enrolledStudents?.some(
      (studentId) => studentId.toString() === req.user.id
    );
    const progress = course.progress?.[req.user.id] || [];

    res.json({
      ...course,
      isEnrolled,
      userProgress: progress,
    });
  } catch (err) {
    console.error("Failed to fetch course details:", err);
    res.status(500).json({ error: "Failed to fetch course details" });
  }
});

module.exports = router;
