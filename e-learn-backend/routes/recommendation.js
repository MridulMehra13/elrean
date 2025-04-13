const express = require("express");
const axios = require("axios");

const router = express.Router();

// Base URL of Flask ML Service
const FLASK_API_URL = "http://127.0.0.1:5001";

router.get("/collaborative", async (req, res) => {
    const { user_id } = req.query;
    if (!user_id) {
        return res.status(400).json({ error: "Missing user_id parameter" });
    }

    try {
        const response = await axios.get(`${FLASK_API_URL}/recommend/collaborative?user_id=${user_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

router.get("/content", async (req, res) => {
    const { course_id } = req.query;
    if (!course_id) {
        return res.status(400).json({ error: "Missing course_id parameter" });
    }

    try {
        const response = await axios.get(`${FLASK_API_URL}/recommend/content?course_id=${course_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

router.get("/hybrid", async (req, res) => {
    const { user_id, course_id } = req.query;
    if (!user_id || !course_id) {
        return res.status(400).json({ error: "Missing user_id or course_id parameter" });
    }

    try {
        const response = await axios.get(`${FLASK_API_URL}/recommend/hybrid?user_id=${user_id}&course_id=${course_id}`);
        res.json(response.data);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch recommendations" });
    }
});

module.exports = router;
