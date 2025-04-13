require("dotenv").config(); // ✅ Load environment variables first

const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const Grid = require("gridfs-stream");

const authRoutes = require("./routes/auth");
const quizRoutes = require("./routes/quiz");
const recommendationRoutes = require("./routes/recommendation");
const playlistRoutes = require("./routes/playlist");
const chatbotRoutes = require("./routes/chatbot");
const leaderboardRoutes = require("./routes/leaderboard"); // ✅ Added leaderboard route
const discussionRoutes = require("./routes/discussion");
const courseRoutes = require("./routes/course");
const progressRoutes = require("./routes/progress");

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Log incoming requests and their headers
app.use((req, res, next) => {
    console.log("Incoming Request:", req.method, req.url);
    console.log("Headers:", req.headers);
    next();
});

// ✅ Load environment variables
const mongoURI = process.env.MONGO_URI;
const PORT = process.env.PORT || 5000;

if (!mongoURI) {
    console.error("❌ ERROR: MONGO_URI is not defined in .env");
    process.exit(1);
}

// ✅ Connect to MongoDB
mongoose.connect(mongoURI, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(() => console.log("✅ MongoDB Connected"))
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err);
        process.exit(1);
    });

// ✅ Initialize GridFS for Video Uploads
const conn = mongoose.connection;
let gfs;
conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
    console.log("✅ GridFS Initialized");
});

// ✅ Use Routes
app.use("/api/auth", authRoutes);
app.use("/api/quiz", quizRoutes);
app.use("/api/recommend", recommendationRoutes);
app.use("/api/playlist", playlistRoutes);
app.use("/api/chatbot", chatbotRoutes);
app.use("/api/leaderboard", leaderboardRoutes);
app.use("/api/discussions", discussionRoutes);
app.use("/api/course", courseRoutes);
app.use("/api/progress", progressRoutes);

// ✅ Start Server
app.listen(PORT, () => console.log(`✅ Server running on port ${PORT}`));
