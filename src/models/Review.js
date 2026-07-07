const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema(
  {
    // Who wrote the review
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Which doctor is being reviewed
    doctorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Doctor",
      required: true,
    },

    // Rating out of 5
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },

    // Review text
    comment: {
      type: String,
      trim: true,
      maxlength: 500,
    },

    // Coins earned for this review
    coinsEarned: {
      type: Number,
      default: 10,
    },
  },
  {
    timestamps: true,
  }
);

// One user can only review one doctor once
reviewSchema.index({ userId: 1, doctorId: 1 }, { unique: true });

module.exports = mongoose.model("Review", reviewSchema);
