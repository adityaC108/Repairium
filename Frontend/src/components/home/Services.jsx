import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  Snowflake,
  Tv,
  WashingMachine,
  Refrigerator,
  Microwave,
  Fan,
  ArrowRight
} from "lucide-react";

const services = [
  {
    title: "AC Repair",
    icon: Snowflake,
    desc: "Cooling issues, gas refill & maintenance"
  },
  {
    title: "Washing Machine",
    icon: WashingMachine,
    desc: "Drum, motor & drainage fixes"
  },
  {
    title: "Refrigerator",
    icon: Refrigerator,
    desc: "Compressor, cooling & leakage repair"
  },
  {
    title: "TV Repair",
    icon: Tv,
    desc: "Display, sound & panel issues"
  },
  {
    title: "Microwave",
    icon: Microwave,
    desc: "Heating, wiring & control panel repair"
  },
  {
    title: "Fan Repair",
    icon: Fan,
    desc: "Motor, speed & noise issues"
  }
];

const Services = () => {
  const navigate = useNavigate();

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
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {services.map((s, i) => {
            const Icon = s.icon;

            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate("/services")}
                className="bg-slate-100 rounded-2xl p-6 group cursor-pointer hover:shadow-lg hover:scale-[1.03] transition"
              >
                {/* Icon */}
                <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-500 text-white mb-4 group-hover:bg-primary transition">
                  <Icon size={22} />
                </div>

                {/* Title */}
                <h3 className="text-lg font-bold mb-2 group-hover:text-primary transition">
                  {s.title}
                </h3>

                {/* Description */}
                <p className="text-sm text-gray-600 mb-3">
                  {s.desc}
                </p>

                {/* CTA */}
                <span className="text-sm text-primary  group-hover:opacity-100 transition">
                  Explore →
                </span>
              </motion.div>
            );
          })}
        </div>

        {/* Button */}
        <div className="text-center mt-14">
          <button
            onClick={() => navigate("/services")}
            className="flex items-center gap-2 mx-auto bg-gradient-to-r from-white/80 to-slate-400 
                       text-black font-semibold px-6 py-3 rounded-xl hover:scale-105 transition"
          >
            View All Services <ArrowRight size={16} />
          </button>
        </div>

      </div>
    </section>
  );
};

export default Services;