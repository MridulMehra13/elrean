const express = require("express");
const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");

const router = express.Router();

// Create a new quiz
router.post("/create", async (req, res) => {
    try {
        const { title, description, questions } = req.body;

        if (!title || !description || !questions || !Array.isArray(questions)) {
            return res.status(400).json({ error: "Invalid request body" });
        }

        const newQuiz = new Quiz({ title, description, questions });
        await newQuiz.save();

        res.status(201).json({ message: "Quiz created successfully!", quiz: newQuiz });
    } catch (error) {
        console.error("Error creating quiz:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get all quizzes
router.get("/all", async (req, res) => {
    try {
        const quizzes = await Quiz.find();
        res.json(quizzes);
    } catch (error) {
        console.error("Error fetching quizzes:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Get a specific quiz by ID
router.get("/:id", async (req, res) => {
    try {
        const { id } = req.params;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Quiz ID" });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        res.json(quiz);
    } catch (error) {
        console.error("Error fetching quiz:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

// Submit answers and check results
router.post("/:id/submit", async (req, res) => {
    try {
        const { id } = req.params;
        const { answers } = req.body;

        // Validate ID format
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid Quiz ID" });
        }

        // Validate answers format
        if (!answers || !Array.isArray(answers)) {
            return res.status(400).json({ error: "Invalid answers format. Expected an array." });
        }

        const quiz = await Quiz.findById(id);
        if (!quiz) return res.status(404).json({ error: "Quiz not found" });

        if (quiz.questions.length !== answers.length) {
            return res.status(400).json({ error: "Mismatch between quiz questions and provided answers." });
        }

        let score = 0;
        let total = quiz.questions.length;

        quiz.questions.forEach((question, index) => {
            if (answers[index] === question.correctAnswer) {
                score++;
            }
        });

        res.json({ score, total });
    } catch (error) {
        console.error("Error submitting quiz:", error);
        res.status(500).json({ error: "Internal Server Error" });
    }
});

module.exports = router;
