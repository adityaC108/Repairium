import React from "react";
import { Star } from "lucide-react";

const ReviewCard = ({ review }) => {
  return (
    <div className="bg-white shadow-md rounded-xl p-5 space-y-3">
      
      {/* Top Section */}
      <div className="flex justify-between items-center">
        <h3 className="font-semibold">
          {review.user?.firstName} {review.user?.lastName}
        </h3>

        {/* ⭐ Funky Stars */}
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <Star
              key={i}
              size={20}
              className={`${
                i < review.score
                  ? "text-amber-400 fill-amber-400"
                  : "text-gray-300"
              } transition`}
            />
          ))}
        </div>
      </div>

      {/* Review Text */}
      <p className="text-gray-600">{review.review}</p>

      {/* Response */}
      {review.response && (
        <div className="bg-gray-100 p-3 rounded-lg">
          <p className="text-sm font-semibold text-gray-700">
            Response:
          </p>
          <p className="text-sm text-gray-600">{review.response}</p>
        </div>
      )}
    </div>
  );
};

export default ReviewCard;