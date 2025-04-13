const mongoose = require("mongoose");
const Course = require("../models/Course");
require("dotenv").config();

// Helper to extract video ID from URL
const getYouTubeId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

const seedCourses = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const courses = [
    {
      title: "React Basics",
      description: "Learn the fundamentals of React including components, state, and props.",
      videos: [
        "https://www.youtube.com/watch?v=SqcY0GlETPk",
        "https://www.youtube.com/watch?v=bMknfKXIFA8",
        "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
      ].map((url, index) => {
        const videoId = getYouTubeId(url);
        return {
          title: `React Video ${index + 1}`,
          url,
          source: "youtube",
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: "10:00" // Add duration for better clarity
        };
      })
    },
    {
      title: "JavaScript Essentials",
      description: "Master JavaScript fundamentals to become a front-end wizard.",
      videos: [
        "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "https://www.youtube.com/watch?v=hdI2bqOjy3c"
      ].map((url, index) => {
        const videoId = getYouTubeId(url);
        return {
          title: `JavaScript Video ${index + 1}`,
          url,
          source: "youtube",
          thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
          duration: "15:00" // Add duration for better clarity
        };
      })
    }
  ];

  await Course.deleteMany(); // Optional: clear old data
  await Course.insertMany(courses);
  console.log("✅ Courses seeded");
  mongoose.disconnect();
};

seedCourses();
