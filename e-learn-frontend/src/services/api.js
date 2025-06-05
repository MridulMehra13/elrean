// frontend/src/services/api.js (or wherever this file is located)

import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Adjusted to match backend's base URL
  withCredentials: true, // Keep this if you're using httpOnly cookies, otherwise optional for JWT in headers
});

// ⭐⭐⭐ ADD THIS REQUEST INTERCEPTOR ⭐⭐⭐
API.interceptors.request.use(
  (config) => {
    // 1. Get the token from where you've stored it (e.g., localStorage)
    const token = localStorage.getItem('token'); // Assuming you store your JWT here

    // 2. If a token exists, add it to the Authorization header
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      // console.log("Token attached to request:", token.substring(0, 10) + "..."); // Optional: for debugging
    } else {
      // console.warn("No token found in localStorage for outgoing request."); // Optional: for debugging
    }
    return config;
  },
  (error) => {
    // Handle request errors (e.g., network issues)
    return Promise.reject(error);
  }
);

// Get all courses
export const fetchCourses = () => API.get("/course");

// Enroll in a course
export const enrollCourse = (courseId, userId) =>
  API.post("/course/enroll", { courseId, userId });

export default API;