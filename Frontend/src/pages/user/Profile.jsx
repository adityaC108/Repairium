import React, { useEffect, useState } from "react";
import API from "../../services/api";

const Profile = () => {
  const [user, setUser] = useState(null);

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    street: "",
    city: "",
    state: "",
    pincode: ""
  });

  // 🔥 Fetch user profile
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const res = await API.get("/users/profile");

        const u = res.data.data.user;


        setUser(u);

        setForm({
          firstName: u.firstName || "",
          lastName: u.lastName || "",
          phone: u.phone || "",
          street: u.address?.street || "",
          city: u.address?.city || "",
          state: u.address?.state || "",
          pincode: u.address?.pincode || ""
        });

      } catch (err) {
        console.error(err);
      }
    };

    fetchProfile();
  }, []);

  // 🔥 Update profile
  const handleUpdate = async () => {
    try {
      const payload = {
        firstName: form.firstName,
        lastName: form.lastName,
        phone: form.phone,
        address: {
          street: form.street,
          city: form.city,
          state: form.state,
          pincode: form.pincode,
          coordinates: {
            type: "Point",
            coordinates: [0, 0]
          }
        }
      };

      const res = await API.put("/users/profile", payload);


      // ✅ update localStorage also
      localStorage.setItem("user", JSON.stringify(res.data.data.user));

      alert("Profile Updated ✅");

    } catch (err) {
      console.error(err);
      alert("Update Failed ❌");
    }
  };

  if (!user) return <p className="text-center mt-20">Loading...</p>;

  return (
    <div className="max-w-3xl mx-auto mt-20 p-6">

      <h1 className="text-2xl font-bold mb-6">My Profile</h1>

      <div className="grid gap-4">

        <input
          value={form.firstName}
          onChange={(e) => setForm({ ...form, firstName: e.target.value })}
          placeholder="First Name"
          className="border p-2 rounded"
        />

        <input
          value={form.lastName}
          onChange={(e) => setForm({ ...form, lastName: e.target.value })}
          placeholder="Last Name"
          className="border p-2 rounded"
        />

        <input
          value={form.phone}
          onChange={(e) => setForm({ ...form, phone: e.target.value })}
          placeholder="Phone"
          className="border p-2 rounded"
        />

        {/* Address */}
        <input
          value={form.street}
          onChange={(e) => setForm({ ...form, street: e.target.value })}
          placeholder="Street"
          className="border p-2 rounded"
        />

        <input
          value={form.city}
          onChange={(e) => setForm({ ...form, city: e.target.value })}
          placeholder="City"
          className="border p-2 rounded"
        />

        <input
          value={form.state}
          onChange={(e) => setForm({ ...form, state: e.target.value })}
          placeholder="State"
          className="border p-2 rounded"
        />

        <input
          value={form.pincode}
          onChange={(e) => setForm({ ...form, pincode: e.target.value })}
          placeholder="Pincode"
          className="border p-2 rounded"
        />

        <button
          onClick={handleUpdate}
          className="bg-black text-white py-3 rounded-xl mt-4"
        >
          Update Profile 🚀
        </button>

      </div>
    </div>
  );
};

export default Profile;