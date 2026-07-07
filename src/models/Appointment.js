const mongoose = require("mongoose");

const appointmentSchema = new mongoose.Schema(
  {
    // Who booked — links to User collection
    patientId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which doctor — links to Doctor collection
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Date of appointment (stored as Date object)
    date: {
      type: Date,
      required: true,
    },

    // Time slot like "09:00" or "14:30"
    slot: {
      type: String,
      required: true,
      trim: true,
    },

    // Current status of the appointment
    status: {
      type: String,
      enum: ["PENDING", "APPROVED", "COMPLETED", "CANCELLED"],
      default: "PENDING",
    },

    // Optional notes from patient when booking
    notes: {
      type: String,
      trim: true,
    },

    // Optional prescription from doctor after appointment
    prescription: {
      type: String,
      trim: true,
    },

    // Fee amount at the time of booking
    // Stored separately in case doctor changes fees later
    feesAtBooking: {
      type: Number,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Appointment", appointmentSchema);
