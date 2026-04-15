import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import API from "../services/api";

const BookingPage = () => {
  const { id } = useParams();

  const [appliance, setAppliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");

  const [form, setForm] = useState({
    serviceType: "regular",
    issueDescription: "",
    street: "",
    city: "",
    state: "",
    pincode: "",
    preferredDate: "",
    preferredTime: ""
  });

  // 🔥 Toast
  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

  // 🔥 Fetch Appliance
  useEffect(() => {
    const fetchAppliance = async () => {
      try {
        const res = await API.get(`/appliances/${id}`);
        setAppliance(res.data.data.appliance);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchAppliance();
  }, [id]);

  // 🔥 Auto-fill Address
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user"));

    if (user) {
      setForm((prev) => ({
        ...prev,
        street: user?.address?.street || "",
        city: user?.address?.city || "",
        state: user?.address?.state || "",
        pincode: user?.address?.pincode || ""
      }));
    }
  }, []);

  // 🔥 Handle Change
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔥 Submit Booking
  const handleSubmit = async () => {
    try {
      // ✅ Validation
      if (!form.issueDescription || form.issueDescription.length < 10) {
        return showToast("Describe issue (min 10 chars) ❌");
      }

      if (!form.street || !form.city || !form.state || !form.pincode) {
        return showToast("Fill complete address ❌");
      }

      if (!form.preferredDate || !form.preferredTime) {
        return showToast("Select date & time ❌");
      }

      // 🔥 Get coordinates safely
      const user = JSON.parse(localStorage.getItem("user"));

      const coords = [72.8777, 19.0760];

      const payload = {
        applianceId: id,
        serviceType: form.serviceType,

        issueDescription: form.issueDescription,

        serviceAddress: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,

          // ✅ FINAL CORRECT STRUCTURE
          coordinates: {
            type: "Point",
            coordinates: coords
          }
        },

        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime
      };

      console.log("FINAL PAYLOAD 👉", payload);

      const res = await API.post("/bookings/user/bookings", payload);

      console.log("BOOKING SUCCESS 👉", res.data);

      showToast("Booking Created Successfully 🎉");

    } catch (err) {
      console.log("FULL ERROR 👉", err.response?.data);
      console.log("ERROR DETAILS 👉", err.response?.data?.errors);
      showToast(err.response?.data?.message || "Booking Failed ❌");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">

      {/* 🔥 Toast */}
      {toast && (
        <div className="fixed top-5 right-5 bg-black text-white px-5 py-3 rounded-xl shadow-lg">
          {toast}
        </div>
      )}

      {/* Appliance Info */}
      <div className="mb-6 bg-slate-100 p-5 rounded-xl">
        <h1 className="text-2xl font-bold">{appliance.name}</h1>
        <p className="text-gray-500">
          {appliance.brand} • {appliance.model}
        </p>
        <p className="text-primary font-semibold mt-2">
          ₹{appliance.totalPrice}
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">

        {/* Service Type */}
        <select
          value={form.serviceType}
          onChange={(e) => handleChange("serviceType", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="regular">Regular Service</option>
          <option value="emergency">Emergency Service ⚡</option>
        </select>

        {/* Issue */}
        <textarea
          placeholder="Describe your issue..."
          value={form.issueDescription}
          onChange={(e) => handleChange("issueDescription", e.target.value)}
          className="border p-3 rounded"
        />

        {/* Address */}
        <input
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
          placeholder="Street"
          className="border p-2 rounded"
        />

        <input
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
          placeholder="City"
          className="border p-2 rounded"
        />

        <input
          value={form.state}
          onChange={(e) => handleChange("state", e.target.value)}
          placeholder="State"
          className="border p-2 rounded"
        />

        <input
          value={form.pincode}
          onChange={(e) => handleChange("pincode", e.target.value)}
          placeholder="Pincode"
          className="border p-2 rounded"
        />

        {/* Date + Time */}
        <input
          type="date"
          value={form.preferredDate}
          onChange={(e) => handleChange("preferredDate", e.target.value)}
          className="border p-2 rounded"
        />

        <input
          type="time"
          value={form.preferredTime}
          onChange={(e) => handleChange("preferredTime", e.target.value)}
          className="border p-2 rounded"
        />

        {/* Submit */}
        <button
          onClick={handleSubmit}
          className="bg-black text-white py-3 rounded-xl mt-4 hover:scale-105 transition"
        >
          Book Technician 🚀
        </button>

      </div>
    </div>
  );
};

export default BookingPage;