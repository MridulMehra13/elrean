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
        options: ["JSON.stringify()", "JSON.parse()", "JSON.convert()", "JSON.toString()"],
        correctAnswer: "JSON.parse()"
      }
    ]
  },
  {
    title: "Multithreading Concepts",
    description: "Assess your understanding of multithreading.",
    questions: [
      {
        question: "What is a deadlock?",
        options: [
          "A type of closure",
          "A scenario where threads wait forever",
          "A JSON method",
          "An event handler"
        ],
        correctAnswer: "A scenario where threads wait forever"
      },
      {
        question: "Which is a thread state?",
        options: ["Running", "Sleeping", "Waiting", "All of the above"],
        correctAnswer: "All of the above"
      }
    ]
  },
  {
    title: "Python Basics",
    description: "Quiz to test core Python concepts.",
    questions: [
      {
        question: "What data type is the object below?\n`x = [1, 2, 3]`",
        options: ["List", "Dictionary", "Tuple", "Set"],
        correctAnswer: "List"
      },
      {
        question: "What keyword is used to define a function in Python?",
        options: ["function", "def", "fun", "define"],
        correctAnswer: "def"
      }
    ]
  },
  {
    title: "CSS Fundamentals",
    description: "Test your knowledge on CSS styling and selectors.",
    questions: [
      {
        question: "Which CSS property controls the text size?",
        options: ["font-style", "text-size", "font-size", "text-style"],
        correctAnswer: "font-size"
      },
      {
        question: "How do you select an element with id 'header'?",
        options: ["#header", ".header", "header", "*header"],
        correctAnswer: "#header"
      }
    ]
  },
  {
    title: "React Basics",
    description: "Assess your React knowledge.",
    questions: [
      {
        question: "What is JSX?",
        options: [
          "A JavaScript XML syntax extension",
          "A data structure",
          "React’s state manager",
          "A backend tool"
        ],
        correctAnswer: "A JavaScript XML syntax extension"
      },
      {
        question: "Which hook is used for state in functional components?",
        options: ["useFetch", "useData", "useState", "useEffect"],
        correctAnswer: "useState"
      }
    ]
  },
  {
    title: "Node.js Core",
    description: "Node.js fundamentals for backend development.",
    questions: [
      {
        question: "Which module is used to create a server in Node.js?",
        options: ["url", "fs", "http", "path"],
        correctAnswer: "http"
      },
      {
        question: "Which statement loads a module in Node.js?",
        options: ["include()", "import", "require()", "load()"],
        correctAnswer: "require()"
      }
    ]
  },
  {
    title: "MongoDB Basics",
    description: "Test your NoSQL and MongoDB knowledge.",
    questions: [
      {
        question: "What is the default port MongoDB runs on?",
        options: ["3306", "27017", "8080", "5432"],
        correctAnswer: "27017"
      },
      {
        question: "Which data format is used to store documents in MongoDB?",
        options: ["XML", "JSON", "BSON", "YAML"],
        correctAnswer: "BSON"
      }
    ]
  },
  {
    title: "Git & GitHub",
    description: "Version control and Git fundamentals.",
    questions: [
      {
        question: "Which command creates a new local Git repository?",
        options: ["git init", "git start", "git create", "git new"],
        correctAnswer: "git init"
      },
      {
        question: "Which command shows the commit history?",
        options: ["git show", "git log", "git status", "git history"],
        correctAnswer: "git log"
      }
    ]
  },
  {
    title: "AI Fundamentals",
    description: "Quiz on core AI and ML concepts.",
    questions: [
      {
        question: "What is supervised learning?",
        options: [
          "Training using labeled data",
          "Training using no data",
          "Training using unlabelled data",
          "Learning with reinforcement"
        ],
        correctAnswer: "Training using labeled data"
      },
      {
        question: "Which algorithm is commonly used in classification?",
        options: ["Linear Regression", "K-Means", "Decision Trees", "KNN"],
        correctAnswer: "KNN"
      }
    ]
  },
  {
    title: "Data Structures",
    description: "Check your knowledge of common data structures.",
    questions: [
      {
        question: "Which data structure uses LIFO?",
        options: ["Queue", "Array", "Stack", "Linked List"],
        correctAnswer: "Stack"
      },
      {
        question: "Which is not a linear data structure?",
        options: ["Array", "Linked List", "Binary Tree", "Queue"],
        correctAnswer: "Binary Tree"
      }
    ]
  }
];

async function seedQuizzes() {
  try {
    await mongoose.connect(mongoURI);
    console.log("✅ Connected to MongoDB");

    await Quiz.deleteMany({});
    console.log("🧹 Existing quizzes cleared");

    await Quiz.insertMany(sampleQuizzes);
    console.log("✅ Inserted 10 sample quizzes");

    mongoose.disconnect();
    console.log("🔌 Disconnected from MongoDB");
  } catch (error) {
    console.error("❌ Error seeding quizzes:", error);
  }
}

seedQuizzes();
