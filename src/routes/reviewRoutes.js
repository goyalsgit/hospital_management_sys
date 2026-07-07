const express = require("express");
const router = express.Router();

const { authenticateUser } = require("../middleware/authMiddleware");
const { createReview, getDoctorReviews, getMyCoins } = require("../controllers/reviewController");

// POST /api/reviews — create review + earn coins (protected)
router.post("/", authenticateUser, createReview);

// GET /api/reviews/my-coins — get my coin balance (protected)
router.get("/my-coins", authenticateUser, getMyCoins);

// GET /api/reviews/doctor/:doctorId — get all reviews for a doctor (public)
router.get("/doctor/:doctorId", getDoctorReviews);

module.exports = router;
