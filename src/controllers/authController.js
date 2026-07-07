const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const User = require("../models/User");
const Doctor = require("../models/Doctor");

// ==========================================
//           REGISTER CONTROLLER
// ==========================================
// For PATIENT registration only
// Doctor registration has its own route below

const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({
        message: "Name, email and password are required",
      });
    }

    // Prevent someone from self-registering as ADMIN
    if (role === "ADMIN") {
      return res.status(403).json({
        message: "Cannot self-register as ADMIN",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({
        message: "Email already registered",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      role: "PATIENT", // always PATIENT from this route
    });

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Registration successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//        DOCTOR REGISTER CONTROLLER
// ==========================================
// Doctor registers with account + professional profile in one step
// POST /api/auth/register-doctor

const registerDoctor = async (req, res) => {
  try {
    const {
      // Account details
      name,
      email,
      password,
      phone,
      // Doctor profile details
      specialization,
      experience,
      fees,
      availableSlots,
      bio,
    } = req.body;

    // Validate all required fields
    if (!name || !email || !password || !specialization || !experience || !fees) {
      return res.status(400).json({
        message: "name, email, password, specialization, experience and fees are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    // Check email not already used
    const existingUser = await User.findOne({ email: cleanEmail });
    if (existingUser) {
      return res.status(409).json({ message: "Email already registered" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Step 1: Create the User account with role DOCTOR
    const user = await User.create({
      name,
      email: cleanEmail,
      password: hashedPassword,
      phone,
      role: "DOCTOR",
    });

    // Step 2: Create the Doctor profile linked to this user
    const doctor = await Doctor.create({
      userId: user._id,
      name,
      specialization,
      experience: Number(experience),
      fees: Number(fees),
      phone,
      availableSlots: availableSlots || ["09:00", "10:00", "11:00", "14:00", "15:00"],
      bio: bio || "",
      isAvailable: true,
    });

    // Step 3: Create JWT token
    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(201).json({
      message: "Doctor registered successfully",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      doctor: {
        id: doctor._id,
        name: doctor.name,
        specialization: doctor.specialization,
        experience: doctor.experience,
        fees: doctor.fees,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//           LOGIN CONTROLLER
// ==========================================

const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        message: "Email and password are required",
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const user = await User.findOne({ email: cleanEmail });

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const isPasswordCorrect = await bcrypt.compare(password, user.password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const token = jwt.sign(
      { id: user._id, role: user.role },
      process.env.JWT_SECRET,
      { expiresIn: "7d" }
    );

    res.status(200).json({
      message: "Login successful",
      token,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { register, registerDoctor, login };
