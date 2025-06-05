import API from "./api";

export const fetchHybridRecommendations = async (user, topN = 5, alpha = 0.6) => {
  try {
    if (!user || !user._id) {
      console.error("Error fetching recommendations: User data or User ID is missing.");
      return [];
    }

    const userDataForML = {
      user_id: user._id,
      enrolledCourses: user.enrolledCourses || [],
      progress: user.progress || [],
      learningStyle: user.learningStyle || 'unknown',
    };

    const requestBody = {
      user_data: userDataForML,
      top_n: topN,
      alpha: alpha,
    };

    // Ensure your API instance's baseURL is configured to point to your Node.js backend's API base URL (e.g., http://localhost:5000/api)
    const res = await API.post("/recommendations", requestBody);
    
    // ⭐ THE FIX IS HERE: Return res.data directly, as it is already the array of courses ⭐
    return res.data || []; 
    
  } catch (error) {
    console.error("Error fetching hybrid recommendations:", error.response ? error.response.data : error.message);
    return [];
  }
};