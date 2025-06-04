// src/components/Sidebar.js
import { useSidebar } from "../context/SidebarContext";
import { Link } from "react-router-dom";

const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 font-bold text-xl border-b border-gray-700">E-Learn</div>
      <nav className="p-4 space-y-4">
        <Link to="/dashboard" className="block hover:underline" onClick={closeSidebar}>Dashboard</Link>
        <Link to="/courses" className="block hover:underline" onClick={closeSidebar}>Courses</Link>
        <Link to="/quiz" className="block hover:underline" onClick={closeSidebar}>Quiz</Link>
        <Link to="/my-quiz-history" className="block hover:underline" onClick={closeSidebar}>My Quiz History</Link>
        <Link to="/smart-question-generator" className="block hover:underline" onClick={closeSidebar}>Smart Question Generator</Link>
        <Link to="/leaderboard" className="block hover:underline" onClick={closeSidebar}>Leaderboard</Link>
        <Link to="/chatbot-teacher" className="block hover:underline" onClick={closeSidebar}>AI Chatbot Teacher</Link>
        <Link to="/recommendations" className="block hover:underline" onClick={closeSidebar}>
          <span role="img" aria-label="target" className="mr-1">🎯</span>
          Recommended Courses
        </Link>
      </nav>
    </div>
  );
};

export default Sidebar;
