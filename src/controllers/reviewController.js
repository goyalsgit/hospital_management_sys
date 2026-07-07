const Review = require("../models/Review");
const Doctor = require("../models/Doctor");
const User = require("../models/User");

// Coins reward config
const COINS = {
  REVIEW: 10,        // 10 coins per review
  FIRST_REVIEW: 20,  // bonus for first ever review
  BOOKING: 5,        // 5 coins per booking
};

// ==========================================
//         CREATE REVIEW
// ==========================================
// POST /api/reviews
// Protected — only patients who had an appointment

const createReview = async (req, res) => {
  try {
    const { doctorId, rating, comment } = req.body;

    if (!doctorId || !rating) {
      return res.status(400).json({ message: "doctorId and rating are required" });
    }

    if (rating < 1 || rating > 5) {
      return res.status(400).json({ message: "Rating must be between 1 and 5" });
    }

    // Check if doctor exists
    const doctor = await Doctor.findById(doctorId);
    if (!doctor) {
      return res.status(404).json({ message: "Doctor not found" });
    }

    // Check if user already reviewed this doctor
    const existingReview = await Review.findOne({
      userId: req.user._id,
      doctorId,
    });
    if (existingReview) {
      return res.status(409).json({ message: "You already reviewed this doctor" });
    }

    // Check if this is the user's first ever review (bonus coins)
    const reviewCount = await Review.countDocuments({ userId: req.user._id });
    const coinsEarned = reviewCount === 0 ? COINS.FIRST_REVIEW : COINS.REVIEW;

    // Create the review
    const review = await Review.create({
      userId: req.user._id,
      doctorId,
      rating,
      comment: comment || "",
      coinsEarned,
    });

    // Award coins to user
    await User.findByIdAndUpdate(req.user._id, {
      $inc: { coins: coinsEarned }, // $inc = increment by value
    });

    // Get updated user coins
    const updatedUser = await User.findById(req.user._id).select("coins");

    res.status(201).json({
      message: `Review submitted! You earned ${coinsEarned} coins 🎉`,
      review,
      coinsEarned,
      totalCoins: updatedUser.coins,
    });

  } catch (error) {
    if (error.code === 11000) {
      return res.status(409).json({ message: "You already reviewed this doctor" });
    }
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET REVIEWS FOR A DOCTOR
// ==========================================
// GET /api/reviews/doctor/:doctorId
// Public

const getDoctorReviews = async (req, res) => {
  try {
    const { doctorId } = req.params;

    const reviews = await Review.find({ doctorId })
      .populate("userId", "name")
      .sort({ createdAt: -1 });

    // Calculate average rating
    const avgRating = reviews.length > 0
      ? (reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length).toFixed(1)
      : 0;

    res.status(200).json({
      total: reviews.length,
      averageRating: Number(avgRating),
      reviews,
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ==========================================
//         GET MY COINS
// ==========================================
// GET /api/reviews/my-coins
// Protected

const getMyCoins = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("coins name");
    const reviewCount = await Review.countDocuments({ userId: req.user._id });

    res.status(200).json({
      coins: user.coins,
      name: user.name,
      reviewsWritten: reviewCount,
      coinsPerReview: COINS.REVIEW,
      // How coins can be used
      redemptionOptions: [
        { name: "10% discount on appointment", cost: 100 },
        { name: "Free consultation", cost: 500 },
        { name: "Priority booking", cost: 50 },
      ],
    });

  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createReview, getDoctorReviews, getMyCoins };
