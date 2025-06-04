const mongoose = require("mongoose");
const Quiz = require("../models/Quiz");
require("dotenv").config();

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/e-learn";

const sampleQuizzes = [
  {
    title: "JavaScript Basics",
    description: "Test your knowledge of JavaScript fundamentals.",
    questions: [
      {
        question: "What is a closure in JavaScript?",
        options: [
          "A function bundled with its lexical environment",
          "A type of loop",
          "An object property",
          "A variable declaration"
        ],
        correctAnswer: "A function bundled with its lexical environment"
      },
      {
        question: "Which method is used to parse a JSON string?",
        options: [
          "JSON.stringify()",
          "JSON.parse()",
          "JSON.convert()",
          "JSON.toString()"
        ],
        correctAnswer: "JSON.parse()"
      }
    ]
  },
  {
    title: "Multithreading Concepts",
    description: "Assess your understanding of multithreading.",
    questions: [
      {
        question: "What is a common question on multithreading?",
        options: [
          "How to create threads in Java",
          "What is a deadlock?",
          "What is a closure?",
          "What is a callback?"
        ],
        correctAnswer: "What is a deadlock?"
      },
      {
        question: "Which of the following is a thread state?",
        options: [
          "Running",
          "Sleeping",
          "Waiting",
          "All of the above"
        ],
        correctAnswer: "All of the above"
      }
    ]
  }
];

async function seedQuizzes() {
  try {
    await mongoose.connect(mongoURI);
    console.log("Connected to MongoDB");

    await Quiz.deleteMany({});
    console.log("Cleared existing quizzes");

    await Quiz.insertMany(sampleQuizzes);
    console.log("Inserted sample quizzes");

    mongoose.disconnect();
    console.log("Disconnected from MongoDB");
  } catch (error) {
    console.error("Error seeding quizzes:", error);
  }
}

seedQuizzes();
