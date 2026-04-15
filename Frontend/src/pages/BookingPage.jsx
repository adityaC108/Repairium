import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const BookingPage = () => {
  const { id } = useParams();

  const [appliance, setAppliance] = useState(null);
  const [loading, setLoading] = useState(true);

  const [form, setForm] = useState({
    issueDescription: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    preferredDate: "",
    preferredTime: ""
  });

  useEffect(() => {
    const fetchAppliance = async () => {
      try {
        const res = await API.get(`/appliances/${id}`);
        setAppliance(res.data.data.appliance);
        console.log("APPLIANCE 👉", res.data.data.appliance);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliance();
  }, [id]);

  const handleSubmit = async () => {
    try {
      const payload = {
        applianceId: id,
        issueDescription: form.issueDescription,
        serviceAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          coordinates: {
            type: "Point",
            coordinates: [72.8777, 19.0760] // dummy Mumbai coords
          }
        },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime
      };

      const res = await API.post("/user/bookings", payload);

      console.log("BOOKING SUCCESS 👉", res.data);
      alert("Booking Created ✅");

    } catch (err) {
      console.error(err);
      alert("Booking Failed ❌");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">

      {/* Appliance Info */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold">{appliance.name}</h1>
        <p className="text-gray-500">
          {appliance.brand} • {appliance.model}
        </p>
        <p className="text-primary font-semibold">
          ₹{appliance.totalPrice}
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">

        <textarea
          placeholder="Issue Description"
          className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, issueDescription: e.target.value })}
        />

        <input placeholder="Street" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, street: e.target.value })}
        />

        <input placeholder="City" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, city: e.target.value })}
        />

        <input placeholder="State" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, state: e.target.value })}
        />

        <input placeholder="Pincode" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
        />

        <input type="date" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, preferredDate: e.target.value })}
        />

        <input type="time" className="border p-2 rounded"
          onChange={(e) => setForm({ ...form, preferredTime: e.target.value })}
        />

        <button
          onClick={handleSubmit}
          className="bg-black text-white py-3 rounded-xl mt-4"
        >
          Book Technician 🚀
        </button>

      </div>
    </div>
  );
};

export default BookingPage;