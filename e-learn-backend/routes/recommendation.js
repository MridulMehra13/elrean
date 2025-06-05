const express = require('express');
const router = express.Router();
const axios = require('axios');
const authMiddleware = require('../middleware/authMiddleware');
const User = require('../models/User');
const Course = require('../models/Course');

require('dotenv').config({ path: '../.env' });
const ML_SERVICE_URL = process.env.ML_SERVICE_URL || 'http://localhost:5001';

router.post('/', authMiddleware, async (req, res) => {
    const userId = req.user.id;
    const topN = req.body.topN || 5;
    const alpha = req.body.alpha || 0.6;

    if (!userId) {
        return res.status(400).json({ message: 'User ID is required' });
    }

    try {
        const user = await User.findById(userId)
            .populate('courseProgress')
            .lean();

        if (!user) {
            return res.status(404).json({ message: 'User not found.' });
        }

        const userDataForML = {
            user_id: user._id.toString(),
            current_courses_enrolled: user.courseProgress ? Object.keys(user.courseProgress) : [],
            completed_content: user.courseProgress ? Object.entries(user.courseProgress).map(([courseId, progress]) => ({
                course_id: courseId,
                watched: progress.watched || []
            })) : [],
            learning_style: user.learningStyle || 'unknown',
        };

        console.log(`Node.js: Sending user data to ML Service:`, userDataForML);
        const mlResponse = await axios.post(`${ML_SERVICE_URL}/recommendations`, {
            user_data: userDataForML,
            top_n: topN,
            alpha: alpha
        });

        // ⭐ NEW LOGS ADDED BELOW THIS LINE ⭐

        console.log("Node.js: Raw ML Service Response Data (mlResponse.data):", JSON.stringify(mlResponse.data, null, 2));

        // Ensure mlResponse.data.recommendations exists and is an array
        if (!mlResponse.data || !Array.isArray(mlResponse.data.recommendations)) {
            console.error("Node.js: ML service response does not contain a 'recommendations' array.");
            return res.status(500).json({ message: "Invalid response format from ML service." });
        }

        const recommendedCourseIds = mlResponse.data.recommendations.map(rec => rec.CourseID || rec.course_id || rec._id); // Added rec._id fallback
        
        console.log("Node.js: Extracted recommended Course IDs:", recommendedCourseIds);

        // Filter out any null/undefined/empty IDs if the ML service provides them
        const validRecommendedCourseIds = recommendedCourseIds.filter(id => id && id.length > 0);
        console.log("Node.js: Valid Recommended Course IDs after filter:", validRecommendedCourseIds);


        const fullRecommendedCourses = await Course.find({
            _id: { $in: validRecommendedCourseIds }
        });

        console.log(`Node.js: Found ${fullRecommendedCourses.length} full courses in DB:`, fullRecommendedCourses);

        const finalRecommendations = fullRecommendedCourses.map(course => {
            const mlInfo = mlResponse.data.recommendations.find(rec =>
                (rec.CourseID && rec.CourseID.toString() === course._id.toString()) ||
                (rec.course_id && rec.course_id.toString() === course._id.toString()) ||
                (rec._id && rec._id.toString() === course._id.toString()) // Added _id fallback for ML response
            );
            return {
                ...course.toObject(),
                Score: mlInfo ? mlInfo.Score : null,
                RecommendedLearningMode: mlInfo ? mlInfo.RecommendedLearningMode : null,
            };
        });

        console.log(`Node.js: Final recommendations prepared for frontend (count: ${finalRecommendations.length}):`, JSON.stringify(finalRecommendations, null, 2));
        
        res.json(finalRecommendations);

    } catch (error) {
        console.error(`Node.js: Error processing recommendations for user ${userId}:`);
        if (error.response) {
            console.error('Node.js: ML Service responded with Error Data:', error.response.data);
            console.error('Node.js: ML Service responded with Status:', error.response.status);
            res.status(error.response.status).json({
                message: error.response.data.message || 'Error from ML service',
                mlServiceError: error.response.data
            });
        } else if (error.request) {
            console.error('Node.js: No response received from ML service:', error.request);
            res.status(503).json({ message: 'ML service is unreachable or did not respond.' });
        } else {
            console.error('Node.js: Error in Axios request setup or other processing:', error.message);
            res.status(500).json({ message: 'Failed to retrieve recommendations due to request error.' });
        }
    }
});

module.exports = router;