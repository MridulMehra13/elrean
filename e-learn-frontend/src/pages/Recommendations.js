// D:\full stack dev\react\elrean\e-learn-backend\ml-service\src\views\Recommendations.js (or similar path)

import React, { useEffect, useState } from "react";
import { fetchHybridRecommendations } from "../services/recommendationAPI";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const getRecommendations = async () => {
      if (!user || !user._id) {
        console.warn("User data or ID not available, skipping recommendation fetch.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

        const data = await fetchHybridRecommendations(user);
        // The console.log below is still useful for debugging, but will show 'undefined' as expected for data.recommendations
        console.log("Frontend received raw data:", data); 
        console.log("Frontend attempting to set recommendations (before fix):", data.recommendations); 

        // ⭐ THE FINAL FIX IS HERE: Set recommendations directly with 'data' ⭐
        setRecommendations(data); // 'data' is now the array of courses
        // No need for 'data.recommendations || []' anymore as data itself is the array

      } catch (err) {
        setError("Failed to load recommendations.");
        console.error("Error in Recommendations component:", err);
      } finally {
        setLoading(false);
      }
    };

    getRecommendations();
  }, [user]);

  if (loading) {
    return <div className="p-4"><p>Loading recommendations...</p></div>;
  }

  if (error) {
    return <div className="p-4"><p className="text-red-500">Error: {error}</p></div>;
  }

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">🎯 Recommended Courses for You</h2>
      {recommendations.length === 0 ? (
        <p>No recommendations available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((course) => (
            // Ensure course._id exists if CourseID isn't always present
            <div key={course._id || course.CourseID}> 
              <CourseCard
                course={course}
                isRecommended={true}
                score={course.Score}
              />
              <p className="mt-1 text-sm text-gray-600">
                Recommended Learning Mode: <strong>{course.RecommendedLearningMode || "N/A"}</strong>
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;