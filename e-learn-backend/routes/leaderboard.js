const express = require("express");
const User = require("../models/User");

const router = express.Router();

// ✅ Get Leaderboard (Top 10 Users)
router.get("/", async (req, res) => {
    try {
        const topUsers = await User.find()
            .sort({ xp: -1 })  // Sort users by XP in descending order
            .limit(10)
            .select("name xp level"); // Return only necessary fields

        res.json(topUsers);
    } catch (error) {
        console.error("❌ Error fetching leaderboard:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// ✅ Add XP to a User
router.post("/add-xp", async (req, res) => {
    try {
        const { userId, xpEarned } = req.body;
        if (!userId || !xpEarned) {
            return res.status(400).json({ error: "User ID and XP required" });
        }

        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }

        user.xp += xpEarned;
        user.calculateLevel(); // ✅ Update level based on XP
        await user.save();

        res.json({ message: "XP Updated!", user });
    } catch (error) {
        console.error("❌ Error adding XP:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
