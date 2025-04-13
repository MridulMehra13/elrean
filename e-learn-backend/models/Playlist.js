const mongoose = require("mongoose");

const PlaylistSchema = new mongoose.Schema({
    title: { type: String, required: true },
    youtubeLink: { type: String }, // For YouTube Playlists
    videoFileId: { type: mongoose.Schema.Types.ObjectId, ref: "uploads" }, // For uploaded videos
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Playlist", PlaylistSchema);
