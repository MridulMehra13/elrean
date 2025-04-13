import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import { useAuth } from "../context/AuthContext";

const CourseDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [watched, setWatched] = useState([]);

  useEffect(() => {
    const fetchCourse = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get(`/api/course/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCourse(res.data);
        setEnrolled(res.data.isEnrolled);
        setWatched(res.data.userProgress || []);
      } catch (err) {
        console.error("Error fetching course details:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchCourse();
  }, [id, user]);

  const handleEnroll = async () => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/course/${id}/enroll`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setEnrolled(true);

      // Fetch the updated course data after enrollment
      const res = await axios.get(`/api/course/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCourse(res.data);
    } catch (err) {
      console.error("Enrollment failed", err);
    }
  };

  const handleVideoClick = async (video) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`/api/progress/${id}/video`, {
        videoTitle: video.title,
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!watched.includes(video.title)) {
        setWatched((prev) => [...prev, video.title]);
      }
    } catch (err) {
      console.error("Error tracking progress:", err);
    }
  };

  if (loading) return <p className="text-white">Loading...</p>;
  if (!course) return <p className="text-white">Course not found</p>;

  const progressPercent = Math.floor((watched.length / course.videos.length) * 100);

  return (
    <div className="text-white max-w-5xl mx-auto p-4">
      <h2 className="text-3xl font-bold mb-2">{course.title}</h2>
      <p className="mb-2 text-gray-300">{course.description}</p>

      {!enrolled ? (
        <button
          onClick={handleEnroll}
          className="bg-blue-600 px-4 py-2 rounded text-white mb-4"
        >
          Enroll Now
        </button>
      ) : (
        <div className="mb-4">
          <p className="text-green-400">✅ You are enrolled</p>
          <div className="w-full bg-gray-700 h-2 rounded mt-2">
            <div
              className="h-2 rounded bg-green-500"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <p className="text-xs text-gray-400 mt-1">{progressPercent}% completed</p>
        </div>
      )}

      <div className="mt-6">
        <h3 className="text-xl font-semibold mb-4">Course Videos</h3>
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {course.videos.map((video, index) => (
            <div key={index} className="bg-gray-800 p-3 rounded shadow">
              <img
                src={video.thumbnail || `https://img.youtube.com/vi/${video.url.split("v=")[1]?.split("&")[0]}/0.jpg`}
                alt={video.title}
                className="w-full h-40 object-cover rounded mb-2"
              />
              <h4 className="text-sm font-medium mb-1 text-white">{video.title}</h4>
              <a
                href={video.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => handleVideoClick(video)}
                className="inline-block text-blue-400 hover:underline text-sm"
              >
                ▶️ Watch Now
              </a>
              {watched.includes(video.title) && (
                <span className="ml-2 text-green-400 text-xs">✓ Watched</span>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;
