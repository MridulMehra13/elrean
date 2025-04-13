const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");
const Discussion = require("../models/Discussion");
const authMiddleware = require("../middleware/authMiddleware");

router.post("/create", authMiddleware, async (req, res) => {
    try {
        let { title, content, courseId } = req.body;
        const userId = req.user.id;

        // ✅ Validate and convert courseId to ObjectId
        if (!mongoose.Types.ObjectId.isValid(courseId)) {
            return res.status(400).json({ message: "Invalid courseId" });
        }

        courseId = new mongoose.Types.ObjectId(courseId); // Convert to ObjectId

        // ✅ Create discussion
        const discussion = new Discussion({
            title,
            content,
            author: userId,
            courseId
        });

        await discussion.save();
        res.status(201).json({ message: "Discussion created successfully", discussion });

    } catch (error) {
        console.error("Discussion Creation Error:", error);
        res.status(500).json({ message: "Internal server error" });
    }
});

module.exports = router;
