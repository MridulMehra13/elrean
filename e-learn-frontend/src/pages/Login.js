import { useState, useContext } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { AuthContext } from "../context/AuthContext";


const Login = () => {
  const { login } = useContext(AuthContext); // ✅ Use Auth Context
  const [formData, setFormData] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
  
    try {
      const res = await axios.post("http://localhost:5000/api/auth/login", formData);
      localStorage.setItem("token", res.data.token);
      login(res.data.user, res.data.token); // ✅ use login method from context
      navigate("/dashboard");
    } catch (err) {
      setError(err.response?.data?.error || "Login failed!");
    }
  
    setLoading(false);
  };
  

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Login to Your Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="example@email.com"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="********"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Logging in..." : "Login"}
          </button>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            Don't have an account?{" "}
            <Link to="/signup" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Sign Up
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Login;
