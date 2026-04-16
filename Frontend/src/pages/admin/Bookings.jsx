import React, { useEffect, useState } from "react";
import { getAllBookings } from "../../services/adminService";

const Bookings = () => {
  const [bookings, setBookings] = useState([]);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await getAllBookings();
        setBookings(res.data.data);
      } catch (err) {
        console.error(err);
      }
    };

    fetchBookings();
  }, []);

  return (
    <div className="p-6 text-white">
      <h1 className="text-2xl font-bold mb-6">Bookings</h1>

      <table className="w-full bg-gray-800 rounded-xl">
        <thead>
          <tr className="bg-gray-700">
            <th>Booking ID</th>
            <th>User</th>
            <th>Technician</th>
            <th>Status</th>
            <th>Amount</th>
          </tr>
        </thead>

        <tbody>
          {bookings?.map((b) => (
            <tr key={b._id} className="text-center border-t border-gray-700">
              <td>{b.bookingId}</td>
              <td>{b.user?.firstName}</td>
              <td>{b.technician?.firstName || "Not Assigned"}</td>
              <td>{b.status}</td>
              <td>₹ {b.estimatedCost?.total}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default Bookings;
