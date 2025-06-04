import { useEffect, useState } from "react";
import axios from "../services/axios";

const Leaderboard = () => {
  const [leaders, setLeaders] = useState([]);

  useEffect(() => {
    const fetchLeaderboard = async () => {
      try {
        const res = await axios.get("/leaderboard");
        setLeaders(res.data);
      } catch (err) {
        console.error("Error fetching leaderboard:", err);
      }
    };

    fetchLeaderboard();

    // Poll leaderboard every 30 seconds for real-time updates
    const intervalId = setInterval(fetchLeaderboard, 30000);

    return () => clearInterval(intervalId);
  }, []);

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-gray-900 dark:text-white">🏆 Leaderboard</h2>
      <ul>
        {leaders.map((user, index) => (
          <li key={user._id} className="border-b border-gray-200 py-2 dark:border-gray-700">
            <span className="font-semibold">{index + 1}. {user.name}</span> - 
            <span className="ml-2 text-indigo-600">{user.xp} XP</span> - 
            <span className="ml-2 text-gray-600 dark:text-gray-300">Level {user.level}</span>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default Leaderboard;
