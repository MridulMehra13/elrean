import { useEffect, useState } from "react";
import axios from "axios";
import CourseCard from "../components/CourseCard";
import { useAuth } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Courses = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolledIds, setEnrolledIds] = useState([]);
  const [progressMap, setProgressMap] = useState({});
  const [error, setError] = useState(null);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleEnroll = async (courseId) => {
    try {
      const token = localStorage.getItem("token");
  
      const res = await axios.post(
        `http://localhost:5000/api/course/${courseId}/enroll`,
        {},
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
  
      console.log("Enroll response:", res.data);
      setEnrolledIds([...enrolledIds, courseId]);
    } catch (err) {
      console.error("Enroll failed:", err.response?.data || err.message);
      alert("Enrollment failed.");
    }
  };
  

  const handleNavigate = (id) => {
    navigate(`/course/${id}`, { state: { enrolled: enrolledIds.includes(id) } });
  };

  useEffect(() => {
    const fetchCourses = async () => {
      try {
        const token = localStorage.getItem("token");
  
        const res = await axios.get("http://localhost:5000/api/course", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!res.data || !Array.isArray(res.data)) {
          throw new Error("Invalid response format");
        }
  
        setCourses(res.data);
  
        const enrolled = res.data.filter(course =>
          course.enrolledStudents?.some(student => student._id === user._id)
        );
        setEnrolledIds(enrolled.map(c => c._id));
  
        const progressObj = {};
        enrolled.forEach(course => {
          const watched = course.progress?.[user._id] || [];
          progressObj[course._id] = Math.floor((watched.length / course.videos.length) * 100);
        });
        setProgressMap(progressObj);
      } catch (err) {
        console.error("Error fetching courses:", err);
        setError("Failed to load courses.");
      } finally {
        setLoading(false);
      }
    };
  
    if (user?._id) {
      fetchCourses();
    }
  }, [user?._id]);
  

  const getThumbnail = (course) => {
    const video = course.videos?.[0];
    if (!video) return "https://via.placeholder.com/300x180.png?text=No+Video";

    if (video.source === "youtube" && video.url.includes("youtube")) {
      const videoId = video.url.split("v=")[1]?.split("&")[0];
      return `https://img.youtube.com/vi/${videoId}/0.jpg`;
    }

    return "https://via.placeholder.com/300x180.png?text=Uploaded+Video";
  };

  return (
    <div>
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">Courses</h2>

      {loading ? (
        <p className="text-gray-700 dark:text-gray-300">Loading...</p>
      ) : error ? (
        <p className="text-red-500">{error}</p>
      ) : courses.length === 0 ? (
        <p className="text-gray-700 dark:text-gray-300">No courses found.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            const isEnrolled = enrolledIds.includes(course._id);
            const progress = progressMap[course._id] || 0;
            const thumbnail = getThumbnail(course);

            return (
              <div
                key={course._id}
                className="relative cursor-pointer bg-white dark:bg-gray-800 shadow rounded-lg overflow-hidden"
                onClick={() => handleNavigate(course._id)}
              >
                <img src={thumbnail} alt="Thumbnail" className="w-full h-40 object-cover" />

                <div className="p-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{course.title}</h3>
                  <p className="text-sm text-gray-600 dark:text-gray-300 mb-2">
                    {course.description?.substring(0, 100)}...
                  </p>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                    Instructor: {course.teacher?.name || "Unknown"} • {course.videos.length} Videos
                  </p>

                  {isEnrolled ? (
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-2">
                      <div
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  ) : user?.role === "student" ? (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEnroll(course._id);
                      }}
                      className="mt-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1 rounded text-sm"
                    >
                      Enroll
                    </button>
                  ) : null}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Courses;
