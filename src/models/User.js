const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true, // automatically lowercase before saving
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
    },
    role: {
      type: String,
      enum: ["PATIENT", "DOCTOR", "ADMIN"],
      default: "PATIENT",
      index: true,  // index for faster role-based queries
    },
    phone: {
      type: String,
      trim: true,
    },
    // Coins/wallet system — earned by writing reviews, referrals etc
    coins: {
      type: Number,
      default: 50, // new users get 50 welcome coins
      min: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for login queries (email lookup)
userSchema.index({ email: 1 });

module.exports = mongoose.model("User", userSchema);
