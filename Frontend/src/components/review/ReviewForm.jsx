import React, { useState } from "react";
import toast from "react-hot-toast";
import axios from "axios";
import { Star } from "lucide-react";

const ReviewForm = ({ bookingId, technicianId, onSuccess }) => {
  const [score, setScore] = useState(5);
  const [hover, setHover] = useState(null);
  const [review, setReview] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (review.length < 10) {
      return toast.error("Review must be at least 10 characters");
    }

    try {
      setLoading(true);

      const res = await axios.post(
        "http://localhost:5000/api/reviews/user/reviews",
        {
          bookingId,
          technicianId,
          score,
          review,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      toast.success("Review submitted successfully");
      setReview("");
      setScore(5);

      if (onSuccess) onSuccess(res.data.review);
    } catch (err) {
      toast.error(err.response?.data?.message || "Failed to submit review");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="bg-white shadow-md rounded-xl p-6 space-y-4"
    >
      <h2 className="text-xl font-semibold">Write a Review</h2>

      {/* ⭐ Funky Star Rating */}
      <div>
        <label className="block mb-2 font-medium">Rating</label>

        <div className="flex gap-1 cursor-pointer">
          {[...Array(5)].map((_, i) => {
            const ratingValue = i + 1;

            return (
              <Star
                key={i}
                size={26}
                onClick={() => setScore(ratingValue)}
                onMouseEnter={() => setHover(ratingValue)}
                onMouseLeave={() => setHover(null)}
                className={`transition ${
                  ratingValue <= (hover || score)
                    ? "text-amber-400 fill-amber-400 scale-110"
                    : "text-gray-300"
                }`}
              />
            );
          })}
        </div>

        {/* Optional text */}
        <p className="text-sm text-gray-500 mt-1">
          {score} Star{score > 1 && "s"}
        </p>
      </div>

      {/* Review Text */}
      <div>
        <label className="block mb-1 font-medium">Your Review</label>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          rows="4"
          className="w-full border rounded-lg p-2"
          placeholder="Write your experience..."
        />
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full bg-black text-white py-2 rounded-lg hover:opacity-90 transition"
      >
        {loading ? "Submitting..." : "Submit Review"}
      </button>
    </form>
  );
};

export default ReviewForm;