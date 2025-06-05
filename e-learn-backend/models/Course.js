const mongoose = require('mongoose');

const textResourceSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    summary: { type: String } // Added summary field for text resources
});

const videoSchema = new mongoose.Schema({
    title: { type: String, required: true },
    url: { type: String, required: true },
    source: { type: String, default: 'youtube' },
    thumbnail: { type: String }
});

const CourseSchema = new mongoose.Schema({
    title: {
        type: String,
        required: [true, 'Please add a title for the course'],
        unique: true,
        trim: true,
        maxlength: [100, 'Title cannot be more than 100 characters']
    },
    description: {
        type: String,
        required: [true, 'Please add a description for the course'],
        maxlength: [500, 'Description cannot be more than 500 characters']
    },
    // --- NEW FIELDS FOR RECOMMENDATION ---
    subject: { // e.g., 'JavaScript', 'React', 'CSS', 'Data Science'
        type: String,
        required: [true, 'Please specify a subject for the course']
    },
    format: { // e.g., 'Video Course', 'Text-based Course', 'Quiz Series', 'Live Session'
        type: String,
        enum: ['Video Course', 'Text-based Course', 'Quiz Series', 'Live Session', 'Mixed'],
        default: 'Mixed',
        required: [true, 'Please specify the format of the course']
    },
    difficulty: { // e.g., 'Beginner', 'Intermediate', 'Advanced'
        type: String,
        enum: ['Beginner', 'Intermediate', 'Advanced'],
        default: 'Beginner',
        required: [true, 'Please specify the difficulty of the course']
    },
    // --- END NEW FIELDS ---
    videos: [videoSchema],
    enrolledStudents: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'User' // Assuming you have a User model
        }
    ],
    // This 'progress' field likely holds per-student progress.
    // For collaborative filtering, we'll need a separate collection for ratings or completion.
    progress: { // This structure depends on your specific progress tracking
        type: Map,
        of: Object // e.g., { 'userId': { 'completedVideos': [], 'quizScores': [] }}
    },
    textResources: [textResourceSchema], // Updated to use the new schema
    __v: { type: Number, select: false } // Hide __v field
}, {
    timestamps: true // Adds createdAt and updatedAt automatically
});

module.exports = mongoose.model('Course', CourseSchema);
