import Review from "../models/Review.js";
import Booking from "../models/Booking.js";
import User from "../models/User.js";
import Technician from "../models/Technician.js";
import {
  sendEmail,
  sendPushNotification,
  sendTemplatedEmail,
} from "../middleware/notification.js";
import { paginate, createPaginationResponse } from "../utils/helpers.js";

// Get All Reviews (Admin)
export const getAllReviews = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      search,
      rating,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = {};
    if (status) {
      query.status = status;
    }
    if (rating) {
      query.score = parseInt(rating);
    }
    if (search) {
      query.$or = [
        { review: { $regex: search, $options: "i" } },
        { "user.firstName": { $regex: search, $options: "i" } },
        { "user.lastName": { $regex: search, $options: "i" } },
        { "technician.firstName": { $regex: search, $options: "i" } },
        { "technician.lastName": { $regex: search, $options: "i" } },
      ];
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const reviews = await Review.find(query)
      .populate("user", "firstName lastName email avatar")
      .populate("technician", "firstName lastName email avatar")
      .populate("booking", "bookingId createdAt")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Reviews retrieved successfully",
      data: createPaginationResponse(reviews, parseInt(page), limitNum, total),
    });
  } catch (error) {
    console.error("Get all reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve reviews",
      error: error.message,
    });
  }
};

// Get Review by ID
export const getReviewById = async (req, res) => {
  try {
    const { reviewId } = req.params;

    const review = await Review.findById(reviewId)
      .populate("user", "firstName lastName email avatar")
      .populate("technician", "firstName lastName email avatar")
      .populate("booking", "bookingId createdAt finalAmount");

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    res.status(200).json({
      success: true,
      message: "Review retrieved successfully",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Get review by ID error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review",
      error: error.message,
    });
  }
};

// Get User Reviews
export const getUserReviews = async (req, res) => {
  try {
    const { user } = req;
    const {
      page = 1,
      limit = 10,
      rating,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { user: user._id };
    if (rating) {
      query.score = parseInt(rating);
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const reviews = await Review.find(query)
      .populate("technician", "firstName lastName email avatar")
      .populate("booking", "bookingId createdAt finalAmount")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "User reviews retrieved successfully",
      data: createPaginationResponse(reviews, parseInt(page), limitNum, total),
    });
  } catch (error) {
    console.error("Get user reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve user reviews",
      error: error.message,
    });
  }
};

// Get Technician Reviews
export const getTechnicianReviews = async (req, res) => {
  try {
    const technician = req.user;
    const {
      page = 1,
      limit = 10,
      rating,
      status,
      sortBy = "createdAt",
      sortOrder = "desc",
    } = req.query;

    // Build query
    const query = { technician: technician._id };
    if (rating) {
      query.score = parseInt(rating);
    }
    if (status) {
      query.status = status;
    }

    const { skip, limit: limitNum } = paginate(parseInt(page), parseInt(limit));

    const reviews = await Review.find(query)
      .populate("user", "firstName lastName email avatar")
      .populate("booking", "bookingId createdAt finalAmount")
      .sort({ [sortBy]: sortOrder === "asc" ? 1 : -1 })
      .skip(skip)
      .limit(limitNum);

    const total = await Review.countDocuments(query);

    res.status(200).json({
      success: true,
      message: "Technician reviews retrieved successfully",
      data: createPaginationResponse(reviews, parseInt(page), limitNum, total),
    });
  } catch (error) {
    console.error("Get technician reviews error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve technician reviews",
      error: error.message,
    });
  }
};

// Create Review
export const createReview = async (req, res) => {
  try {
    const { user } = req;
    const { bookingId, technicianId, score, review } = req.body;

    // Check if booking exists and belongs to user
    const booking = await Booking.findOne({
      _id: bookingId,
      user: user._id,
      status: "completed",
    });

    if (!booking) {
      return res.status(404).json({
        success: false,
        message: "Booking not found or not completed",
      });
    }

    // Check if review already exists
    const existingReview = await Review.findOne({
      booking: bookingId,
      user: user._id,
    });

    if (existingReview) {
      return res.status(400).json({
        success: false,
        message: "Review already exists for this booking",
      });
    }

    // Create new review
    const newReview = new Review({
      user: user._id,
      technician: technicianId,
      booking: bookingId,
      score,
      review,
      status: "published",
    });

    await newReview.save();

    // Send notification to technician
    await sendPushNotification(
      technicianId,
      "New Review",
      `${user.firstName} ${user.lastName} left you a ${score}-star review`,
    );

    await sendTemplatedEmail(technician.email, "newReview", {
      firstName: technician.firstName,
      reviewerName: `${user.firstName} ${user.lastName}`,
      score,
      review,
      bookingId: booking.bookingId,
    });

    res.status(201).json({
      success: true,
      message: "Review created successfully",
      data: {
        review: newReview,
      },
    });
  } catch (error) {
    console.error("Create review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create review",
      error: error.message,
    });
  }
};

