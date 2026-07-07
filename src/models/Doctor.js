const mongoose = require("mongoose");

const doctorSchema = new mongoose.Schema(
  {
    // Reference to the User model
    // This links the Doctor profile to a User account
    // mongoose.Schema.Types.ObjectId = the type used for referencing other documents
    // ref: "User" = tells Mongoose which model this id refers to (for .populate())
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,         // removes leading/trailing spaces automatically
    },

    specialization: {
      type: String,
      required: true,
      trim: true,
    },

    experience: {
      type: Number,
      required: true,
      min: 0,             // minimum value validation
      max: 60,            // maximum value validation
    },

    fees: {
      type: Number,
      required: true,
      min: 0,
    },

    phone: {
      type: String,
      trim: true,
    },

    // Available time slots for appointments
    // Array of strings like ["09:00", "10:00", "11:00"]
    availableSlots: {
      type: [String],     // array of strings
      default: [],        // empty array by default
    },

    // Is this doctor currently available for booking?
    isAvailable: {
      type: Boolean,
      default: true,
    },

    // Doctor's bio/description
    bio: {
      type: String,
      trim: true,
    },
  },
  {
    timestamps: true,   // adds createdAt and updatedAt automatically
  }
);

module.exports = mongoose.model("Doctor", doctorSchema);
