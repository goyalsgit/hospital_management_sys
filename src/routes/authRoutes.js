const express = require("express");
const router = express.Router();

const { register, registerDoctor, login } = require("../controllers/authController");
const validate = require("../middleware/validate");
const {
  registerSchema,
  loginSchema,
  registerDoctorSchema,
} = require("../validators/authValidator");

// POST /api/auth/register — validate then run controller
router.post("/register", validate(registerSchema), register);

// POST /api/auth/register-doctor — validate then run controller
router.post("/register-doctor", validate(registerDoctorSchema), registerDoctor);

// POST /api/auth/login — validate then run controller
router.post("/login", validate(loginSchema), login);

module.exports = router;