// Update Review
export const updateReview = async (req, res) => {
  try {
    const { user, admin } = req;
    const { reviewId } = req.params;
    const updates = req.body;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check permissions - only review owner or admin can update
    if (!admin && review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to update this review",
      });
    }

    // Remove sensitive fields
    delete updates.user;
    delete updates.technician;
    delete updates.booking;
    delete updates._id;
    delete updates.createdAt;
    delete updates.__v;

    // Update the review
    const updatedReview = await Review.findByIdAndUpdate(reviewId, updates, {
      new: true,
      runValidators: true,
    });

    // If score was updated, recalculate technician rating
    if (updates.score && review.technician) {
      const technician = await Technician.findById(review.technician);
      if (technician) {
        await technician.recalculateRating();
      }
    }

    res.status(200).json({
      success: true,
      message: "Review updated successfully",
      data: {
        review: updatedReview,
      },
    });
  } catch (error) {
    console.error("Update review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review",
      error: error.message,
    });
  }
};

// Delete Review
export const deleteReview = async (req, res) => {
  try {
    const { user, admin } = req;
    const { reviewId } = req.params;

    // Find the review
    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check permissions - only review owner or admin can delete
    if (!admin && review.user.toString() !== user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to delete this review",
      });
    }

    await Review.findByIdAndDelete(reviewId);

    // Recalculate technician rating if review was deleted
    if (review.technician) {
      const technician = await Technician.findById(review.technician);
      if (technician) {
        await technician.recalculateRating();
      }
    }

    res.status(200).json({
      success: true,
      message: "Review deleted successfully",
    });
  } catch (error) {
    console.error("Delete review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete review",
      error: error.message,
    });
  }
};

// Update Review Status (Admin)
export const updateReviewStatus = async (req, res) => {
  try {
    const { reviewId } = req.params;
    const { status, reason } = req.body;

    const review = await Review.findById(reviewId);

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    review.status = status;
    review.moderationReason = reason || null;
    review.moderatedAt = new Date();

    await review.save();

    // Notify user if review was moderated
    if (status === "flagged" || status === "hidden") {
      const user = await User.findById(review.user);
      if (user) {
        await sendTemplatedEmail(user.email, "reviewModeration", {
          firstName: user.firstName,
          status,
          reason,
        });
      }
    }

    res.status(200).json({
      success: true,
      message: "Review status updated successfully",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Update review status error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update review status",
      error: error.message,
    });
  }
};

// Get Review Statistics
export const getReviewStatistics = async (req, res) => {
  try {
    const { period = "all" } = req.query;

    let dateFilter = {};
    if (period === "month") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) },
      };
    } else if (period === "quarter") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 90 * 24 * 60 * 60 * 1000) },
      };
    } else if (period === "year") {
      dateFilter = {
        createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
      };
    }

    // Overall statistics
    const overallStats = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: null,
          totalReviews: { $sum: 1 },
          averageRating: { $avg: "$score" },
          ratingDistribution: {
            $push: "$score",
          },
        },
      },
    ]);

    // Rating distribution
    const ratingDistribution = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$score",
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    // Reviews by status
    const statusDistribution = await Review.aggregate([
      { $match: dateFilter },
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 },
        },
      },
    ]);

    // Monthly trends
    const monthlyTrends = await Review.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(Date.now() - 365 * 24 * 60 * 60 * 1000) },
        },
      },
      {
        $group: {
          _id: {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
          },
          count: { $sum: 1 },
          averageRating: { $avg: "$score" },
        },
      },
      { $sort: { "_id.year": 1, "_id.month": 1 } },
    ]);

    const statistics = {
      overall: overallStats[0] || {
        totalReviews: 0,
        averageRating: 0,
        ratingDistribution: [],
      },
      ratingDistribution,
      statusDistribution,
      monthlyTrends,
    };

    res.status(200).json({
      success: true,
      message: "Review statistics retrieved successfully",
      data: statistics,
    });
  } catch (error) {
    console.error("Get review statistics error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to retrieve review statistics",
      error: error.message,
    });
  }
};

// Respond to Review (Admin/Technician)
export const respondToReview = async (req, res) => {
  try {
    const { admin, technician } = req;
    const { reviewId } = req.params;
    const { response } = req.body;

    const review = await Review.findById(reviewId).populate(
      "user",
      "firstName lastName email",
    );

    if (!review) {
      return res.status(404).json({
        success: false,
        message: "Review not found",
      });
    }

    // Check permissions
    if (
      !admin &&
      (!technician ||
        review.technician.toString() !== technician._id.toString())
    ) {
      return res.status(403).json({
        success: false,
        message: "Not authorized to respond to this review",
      });
    }

    review.response = response;
    review.responseBy = admin ? admin._id : technician._id;
    review.responseByModel = admin ? "Admin" : "Technician";

    await review.save();

    // Notify user about response
    await sendTemplatedEmail(review.user.email, "reviewResponse", {
      firstName: review.user.firstName,
      response,
      responderType: review.responseByModel,
    });

    res.status(200).json({
      success: true,
      message: "Response added successfully",
      data: {
        review,
      },
    });
  } catch (error) {
    console.error("Respond to review error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to add response",
      error: error.message,
    });
  }
};

export default {
  getAllReviews,
  getReviewById,
  getUserReviews,
  getTechnicianReviews,
  createReview,
  updateReview,
  deleteReview,
  updateReviewStatus,
  getReviewStatistics,
  respondToReview,
};
