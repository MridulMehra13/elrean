const mongoose = require("mongoose");

const discussionSchema = new mongoose.Schema({
    title: { type: String, required: true },
    content: { type: String, required: true },
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    courseId: { type: Number, required: true },
    comments: [
        {
            user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
            text: String,
            timestamp: { type: Date, default: Date.now }
        }
    ],
    upvotes: { type: Number, default: 0 },
    downvotes: { type: Number, default: 0 }
}, { timestamps: true });

const Discussion = mongoose.model("Discussion", discussionSchema);
module.exports = Discussion; // ✅ Ensure this is correctly exported
