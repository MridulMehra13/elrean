const mongoose = require("mongoose");

const QuestionSchema = new mongoose.Schema({
    question: String,
    options: [String], // Multiple choice options
    correctAnswer: String
});

const QuizSchema = new mongoose.Schema({
    title: String,
    description: String,
    questions: [QuestionSchema]
});

const Quiz = mongoose.model("Quiz", QuizSchema);
module.exports = Quiz;
