// src/services/axios.js
import axios from "axios";

const API = axios.create({
  baseURL: "http://localhost:5000/api", // Ensure this matches the backend's base URL
});

export default API;
