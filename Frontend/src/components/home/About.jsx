import React from "react";
import { motion } from "framer-motion";

const About = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* ================= ABOUT HEADING ================= */}
        <div className="text-center mb-20">
          <span className="text-primary font-semibold text-sm uppercase tracking-[0.2em]">
            About
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mt-3">
            About Repairium
          </h2>
        </div>

        {/* ================= HOW REPAIRIUM STARTED ================= */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="max-w-3xl mx-auto space-y-6 mb-24 text-left"
        >
          <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase block text-center">
            HOW REPAIRIUM STARTED
          </span>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Repairium was founded in 2026 by a team of ADYPU postgraduates who
            faced the challenge of finding reliable home appliance repair
            services in Indian cities. What started as a simple idea quickly
            grew into a structured digital platform.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed">
            To address issues of trust, transparency, and convenience, Repairium
            was built to streamline the entire service process i.e. from
            technician verification and booking management to secure payments
            and real-time tracking.
          </p>

          <p className="text-muted-foreground text-lg leading-relaxed">
            Today, Repairium operates across 5 cities in India, serving over
            50,000 households by connecting them with trusted professionals and
            reliable repair solutions.
          </p>
        </motion.div>

        {/* ================= WHAT WE STAND FOR ================= */}
        <div className="text-center mb-12">
          <span className="text-primary text-xs font-semibold tracking-[0.3em] uppercase">
            WHAT WE STAND FOR
          </span>
        </div>

        {/* ================= VALUE CARDS ================= */}
        <div className="grid md:grid-cols-2 gap-6">
          {/* CARD 1 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-300 rounded-2xl p-6 bg-white/40 backdrop-blur-md"
          >
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Trust & Reliability
            </h4>
            <p className="text-muted-foreground">
              We prioritize customer safety and confidence by onboarding
              verified and skilled technicians. Every service provider undergoes
              proper validation to ensure users receive dependable and
              high-quality service.
            </p>
          </motion.div>

          {/* CARD 2 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-300 rounded-2xl p-6 bg-white/40 backdrop-blur-md"
          >
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Convenience & Accessibility
            </h4>
            <p className="text-muted-foreground">
              Repairium enables users to book repair services anytime, anywhere.
              With an intuitive interface, users can browse services, schedule
              appointments, and track service status with ease.
            </p>
          </motion.div>

          {/* CARD 3 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-300 rounded-2xl p-6 bg-white/40 backdrop-blur-md"
          >
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Transparency & Efficiency
            </h4>
            <p className="text-muted-foreground">
              From clear pricing to real-time service updates, Repairium ensures
              complete transparency throughout the service journey. Our
              streamlined process reduces delays and enhances overall
              efficiency.
            </p>
          </motion.div>

          {/* CARD 4 */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            className="border border-gray-300 rounded-2xl p-6 bg-white/40 backdrop-blur-md"
          >
            <h4 className="text-lg font-semibold text-foreground mb-2">
              Empowering Technicians
            </h4>
            <p className="text-muted-foreground">
              We provide technicians with a platform to manage bookings,
              showcase their skills, and expand their reach. Repairium supports
              them in building a sustainable and flexible source of income.
            </p>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default About;