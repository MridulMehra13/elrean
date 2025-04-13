import { useContext, useEffect, useState } from "react";
import { ThemeContext } from "../context/ThemeContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";
import axios from "axios";

const Dashboard = () => {
  const { darkMode } = useContext(ThemeContext);
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [rank, setRank] = useState("N/A");

  // ✅ Fetch leaderboard and calculate rank
  useEffect(() => {
    const fetchRank = async () => {
      try {
        const res = await axios.get("http://localhost:5000/api/leaderboard");
        const leaderboard = res.data;
        const index = leaderboard.findIndex((u) => u._id === user?._id);
        if (index !== -1) {
          setRank(index + 1);
        }
      } catch (error) {
        console.error("Error fetching rank:", error);
      }
    };

    if (user?._id) {
      fetchRank();
    }
  }, [user]);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100 dark:bg-gray-900 p-6">
      <div className="w-full max-w-5xl p-6 rounded-2xl shadow-lg backdrop-blur-xl bg-white/30 dark:bg-gray-800/40 border border-white/10">
        <h1 className="text-3xl font-bold text-gray-800 dark:text-white text-center">
          Welcome, {user?.name || "Student"}! 🎉
        </h1>
        <p className="text-gray-600 dark:text-gray-300 text-center mt-2">
          Track your progress and manage your courses.
        </p>

        {/* Cards Section */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-8">
          <div className="p-6 rounded-xl shadow-md backdrop-blur-md bg-white/20 dark:bg-gray-700/30 border border-white/10">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Total Courses</h2>
            <p className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
              {user?.courses?.length || 0}
            </p>
          </div>
          <div className="p-6 rounded-xl shadow-md backdrop-blur-md bg-white/20 dark:bg-gray-700/30 border border-white/10">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">XP Earned</h2>
            <p className="text-2xl font-bold text-green-500 dark:text-green-400">
              {user?.xp || 0} XP
            </p>
          </div>
          <div className="p-6 rounded-xl shadow-md backdrop-blur-md bg-white/20 dark:bg-gray-700/30 border border-white/10">
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">Leaderboard Rank</h2>
            <p className="text-2xl font-bold text-yellow-500 dark:text-yellow-400">
              #{rank}
            </p>
          </div>
        </div>

        {/* CTA Button */}
        <div className="text-center mt-6">
          <button
            onClick={() => navigate("/courses")}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition"
          >
            View Courses 📚
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
