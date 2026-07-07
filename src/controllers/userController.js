const User = require("../models/User");

// ==========================================
//         GET MY PROFILE
// ==========================================
// GET /api/users/profile
// Protected — any logged in user

const getMyProfile = async (req, res) => {
  try {
    // req.user was attached by authenticateUser middleware
    // It already has the user object — no need to query DB again
    res.status(200).json({
      user: req.user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         UPDATE MY PROFILE
// ==========================================
// PATCH /api/users/profile
// Protected — any logged in user

const updateMyProfile = async (req, res) => {
  try {
    // Only allow these fields to be updated
    // User should NOT be able to change their own role or password here
    const { name, phone } = req.body;

    // Build update object dynamically
    // Only add fields that were actually sent
    const updates = {};
    if (name)  updates.name  = name;
    if (phone) updates.phone = phone;

    // findByIdAndUpdate(id, updates, options)
    // { new: true }     → return the UPDATED document, not the old one
    // { runValidators: true } → run schema validations on update
    const updatedUser = await User.findByIdAndUpdate(
      req.user._id,    // which user to update (from token)
      updates,         // what to update
      { new: true, runValidators: true }
    ).select("-password");  // exclude password from response

    res.status(200).json({
      message: "Profile updated",
      user: updatedUser,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET ALL USERS (ADMIN ONLY)
// ==========================================
// GET /api/users
// Protected — ADMIN only

const getAllUsers = async (req, res) => {
  try {
    // User.find({}) → get ALL documents in users collection
    // .select("-password") → exclude password field
    // .sort({ createdAt: -1 }) → newest first (-1 = descending)
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 });

    res.status(200).json({
      total: users.length,
      users,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         DELETE USER (ADMIN ONLY)
// ==========================================
// DELETE /api/users/:id
// Protected — ADMIN only

const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Prevent admin from deleting themselves
    if (req.user._id.toString() === id) {
      return res.status(400).json({
        message: "You cannot delete your own account",
      });
    }

    const user = await User.findByIdAndDelete(id);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json({ message: "User deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getMyProfile, updateMyProfile, getAllUsers, deleteUser };
