const express = require("express");
const mongoose = require("mongoose");
const Grid = require("gridfs-stream");
const multer = require("multer");
const { Readable } = require("stream");
const Playlist = require("../models/Playlist");

const router = express.Router();
const conn = mongoose.connection;
let gfs;

conn.once("open", () => {
    gfs = Grid(conn.db, mongoose.mongo);
    gfs.collection("uploads");
});

const storage = multer.memoryStorage();
const upload = multer({ storage });

// Add YouTube Playlist
router.post("/add-youtube", async (req, res) => {
    const { title, youtubeLink } = req.body;
    if (!title || !youtubeLink) {
        return res.status(400).json({ error: "Title and YouTube link are required" });
    }
    
    try {
        const newPlaylist = new Playlist({ title, youtubeLink });
        await newPlaylist.save();
        res.json({ message: "YouTube Playlist added successfully" });
    } catch (error) {
        res.status(500).json({ error: "Failed to add YouTube Playlist" });
    }
});

// Upload Video File
router.post("/upload-video", upload.single("file"), async (req, res) => {
    if (!req.file) {
        return res.status(400).json({ error: "No file uploaded" });
    }
    
    const readableStream = new Readable();
    readableStream.push(req.file.buffer);
    readableStream.push(null);
    
    const writeStream = gfs.createWriteStream({ filename: req.file.originalname });
    readableStream.pipe(writeStream);
    
    writeStream.on("close", (file) => {
        res.json({ message: "Video uploaded successfully", file });
    });
});

router.get("/stream/:id", async (req, res) => {
    try {
      const fileId = new mongoose.Types.ObjectId(req.params.id);
      const file = await gfs.files.findOne({ _id: fileId });
  
      if (!file) return res.status(404).json({ error: "File not found" });
  
      const readStream = gfs.createReadStream({ _id: file._id });
      res.set("Content-Type", file.contentType);
      readStream.pipe(res);
    } catch (error) {
      res.status(500).json({ error: "Failed to stream video" });
    }
  });
  

module.exports = router;
