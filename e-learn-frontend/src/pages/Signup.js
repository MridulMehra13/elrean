import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";

const Signup = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "student",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate(); // ✅ For redirection

  // Handle Input Change
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  // Handle Form Submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match!");
      return;
    }

    setError(""); // Clear error
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/auth/register", {
        name: formData.name,
        email: formData.email,
        password: formData.password,
        role: formData.role,
      });

      alert("Signup Successful! Please Login.");
      navigate("/login"); // ✅ Redirect to Login Page
    } catch (err) {
      setError(err.response?.data?.error || "Signup failed!");
    }

    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-900">
      <div className="bg-white dark:bg-gray-800 p-8 rounded-lg shadow-lg max-w-md w-full">
        <h2 className="text-2xl font-bold text-center text-gray-900 dark:text-white">
          Create an Account
        </h2>

        {error && <p className="text-red-500 text-sm text-center mt-2">{error}</p>}

        <form onSubmit={handleSubmit} className="mt-6">
          <div>
            <label className="block text-gray-700 dark:text-gray-300">Full Name</label>
            <input
              type="text"
              name="name"
              value={formData.name}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="John Doe"
            />
          </div>

          <div className="mt-4">
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

          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300">Confirm Password</label>
            <input
              type="password"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              required
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
              placeholder="********"
            />
          </div>

          <div className="mt-4">
            <label className="block text-gray-700 dark:text-gray-300">Role</label>
            <select
              name="role"
              value={formData.role}
              onChange={handleChange}
              className="w-full p-2 mt-2 border rounded-lg dark:bg-gray-700 dark:border-gray-600 dark:text-white"
            >
              <option value="student">Student</option>
              <option value="teacher">Teacher</option>
            </select>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-6 bg-indigo-600 text-white py-2 rounded-lg hover:bg-indigo-700 transition"
          >
            {loading ? "Signing Up..." : "Sign Up"}
          </button>

          <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 text-center">
            Already have an account?{" "}
            <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold">
              Login here
            </Link>
          </p>
        </form>
      </div>
    </div>
  );
};

export default Signup;
