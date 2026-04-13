import React from "react";
import { motion } from "framer-motion";
import { Search, CalendarDays, CheckCircle2 } from "lucide-react";

const steps = [
  { icon: Search, step: "01", title: "Select Service", desc: "Choose the appliance you need fixed" },
  { icon: CalendarDays, step: "02", title: "Book Technician", desc: "Pick a convenient date and time slot" },
  { icon: CheckCircle2, step: "03", title: "Get It Fixed", desc: "Our expert arrives and repairs on-site" },
];

const HowItWorks = () => {
  return (
    <section className="py-24 lg:py-32 bg-background relative">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Heading */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16"
        >
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            Process
          </span>
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3">
            How It Works
          </h2>
        </motion.div>

        {/* Steps */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 relative">

          {/* Line */}
          <div className="hidden md:block absolute top-8 left-[20%] right-[20%] h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

          {steps.map((s, i) => {
            const Icon = s.icon;

            return (
              <motion.div
                key={s.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.2 }}
                className="text-center"
              >
                <motion.div
                  whileHover={{ scale: 1.1 }}
                  className="relative w-16 h-16 rounded-2xl bg-primary text-primary-foreground flex items-center justify-center mx-auto mb-6 shadow-glow"
                >
                  <Icon size={26} />
                  <span className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-accent text-accent-foreground text-xs font-bold flex items-center justify-center">
                    {s.step}
                  </span>
                </motion.div>

                <h3 className="text-xl font-display font-bold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-muted-foreground">{s.desc}</p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;