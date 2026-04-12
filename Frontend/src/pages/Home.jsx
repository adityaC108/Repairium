import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";

import Services from "../components/home/Services";
import About from "../components/home/About";
import Contact from "../components/home/Contact";

const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="bg-white text-gray-900">

      {/* HERO SECTION */}
      <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white py-24 px-6 text-center">
        <motion.h1
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-4xl md:text-6xl font-bold"
        >
          Fast & Reliable Appliance Repair
        </motion.h1>

        <p className="mt-4 text-lg opacity-90">
          Book trusted technicians near you in seconds
        </p>

        <div className="mt-8 flex justify-center gap-4">
          <button
            onClick={() => navigate("/services")}
            className="bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:scale-105 transition"
          >
            Book Service
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="border border-white px-6 py-3 rounded-lg hover:bg-white hover:text-blue-600 transition"
          >
            Contact Us
          </button>
        </div>
      </div>

      {/* SERVICES */}
      <Services />

      {/* WHY CHOOSE US */}
      <div className="py-16 px-6 bg-gray-50 text-center">
        <h2 className="text-3xl font-bold mb-10">Why Choose Us</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div className="p-6 bg-white rounded-xl shadow">
            ⚡ Fast Service
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            🛠 Verified Experts
          </div>
          <div className="p-6 bg-white rounded-xl shadow">
            💳 Secure Payments
          </div>
        </div>
      </div>

      {/* HOW IT WORKS */}
      <div className="py-16 px-6 text-center">
        <h2 className="text-3xl font-bold mb-10">How It Works</h2>

        <div className="grid md:grid-cols-3 gap-6 max-w-5xl mx-auto">
          <div>1️⃣ Select Service</div>
          <div>2️⃣ Book Technician</div>
          <div>3️⃣ Get It Fixed</div>
        </div>
      </div>

      {/* ABOUT */}
      <About />

      {/* CONTACT */}
      <Contact />
    </div>
  );
};

export default Home;