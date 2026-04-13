import React from "react";
import { motion } from "framer-motion";
import { Zap, ShieldCheck, CreditCard } from "lucide-react";

const reasons = [
  { icon: Zap, title: "Fast Service", desc: "Same-day repairs with quick turnaround times guaranteed" },
  { icon: ShieldCheck, title: "Verified Experts", desc: "Background-checked, certified professional technicians" },
  { icon: CreditCard, title: "Secure Payments", desc: "Pay only after the job is completed to your satisfaction" },
];

const WhyChooseUs = () => {
  return (
    <section className="py-24 lg:py-32 relative overflow-hidden">

      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-b from-background via-muted/30 to-background" />

      <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div className="text-center mb-16">
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            Why Us
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3">
            Why Choose Repairium
          </h2>
        </motion.div>

        {/* Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {reasons.map((r, i) => {
            const Icon = r.icon;

            return (
              <motion.div
                key={r.title}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <motion.div
                  whileHover={{ rotate: 5 }}
                  className="w-16 h-16 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mx-auto mb-6"
                >
                  <Icon size={26} />
                </motion.div>

                <h3 className="text-xl font-display font-bold text-foreground mb-3">
                  {r.title}
                </h3>
                <p className="text-muted-foreground">{r.desc}</p>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};

export default WhyChooseUs;