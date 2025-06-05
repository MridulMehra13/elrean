require("dotenv").config({ path: __dirname + "/.env" }); // Explicitly load .env from current directory

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors"); // Import cors
const Grid = require("gridfs-stream");

// ... (other route imports)
const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const recommendationRoutes = require("./routes/recommendation"); // ⭐ Your recommendation routes
const playlistRoutes = require("./routes/playlist");
const chatbotRoutes = require("./routes/chatbot");
const leaderboardRoutes = require("./routes/leaderboard");
const discussionRoutes = require("./routes/discussion");
const courseRoutes = require("./routes/course");
const progressRoutes = require("./routes/progress");


const app = express();
app.use(express.json());

// ⭐⭐⭐ MODIFIED CORS CONFIGURATION HERE ⭐⭐⭐
app.use(cors({
  origin: 'http://localhost:3000', // ⭐ Change this to your frontend's exact URL
  credentials: true,               // ⭐ Allow cookies and Authorization headers to be sent
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'], // ⭐ Explicitly allow methods, including OPTIONS for preflight
  allowedHeaders: ['Content-Type', 'Authorization'], // ⭐ Explicitly allow headers your frontend sends
}));
// ⭐⭐⭐ END OF MODIFIED CORS CONFIGURATION ⭐⭐⭐

const path = require("path");
app.use('/assets', express.static(path.join(__dirname, 'assessts')));

// Log incoming requests
app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.url);
    next();
});

const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
}

mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("✅ GridFS Initialized");
});

// ⭐ Your routes - these are fine
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/progress", progressRoutes);

app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));