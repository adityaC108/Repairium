import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import API from "../services/api";

const BookingPage = () => {
  const { id } = useParams();

  const [appliance, setAppliance] = useState(null);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const navigate = useNavigate();

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

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  };

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

  const handleChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      [field]: value
    }));
  };

  const handleSubmit = async () => {
    try {
      if (!form.issueDescription || form.issueDescription.length < 10) {
        return showToast("Describe issue (min 10 chars) ❌");
      }

      if (!form.street || !form.city || !form.state || !form.pincode) {
        return showToast("Fill complete address ❌");
      }

      if (!form.preferredDate || !form.preferredTime) {
        return showToast("Select date & time ❌");
      }

      // 🔥 TIME VALIDATION (IMPORTANT)
      const [hours] = form.preferredTime.split(":").map(Number);
      if (hours < 8 || hours > 20) {
        return showToast("Time must be between 8 AM and 8 PM ❌");
      }

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
          coordinates: {
            type: "Point",
            coordinates: coords
          }
        },
        preferredDate: form.preferredDate,
        preferredTime: form.preferredTime
      };

      const res = await API.post("/bookings/user/bookings", payload);

      showToast("Booking Created Successfully 🎉");

      setTimeout(() => {
        navigate(`/payment/${res.data.data.booking._id}`);
      }, 1000);

    } catch (err) {
      showToast(err.response?.data?.message || "Booking Failed ❌");
    }
  };

  if (loading) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-4xl mx-auto mt-20 p-6">

      {/* Toast */}
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

        <select
          value={form.serviceType}
          onChange={(e) => handleChange("serviceType", e.target.value)}
          className="border p-2 rounded"
        >
          <option value="regular">Regular Service</option>
          <option value="emergency">Emergency Service ⚡</option>
        </select>

        <textarea
          placeholder="Describe your issue..."
          value={form.issueDescription}
          onChange={(e) => handleChange("issueDescription", e.target.value)}
          className="border p-3 rounded"
        />

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

        {/* DATE */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-600">
            Select Service Date
          </label>

          <input
            type="date"
            value={form.preferredDate}
            min={new Date().toISOString().split("T")[0]}
            onChange={(e) => handleChange("preferredDate", e.target.value)}
            className="border border-gray-200 bg-white px-4 py-2 rounded-xl shadow-sm focus:ring-2 focus:ring-indigo-500"
          />
        </div>

        {/* TIME */}
     <div className="flex flex-col gap-1">
  <label className="text-sm font-medium text-gray-600">
    Select Time (8 AM – 8 PM)
  </label>

  <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
    {Array.from({ length: 13 }, (_, i) => {
      const hour = 8 + i;
      const suffix = hour >= 12 ? "PM" : "AM";
      const display = hour > 12 ? hour - 12 : hour;

      const timeLabel = `${display}:00 ${suffix}`;
      const timeValue = `${hour.toString().padStart(2, "0")}:00`;

      return (
        <button
          key={timeValue}
          type="button"
          onClick={() => handleChange("preferredTime", timeValue)}
          className={`flex-shrink-0 px-4 py-2 rounded-full text-sm border transition
            ${
              form.preferredTime === timeValue
                ? "bg-indigo-600 text-white shadow"
                : "bg-white hover:bg-indigo-50"
            }
          `}
        >
          {timeLabel}
        </button>
      );
    })}
  </div>
</div>

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