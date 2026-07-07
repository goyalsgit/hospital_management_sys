const Appointment = require("../models/Appointment");
const Doctor = require("../models/Doctor");

// ==========================================
//         BOOK APPOINTMENT
// ==========================================
// POST /api/appointments
// Protected — PATIENT only

const bookAppointment = async (req, res) => {
  try {
    const { doctorId, date, slot, notes } = req.body;

    // Step 1: Validate required fields
    if (!doctorId || !date || !slot) {
      return res.status(400).json({
        message: "doctorId, date and slot are required",
      });
    }

    // Step 2: Check if doctor exists and is available
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }
    if (!doctor.isAvailable) {
      return res.status(400).json({ message: "Doctor is not available" });
    }

    // Step 3: Check if the requested slot is in doctor's available slots
    if (!doctor.availableSlots.includes(slot)) {
      return res.status(400).json({
        message: `Slot ${slot} is not available. Available slots: ${doctor.availableSlots.join(", ")}`,
      });
    }

    // Step 4: Check if slot is already booked for that date
    // We look for an appointment with same doctor, same date, same slot
    // that is not CANCELLED
    const appointmentDate = new Date(date);

    // Create start and end of that day for date comparison
    // This handles timezone issues when comparing dates
    const startOfDay = new Date(appointmentDate);
    startOfDay.setHours(0, 0, 0, 0);   // set to midnight start

    const endOfDay = new Date(appointmentDate);
    endOfDay.setHours(23, 59, 59, 999); // set to midnight end

    const existingAppointment = await Appointment.findOne({
      doctorId,
      slot,
      date: { $gte: startOfDay, $lte: endOfDay }, // between start and end of day
      status: { $ne: "CANCELLED" }, // not cancelled
    });

    if (existingAppointment) {
      return res.status(409).json({
        message: "This slot is already booked for that date",
      });
    }

    // Step 5: Create the appointment
    const appointment = await Appointment.create({
      patientId: req.user._id,    // from JWT token via middleware
      doctorId,
      date: appointmentDate,
      slot,
      notes,
      feesAtBooking: doctor.fees, // snapshot of current fees
      status: "PENDING",
    });

    // Step 6: Populate doctor and patient info in response
    const populatedAppointment = await Appointment.findById(appointment._id)
      .populate("doctorId", "name specialization fees")
      .populate("patientId", "name email phone");

    res.status(201).json({
      message: "Appointment booked successfully",
      appointment: populatedAppointment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET MY APPOINTMENTS
// ==========================================
// GET /api/appointments
// Protected — returns different data based on role

const getMyAppointments = async (req, res) => {
  try {
    const { status, page, limit } = req.query;

    // Build filter based on who is asking
    let filter = {};

    if (req.user.role === "PATIENT") {
      // Patient sees only their own appointments
      filter.patientId = req.user._id;

    } else if (req.user.role === "DOCTOR") {
      // Doctor sees appointments booked with them
      // First find the doctor profile linked to this user
      const doctor = await Doctor.findOne({ userId: req.user._id });
      if (!doctor) {
        return res.status(404).json({ message: "Doctor profile not found" });
      }
      filter.doctorId = doctor._id;

    } else if (req.user.role === "ADMIN") {
      // Admin sees all appointments
      filter = {};
    }

    // Filter by status if provided
    if (status) {
      filter.status = status.toUpperCase();
    }

    // Pagination
    const pageNumber = parseInt(page) || 1;
    const pageSize   = parseInt(limit) || 10;
    const skip = (pageNumber - 1) * pageSize;

    const total = await Appointment.countDocuments(filter);

    const appointments = await Appointment.find(filter)
      .populate("doctorId", "name specialization fees")
      .populate("patientId", "name email phone")
      .skip(skip)
      .limit(pageSize)
      .sort({ date: -1 }); // most recent first

    res.status(200).json({
      total,
      page: pageNumber,
      pages: Math.ceil(total / pageSize),
      appointments,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET ONE APPOINTMENT
// ==========================================
// GET /api/appointments/:id
// Protected — only the patient or doctor involved can see it

const getAppointmentById = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id)
      .populate("doctorId", "name specialization fees phone")
      .populate("patientId", "name email phone");

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Security check — only involved parties can see this
    const isPatient = appointment.patientId._id.toString() === req.user._id.toString();
    const isAdmin   = req.user.role === "ADMIN";

    // For doctor: find their doctor profile and check
    let isDoctor = false;
    if (req.user.role === "DOCTOR") {
      const doctor = await Doctor.findOne({ userId: req.user._id });
      isDoctor = doctor && appointment.doctorId._id.toString() === doctor._id.toString();
    }

    if (!isPatient && !isAdmin && !isDoctor) {
      return res.status(403).json({ message: "Not authorized to view this appointment" });
    }

    res.status(200).json({ appointment });

  } catch (error) {
    if (error.name === "CastError") {
      return res.status(400).json({ message: "Invalid appointment ID" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         UPDATE APPOINTMENT STATUS
// ==========================================
// PATCH /api/appointments/:id/status
// DOCTOR or ADMIN only

const updateAppointmentStatus = async (req, res) => {
  try {
    const { status } = req.body;

    // Allowed status values
    const validStatuses = ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"];

    if (!status || !validStatuses.includes(status.toUpperCase())) {
      return res.status(400).json({
        message: `Status must be one of: ${validStatuses.join(", ")}`,
      });
    }

    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Prevent updating a completed or cancelled appointment
    if (["COMPLETED", "CANCELLED"].includes(appointment.status)) {
      return res.status(400).json({
        message: `Cannot update a ${appointment.status} appointment`,
      });
    }

    // Add prescription if status is COMPLETED
    if (status.toUpperCase() === "COMPLETED" && req.body.prescription) {
      appointment.prescription = req.body.prescription;
    }

    appointment.status = status.toUpperCase();
    await appointment.save(); // .save() saves the modified document

    res.status(200).json({
      message: "Appointment status updated",
      appointment,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         CANCEL APPOINTMENT
// ==========================================
// DELETE /api/appointments/:id
// PATIENT (own) or ADMIN

const cancelAppointment = async (req, res) => {
  try {
    const appointment = await Appointment.findById(req.params.id);

    if (!appointment) {
      return res.status(404).json({ message: "Appointment not found" });
    }

    // Only the patient who booked it or admin can cancel
    const isOwner = appointment.patientId.toString() === req.user._id.toString();
    const isAdmin = req.user.role === "ADMIN";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({
        message: "Not authorized to cancel this appointment",
      });
    }

    // Can't cancel what's already done
    if (appointment.status === "COMPLETED") {
      return res.status(400).json({
        message: "Cannot cancel a completed appointment",
      });
    }

    if (appointment.status === "CANCELLED") {
      return res.status(400).json({
        message: "Appointment is already cancelled",
      });
    }

    appointment.status = "CANCELLED";
    await appointment.save();

    res.status(200).json({ message: "Appointment cancelled successfully" });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  bookAppointment,
  getMyAppointments,
  getAppointmentById,
  updateAppointmentStatus,
  cancelAppointment,
};
