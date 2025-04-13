const mongoose = require("mongoose");

// Subschema for course progress
const progressSchema = new mongoose.Schema({
  watched: [String],
}, { _id: false });

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["student", "teacher", "admin"], default: "student" },
  xp: { type: Number, default: 0 },  // ✅ XP system
  level: { type: Number, default: 1 },  // ✅ Level system

  // ✅ Course progress tracking
  courseProgress: {
    type: Map,
    of: progressSchema,
    default: {},
  },
}, { timestamps: true });

// ✅ Function to calculate level based on XP
userSchema.methods.calculateLevel = function () {
  this.level = Math.floor(this.xp / 100) + 1;
  return this.level;
};

const User = mongoose.model("User", userSchema);
module.exports = User;
