const jwt = require("jsonwebtoken");
const User = require("../models/User");

// ==========================================
//         AUTHENTICATE USER
// ==========================================
// This middleware runs before any protected route
// It checks if the user has a valid JWT token

const authenticateUser = async (req, res, next) => {
  try {
    // Step 1: Get token from request headers
    // Token is sent like: Authorization: Bearer eyJhbGci...
    const authHeader = req.headers.authorization;

    // Step 2: Check if Authorization header exists and starts with "Bearer "
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({
        message: "No token provided. Please login first.",
      });
    }

    // Step 3: Extract just the token part
    // "Bearer eyJhbGci..." → split by space → ["Bearer", "eyJhbGci..."]
    // [1] gets the second part = the actual token
    const token = authHeader.split(" ")[1];

    // Step 4: Verify the token using our secret key
    // jwt.verify() throws an error if token is invalid or expired
    // If valid, it returns the payload we stored: { id, role }
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    // decoded = { id: "64abc123", role: "PATIENT", iat: ..., exp: ... }

    // Step 5: Find the user in database using the id from the token
    // We use .select("-password") to exclude the password from the result
    // The "-" means exclude this field
    const user = await User.findById(decoded.id).select("-password");

    if (!user) {
      return res.status(401).json({
        message: "User no longer exists",
      });
    }

    // Step 6: Attach user to req object
    // Now any route that runs after this middleware can access req.user
    req.user = user;

    // Step 7: Call next() to continue to the actual route handler
    next();

  } catch (error) {
    // jwt.verify() throws these specific errors:
    if (error.name === "JsonWebTokenError") {
      return res.status(401).json({ message: "Invalid token" });
    }
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired. Please login again." });
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         AUTHORIZE BY ROLE
// ==========================================
// This middleware checks if the user has the right role
// Used AFTER authenticateUser

// This is a function that RETURNS a middleware
// We do this so we can pass roles dynamically
// authorizeRoles("ADMIN") → returns a middleware function
// authorizeRoles("ADMIN", "DOCTOR") → both roles allowed

const authorizeRoles = (...roles) => {
  // ...roles = rest parameter — collects all arguments into an array
  // authorizeRoles("ADMIN", "DOCTOR") → roles = ["ADMIN", "DOCTOR"]

  return (req, res, next) => {
    // req.user is set by authenticateUser middleware above
    // Check if user's role is in the allowed roles array
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        message: `Access denied. Required role: ${roles.join(" or ")}`,
      });
    }
    next();
  };
};

module.exports = { authenticateUser, authorizeRoles };
