import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Adjusted to match backend's base URL
});

// Get all courses
export const fetchCourses = () => API.get("/course");

// Enroll in a course
export const enrollCourse = (courseId, userId) =>
  API.post("/course/enroll", { courseId, userId });

export default API;
