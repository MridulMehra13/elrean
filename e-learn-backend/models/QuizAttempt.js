const mongoose = require("mongoose");

const QuizAttemptSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  quiz: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  answers: [{ type: String }], // user's submitted answers
  score: { type: Number, required: true },
  total: { type: Number, required: true },
  xpEarned: { type: Number, required: true },
  attemptedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("QuizAttempt", QuizAttemptSchema);
