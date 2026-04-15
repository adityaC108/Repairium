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

  // 🔥 Fetch Appliance
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

  // 🔥 AUTO-FILL + AUTO-SYNC ADDRESS
  useEffect(() => {
    // ✅ 1. Load instantly from localStorage
    const localUser = JSON.parse(localStorage.getItem("user"));

    if (localUser) {
      setForm((prev) => ({
        ...prev,
        street: localUser?.address?.street || "",
        city: localUser?.address?.city || "",
        state: localUser?.address?.state || "",
        pincode: localUser?.address?.pincode || ""
      }));
    }

    // ✅ 2. Fetch latest from backend
    const fetchUser = async () => {
      try {
        const res = await API.get("/users/profile"); // ✅ FIXED endpoint

        const user = res.data.data.user;

        console.log("LATEST USER 👉", user);

        // update localStorage
        localStorage.setItem("user", JSON.stringify(user));

        // update form
        setForm((prev) => ({
          ...prev,
          street: user?.address?.street || "",
          city: user?.address?.city || "",
          state: user?.address?.state || "",
          pincode: user?.address?.pincode || ""
        }));

      } catch (err) {
        console.error("User fetch error:", err);
      }
    };

    fetchUser();

    // ✅ 3. Listen for profile updates (REAL-TIME)
    const handleStorageChange = () => {
      const updatedUser = JSON.parse(localStorage.getItem("user"));

      console.log("UPDATED FROM PROFILE 👉", updatedUser);

      if (updatedUser) {
        setForm((prev) => ({
          ...prev,
          street: updatedUser?.address?.street || "",
          city: updatedUser?.address?.city || "",
          state: updatedUser?.address?.state || "",
          pincode: updatedUser?.address?.pincode || ""
        }));
      }
    };

    window.addEventListener("storage", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
    };
  }, []);

  // 🔥 Handle Input Change
  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  // 🔥 Submit Booking
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
            coordinates: [72.8777, 19.0760]
          }
        },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime
      };

      console.log("BOOKING PAYLOAD 👉", payload);

      const res = await API.post("/user/bookings", payload);

      console.log("BOOKING SUCCESS 👉", res.data);

      alert("Booking Created ✅");

    } catch (err) {
      console.error("Booking error:", err);
      alert("Booking Failed ❌");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">

      {/* Appliance Info */}
      <div className="mb-6 bg-slate-100 p-5 rounded-xl">
        <h1 className="text-2xl font-bold">{appliance.name}</h1>
        <p className="text-gray-500">
          {appliance.brand} • {appliance.model}
        </p>
        <p className="text-primary font-semibold text-lg mt-2">
          ₹{appliance.totalPrice}
        </p>
      </div>

      {/* Form */}
      <div className="grid gap-4">

        <textarea
          placeholder="Describe your issue..."
          className="border p-3 rounded"
          value={form.issueDescription}
          onChange={(e) => handleChange("issueDescription", e.target.value)}
        />

        <input
          placeholder="Street"
          className="border p-2 rounded"
          value={form.street}
          onChange={(e) => handleChange("street", e.target.value)}
        />

        <input
          placeholder="City"
          className="border p-2 rounded"
          value={form.city}
          onChange={(e) => handleChange("city", e.target.value)}
        />

        <input
          placeholder="State"
          className="border p-2 rounded"
          value={form.state}
          onChange={(e) => handleChange("state", e.target.value)}
        />

        <input
          placeholder="Pincode"
          className="border p-2 rounded"
          value={form.pincode}
          onChange={(e) => handleChange("pincode", e.target.value)}
        />

        <input
          type="date"
          className="border p-2 rounded"
          value={form.preferredDate}
          onChange={(e) => handleChange("preferredDate", e.target.value)}
        />

        <input
          type="time"
          className="border p-2 rounded"
          value={form.preferredTime}
          onChange={(e) => handleChange("preferredTime", e.target.value)}
        />

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