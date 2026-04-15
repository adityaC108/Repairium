import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight } from "lucide-react";
import API from "../../services/api"; // make sure path correct

const Services = () => {
  const navigate = useNavigate();
  const [services, setServices] = useState([]);

  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const res = await API.get("/appliances?limit=4"); // only 4 for preview
        setServices(res.data.data.data); // pagination structure
      } catch (err) {
        console.error(err);
      }
    };

    fetchAppliances();
  }, []);

  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            What We Fix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mt-3">
            Our Popular Services
          </h2>
        </div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {services.map((s, i) => (
            <motion.div
              key={s._id}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="bg-slate-100 rounded-2xl p-7 group cursor-pointer hover:scale-[1.03] transition"
            >
              <h3 className="text-lg font-bold mb-2">
                {s.name}
              </h3>

              <p className="text-sm text-gray-600 mb-4">
                {s.description || "Expert repair service"}
              </p>

              <p className="text-primary font-semibold">
                ₹{s.basePrice + s.serviceCharge}
              </p>
            </motion.div>
          ))}
        </div>

        {/* Button */}
        <div className="text-center mt-14">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 mx-auto bg-black text-white px-6 py-3 rounded-xl"
          >
            View All Services <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Services;