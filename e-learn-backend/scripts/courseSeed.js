const mongoose = require("mongoose");
const Course = require("../models/Course");
require("dotenv").config({ path: __dirname + '/../.env' });


const getYouTubeId = (url) => {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|v\/|shorts\/))([\w-]{11})/);
  return match ? match[1] : null;
};

const sampleVideos = (titlePrefix, urls) => {
  return urls.map((url, index) => {
    const videoId = getYouTubeId(url);
    return {
      title: `${titlePrefix} Video ${index + 1}`,
      url,
      source: "youtube",
      thumbnail: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`,
    };
  });
};



const seedCourses = async () => {
  await mongoose.connect(process.env.MONGO_URI);

  const courses = [
    {
      title: "React Basics",
      description: "Learn the fundamentals of React including components, state, and props.",
      subject: "React",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("React", [
        "https://www.youtube.com/watch?v=SqcY0GlETPk",
        "https://www.youtube.com/watch?v=bMknfKXIFA8",
        "https://www.youtube.com/watch?v=w7ejDZ8SWv8"
      ])
    },
    {
      title: "JavaScript Essentials",
      description: "Master JavaScript fundamentals to become a front-end wizard.",
      subject: "JavaScript",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("JavaScript", [
        "https://www.youtube.com/watch?v=PkZNo7MFNFg",
        "https://www.youtube.com/watch?v=W6NZfCO5SIk",
        "https://www.youtube.com/watch?v=hdI2bqOjy3c"
      ]),
      
    },
    {
      title: "CSS Mastery",
      description: "Deep dive into CSS Flexbox, Grid, and animations.",
      subject: "CSS",
      format: "Video Course",
      difficulty: "Intermediate",
      videos: sampleVideos("CSS", [
        "https://www.youtube.com/watch?v=1Rs2ND1ryYc",
        "https://www.youtube.com/watch?v=phWxA89Dy94",
        "https://www.youtube.com/watch?v=0afZj1G0BIE"
      ])
    },
    {
      title: "Python Programming",
      description: "Start programming with Python - basics to OOP.",
      subject: "Python",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("Python", [
        "https://www.youtube.com/watch?v=_uQrJ0TkZlc",
        "https://www.youtube.com/watch?v=rfscVS0vtbw",
        "https://www.youtube.com/watch?v=WGJJIrtnfpk"
      ])
    },
    {
      title: "Node.js Crash Course",
      description: "Build fast and scalable backend applications using Node.js.",
      subject: "Node.js",
      format: "Video Course",
      difficulty: "Intermediate",
      videos: sampleVideos("Node", [
        "https://www.youtube.com/watch?v=fBNz5xF-Kx4",
        "https://www.youtube.com/watch?v=Oe421EPjeBE",
        "https://www.youtube.com/watch?v=BLl32FvcdVM"
      ])
    },
    {
      title: "MongoDB Essentials",
      description: "Learn NoSQL database concepts with MongoDB.",
      subject: "MongoDB",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("MongoDB", [
        "https://www.youtube.com/watch?v=ofme2o29ngU",
        "https://www.youtube.com/watch?v=-56x56UppqQ",
        "https://www.youtube.com/watch?v=pWbMrx5rVBE"
      ])
    },
    {
      title: "Data Structures in JS",
      description: "Understand core data structures and algorithms using JavaScript.",
      subject: "JavaScript",
      format: "Video Course",
      difficulty: "Intermediate",
      videos: sampleVideos("DS in JS", [
        "https://www.youtube.com/watch?v=RBSGKlAvoiM",
        "https://www.youtube.com/watch?v=t2CEgPsws3U",
        "https://www.youtube.com/watch?v=bbG2TUswKdo"
      ])
    },
    {
      title: "Full-Stack Web Dev",
      description: "Complete full-stack course covering MERN stack.",
      subject: "Full Stack",
      format: "Video Course",
      difficulty: "Advanced",
      videos: sampleVideos("Full Stack", [
        "https://www.youtube.com/watch?v=4Z9KEBexzcM",
        "https://www.youtube.com/watch?v=7CqJlxBYj-M",
        "https://www.youtube.com/watch?v=9boMnm5X9ak"
      ])
    },
    {
      title: "Git & GitHub for Teams",
      description: "Master version control and team collaboration using Git and GitHub.",
      subject: "DevOps",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("Git", [
        "https://www.youtube.com/watch?v=RGOj5yH7evk",
        "https://www.youtube.com/watch?v=3fUbBnN_H2c",
        "https://www.youtube.com/watch?v=apGV9Kg7ics"
      ])
    },
    {
      title: "AI for Beginners",
      description: "A practical introduction to Artificial Intelligence and its applications.",
      subject: "AI",
      format: "Video Course",
      difficulty: "Beginner",
      videos: sampleVideos("AI", [
        "https://www.youtube.com/watch?v=JMUxmLyrhSk",
        "https://www.youtube.com/watch?v=aircAruvnKk",
        "https://www.youtube.com/watch?v=2ePf9rue1Ao"
      ]),
      textResources: [
    {
      title: "ML Introduction",
      url: "/assets/NOTES_ML_ASSIGNMENT/U1/ML_Intro.pdf", // Example path
      summary: "Quick reference guide for MongoDB commands."
    }
  ]

    }
  ];

  await Course.deleteMany(); // Optional reset
  await Course.insertMany(courses);
  console.log("✅ 10 Courses successfully seeded to MongoDB");
  mongoose.disconnect();
};

seedCourses();
