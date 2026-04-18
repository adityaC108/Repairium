import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import ReviewForm from "../components/review/ReviewForm";
import ReviewCard from "../components/review/ReviewCard";

const ReviewPage = () => {
  const { bookingId, technicianId } = useParams();
  const [reviews, setReviews] = useState([]);

  const fetchReviews = async () => {
    try {
      const res = await axios.get(
        "http://localhost:5000/api/reviews/user/reviews",
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
          },
        }
      );

      setReviews(res.data.data.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchReviews();
  }, []);

  return (
    <div className="min-h-screen pt-24 px-6 bg-gray-50">
      <div className="max-w-4xl mx-auto space-y-8">

        <ReviewForm
          bookingId={bookingId}
          technicianId={technicianId}
          onSuccess={fetchReviews}
        />

        <div className="space-y-4">
          {reviews.map((rev) => (
            <ReviewCard key={rev._id} review={rev} />
          ))}
        </div>

      </div>
    </div>
  );
};

export default ReviewPage;