const express = require("express");
const router = express.Router();

const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
} = require("../controllers/doctorController");

// ─────────────────────────────────────
//  PUBLIC ROUTES — no token needed
// ─────────────────────────────────────

// GET /api/doctors
router.get("/", getAllDoctors);

// GET /api/doctors/:id
router.get("/:id", getDoctorById);

// ─────────────────────────────────────
//  ADMIN ONLY ROUTES
// ─────────────────────────────────────

// POST /api/doctors
router.post("/", authenticateUser, authorizeRoles("ADMIN"), createDoctor);

// PATCH /api/doctors/:id
router.patch("/:id", authenticateUser, authorizeRoles("ADMIN"), updateDoctor);

// DELETE /api/doctors/:id
router.delete("/:id", authenticateUser, authorizeRoles("ADMIN"), deleteDoctor);

module.exports = router;
