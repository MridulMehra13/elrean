// src/components/Navbar.js
import { useContext } from "react";
import { useSidebar } from "../context/SidebarContext";
import { AuthContext } from "../context/AuthContext";
import { useNavigate } from "react-router-dom";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const { toggleSidebar } = useSidebar();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-gray-800 p-4 text-white flex justify-between items-center">
      <div className="flex items-center gap-4">
        <button onClick={toggleSidebar} className="text-white focus:outline-none">
          ☰
        </button>
        <h1 className="text-xl">E-Learn</h1>
      </div>
      {user && (
        <button onClick={handleLogout} className="bg-red-500 px-4 py-2 rounded">
          Logout
        </button>
      )}
    </nav>
  );
};

export default Navbar;
