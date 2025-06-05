const mongoose = require("mongoose");

const userCoursePreferenceSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  courseId: { type: mongoose.Schema.Types.ObjectId, ref: "Course", required: true },
  learningMode: { type: String, enum: ["video", "text"], required: true },
}, { timestamps: true });

userCoursePreferenceSchema.index({ userId: 1, courseId: 1 }, { unique: true });

module.exports = mongoose.model("UserCoursePreference", userCoursePreferenceSchema);
