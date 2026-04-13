import React from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { ArrowRight, Sparkles, Star } from "lucide-react";

const HeroSection = () => {
  const navigate = useNavigate();

  return (
    <section
      className="relative min-h-screen flex items-center justify-center overflow-hidden"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Grid Background */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(hsl(160 84% 39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)",
          backgroundSize: "60px 60px",
        }}
      />

      {/* Floating Orbs */}
      <motion.div
        animate={{ y: [-20, 20, -20], x: [-10, 10, -10] }}
        transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        className="absolute top-1/4 right-[15%] w-72 h-72 rounded-full blur-[120px] opacity-30"
        style={{ background: "hsl(160 84% 39%)" }}
      />

      <motion.div
        animate={{ y: [15, -15, 15], x: [10, -10, 10] }}
        transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        className="absolute bottom-1/4 left-[10%] w-64 h-64 rounded-full blur-[120px] opacity-20"
        style={{ background: "hsl(42 92% 56%)" }}
      />

      <div className="relative z-10 max-w-5xl mx-auto px-4 text-center">
        {/* Trust Badge */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="inline-flex items-center gap-2 glass rounded-full px-4 py-1.5 mb-8"
        >
          <Sparkles size={14} className="text-accent" />
          <span className="text-sm font-medium text-muted-foreground">
            Trusted by 10,000+ happy customers
          </span>

          <div className="flex -space-x-1">
            {[...Array(5)].map((_, i) => (
              <Star
                key={i}
                size={12}
                className="text-accent fill-accent"
              />
            ))}
          </div>
        </motion.div>

        {/* Heading */}
        <motion.h1
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.7 }}
          className="text-5xl sm:text-6xl lg:text-7xl font-display font-bold leading-[1.1] mb-6"
        >
          <span className="text-foreground">Fast & Reliable</span>
          <br />
          <span className="text-gradient">Appliance Repair</span>
        </motion.h1>

        {/* Description */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto mb-10 leading-relaxed"
        >
          Book verified technicians near you in seconds. We fix refrigerators,
          ACs, washing machines, and 8+ more appliance categories.
        </motion.p>

        {/* Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.65 }}
          className="flex flex-col sm:flex-row gap-4 justify-center"
        >
          <button
            onClick={() => navigate("/services")}
            className="group bg-primary text-primary-foreground px-8 py-4 rounded-xl font-bold text-base hover:shadow-glow transition-all duration-300 flex items-center justify-center gap-2"
          >
            Book a Service
            <ArrowRight
              size={18}
              className="group-hover:translate-x-1 transition-transform"
            />
          </button>

          <button
            onClick={() => navigate("/contact")}
            className="glass px-8 py-4 rounded-xl font-semibold text-foreground hover:bg-secondary transition-all duration-300"
          >
            Contact Us
          </button>
        </motion.div>

        {/* Stats */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.85 }}
          className="mt-16 glass rounded-2xl p-6 max-w-2xl mx-auto grid grid-cols-3 divide-x divide-border"
        >
          {[
            { value: "50K+", label: "Repairs Done" },
            { value: "200+", label: "Expert Technicians" },
            { value: "4.9★", label: "Customer Rating" },
          ].map((stat) => (
            <div key={stat.label} className="text-center px-4">
              <div className="text-2xl font-display font-bold text-primary">
                {stat.value}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {stat.label}
              </div>
            </div>
          ))}
        </motion.div>
      </div>
    </section>
  );
};

export default HeroSection;