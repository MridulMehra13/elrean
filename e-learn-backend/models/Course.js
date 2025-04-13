const mongoose = require("mongoose");

const videoSchema = new mongoose.Schema({
  title: String,
  url: String,
  source: String,
  thumbnail: String,
});

const courseSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  videos: { type: [videoSchema], default: [] },
  enrolledStudents: [
    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: [] },
  ],
  progress: {
    type: Map,
    of: [String],
    default: {},
  },
});

module.exports = mongoose.model("Course", courseSchema);
