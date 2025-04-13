// src/components/Sidebar.js
import { useSidebar } from "../context/SidebarContext";
import { useLocation, Link } from "react-router-dom";
import { useEffect } from "react";


const Sidebar = () => {
  const { isSidebarOpen, closeSidebar } = useSidebar();
  const location = useLocation();

  // Close sidebar on route change
  useEffect(() => {
    closeSidebar();
  }, [location, closeSidebar]);

  return (
    <div
      className={`fixed top-0 left-0 h-full w-64 bg-gray-800 text-white z-40 transform transition-transform duration-300 ease-in-out ${
        isSidebarOpen ? "translate-x-0" : "-translate-x-full"
      }`}
    >
      <div className="p-4 font-bold text-xl border-b border-gray-700">E-Learn</div>
      <nav className="p-4 space-y-4">
  <Link to="/dashboard" className="block hover:underline">Dashboard</Link>
  <Link to="/courses" className="block hover:underline">Courses</Link>
  <Link to="/leaderboard" className="block hover:underline">Leaderboard</Link>
</nav>
    </div>
  );
};

export default Sidebar;
