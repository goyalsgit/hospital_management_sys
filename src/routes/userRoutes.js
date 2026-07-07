const express = require("express");
const router = express.Router();

// Import middleware
const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");

// Import controller functions
const {
  getMyProfile,
  updateMyProfile,
  getAllUsers,
  deleteUser,
} = require("../controllers/userController");

// ─────────────────────────────────────────
//  PUBLIC ROUTES — no token needed
// ─────────────────────────────────────────
// (none for users)

// ─────────────────────────────────────────
//  PROTECTED ROUTES — must be logged in
// ─────────────────────────────────────────

// GET /api/users/profile → get my own profile
router.get("/profile", authenticateUser, getMyProfile);

// PATCH /api/users/profile → update my own profile
router.patch("/profile", authenticateUser, updateMyProfile);

// ─────────────────────────────────────────
//  ADMIN ONLY ROUTES
// ─────────────────────────────────────────

// GET /api/users → get all users (admin only)
router.get("/", authenticateUser, authorizeRoles("ADMIN"), getAllUsers);

// DELETE /api/users/:id → delete a user (admin only)
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteUser);

module.exports = router;
