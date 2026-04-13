import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Snowflake, Tv, WashingMachine, Refrigerator, ArrowRight } from "lucide-react";

const previewServices = [
  { title: "AC Repair", icon: Snowflake, desc: "Cooling issues, gas refill & maintenance" },
  { title: "Washing Machine", icon: WashingMachine, desc: "Drum, motor & drainage fixes" },
  { title: "Refrigerator", icon: Refrigerator, desc: "Compressor, thermostat & leak repair" },
  { title: "TV Repair", icon: Tv, desc: "Screen, sound & display issues" },
];

const Services = () => {
  const navigate = useNavigate();

  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            What We Fix
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3">
            Our Popular Services
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {previewServices.map((s, i) => {
            const Icon = s.icon;

            return (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                whileHover={{ y: -8 }}
                onClick={() => navigate("/services")}
                className="glass rounded-2xl p-7 cursor-pointer group hover:shadow-card-hover transition-all duration-300"
              >
                <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                  <Icon size={22} />
                </div>

                <h3 className="text-lg font-display font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>

        {/* Button */}
        <motion.div className="text-center mt-14">
          <button
            onClick={() => navigate("/services")}
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-7 py-3 rounded-xl font-semibold hover:shadow-glow transition-all duration-300"
          >
            View All Services
            <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
          </button>
        </motion.div>

      </div>
    </section>
  );
};

export default Services;