const Doctor = require("../models/Doctor");
const User = require("../models/User");

// ==========================================
//         GET ALL DOCTORS
// ==========================================
// GET /api/doctors
// Public — no token needed

const getAllDoctors = async (req, res) => {
  try {
    // Read query params for filtering
    // GET /api/doctors?specialization=cardiology&page=1&limit=10
    const { specialization, page, limit, search } = req.query;

    // Build filter object dynamically
    const filter = { isAvailable: true };

    // If specialization sent, add to filter
    if (specialization) {
      // "i" flag = case insensitive search
      // So "cardiology" matches "Cardiology" and "CARDIOLOGY"
      filter.specialization = { $regex: specialization, $options: "i" };
    }

    // If search sent, search in name OR specialization
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: "i" } },
        { specialization: { $regex: search, $options: "i" } },
      ];
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;   // default page 1
    const pageSize   = parseInt(limit) || 10; // default 10 per page
    const skip = (pageNumber - 1) * pageSize; // how many to skip

    // Get total count for pagination info
    const total = await Doctor.countDocuments(filter);

    // Query with filter + pagination
    const doctors = await Doctor.find(filter)
      .skip(skip)
      .limit(pageSize)
      .sort({ createdAt: -1 }); // newest first

    res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize), // total number of pages
      doctors,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET ONE DOCTOR
// ==========================================
// GET /api/doctors/:id
// Public

const getDoctorById = async (req, res) => {
  try {
    const { id } = req.params;

    // .populate("userId", "name email")
    // populate = replace the userId ObjectId with actual user data
    // "name email" = only get these fields from User
    const doctor = await Doctor.findById(id).populate("userId", "name email");

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({ doctor });

  } catch (error) {
    // Handle invalid MongoDB ObjectId format
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid doctor ID format" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         CREATE DOCTOR
// ==========================================
// POST /api/doctors
// ADMIN only

const createDoctor = async (req, res) => {
  try {
    const {
      userId,
      name,
      specialization,
      experience,
      fees,
      phone,
      availableSlots,
      bio,
    } = req.body;

    // Validate required fields
    if (!userId || !name || !specialization || !experience || !fees) {
      return res.status(400).json({
        message: "userId, name, specialization, experience and fees are required",
      });
    }

    // Check if userId exists in User collection
    const userExists = await User.findById(userId);
    if (!userExists) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if doctor profile already exists for this user
    const doctorExists = await Doctor.findOne({ userId });
    if (doctorExists) {
      return res.status(409).json({
        message: "Doctor profile already exists for this user",
      });
    }

    // Update user role to DOCTOR
    await User.findByIdAndUpdate(userId, { role: "DOCTOR" });

    // Create doctor profile
    const doctor = await Doctor.create({
      userId,
      name,
      specialization,
      experience,
      fees,
      phone,
      availableSlots: availableSlots || [],
      bio,
    });

    res.status(201).json({
      message: "Doctor created successfully",
      doctor,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         UPDATE DOCTOR
// ==========================================
// PATCH /api/doctors/:id
// ADMIN only

const updateDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    // Build update object with only fields that were sent
    const allowedFields = ["name", "specialization", "experience", "fees", "phone", "availableSlots", "bio", "isAvailable"];
    const updates = {};

    // Loop through allowed fields and add to updates if sent
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updates[field] = req.body[field];
      }
    });

    const doctor = await Doctor.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    );

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    res.status(200).json({
      message: "Doctor updated successfully",
      doctor,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         DELETE DOCTOR
// ==========================================
// DELETE /api/doctors/:id
// ADMIN only

const deleteDoctor = async (req, res) => {
  try {
    const { id } = req.params;

    const doctor = await Doctor.findByIdAndDelete(id);

    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Reset user role back to PATIENT when doctor profile is deleted
    await User.findByIdAndUpdate(doctor.userId, { role: "PATIENT" });

    res.status(200).json({ message: "Doctor deleted successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getAllDoctors,
  getDoctorById,
  createDoctor,
  updateDoctor,
  deleteDoctor,
};
