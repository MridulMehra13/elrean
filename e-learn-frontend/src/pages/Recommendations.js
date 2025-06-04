import React, { useEffect, useState } from "react";
import { fetchHybridRecommendations } from "../services/recommendationAPI";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";

const Recommendations = () => {
  const { user } = useAuth();
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?._id) {
      fetchHybridRecommendations(user._id)
        .then(setRecommendations)
        .finally(() => setLoading(false));
    }
  }, [user]);

  return (
    <div className="p-4">
      <h2 className="text-2xl font-semibold mb-4">🎯 Recommended Courses for You</h2>
      {loading ? (
        <p>Loading recommendations...</p>
      ) : recommendations.length === 0 ? (
        <p>No recommendations available right now.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {recommendations.map((course) => (
            <CourseCard
              key={course.CourseID || course._id}
              course={course}
              isRecommended={true}
              score={course.Score}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default Recommendations;
