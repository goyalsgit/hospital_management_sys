const express = require("express");
const router = express.Router();

const { authenticateUser, authorizeRoles } = require("../middleware/authMiddleware");
const validate = require("../middleware/validate");
const {
  bookAppointmentSchema,
  updateStatusSchema,
} = require("../validators/appointmentValidator");
const {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
} = require("../controllers/appointmentController");

// All routes require login
router.use(authenticateUser);

// POST /api/appointments — validate then book
router.post("/", authorizeRoles("PATIENT"), validate(bookAppointmentSchema), bookAppointment);

// GET /api/appointments
router.get("/", getMyAppointments);

// GET /api/appointments/:id
router.get("/:id", getAppointmentById);

// PATCH /api/appointments/:id/status — validate then update
router.patch("/:id/status", authorizeRoles("DOCTOR", "ADMIN"), validate(updateStatusSchema), updateAppointmentStatus);

// DELETE /api/appointments/:id
router.delete("/:id", cancelAppointment);

module.exports = router;
