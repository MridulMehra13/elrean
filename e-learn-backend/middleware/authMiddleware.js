const jwt = require("jsonwebtoken");
const User = require("../models/User"); // Add this line

const verifyToken = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ error: "Access Denied: No token provided" });
  }

  const token = authHeader.split(" ")[1];

  try {
    console.log("Received token:", token); // Log the token for debugging
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Decoded JWT:", decoded); // Log decoded token

    // 🛠️ Fetch the user from DB to get role
    const user = await User.findById(decoded.id).select("-password");
    console.log("Fetched user:", user); // Log user info

    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    req.user = user; // Attach full user object
    next();
  } catch (err) {
    console.error("JWT verification error:", err); // Log error
    return res.status(403).json({ error: "Access Denied: Invalid token" });
  }
};

module.exports = verifyToken;
