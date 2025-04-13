
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000", // adjust if using a different backend port
});

// Get all courses
export const fetchCourses = () => API.get("/courses");

// Enroll in a course
export const enrollCourse = (courseId, userId) =>
  API.post("/courses/enroll", { courseId, userId });

export default API;
