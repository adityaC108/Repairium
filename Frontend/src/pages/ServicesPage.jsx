import React from "react";
import { motion } from "framer-motion";
import {
  Snowflake, Tv, WashingMachine, Refrigerator, Microwave,
  Droplets, Flame, Wind, UtensilsCrossed, Sparkles, Shield,
} from "lucide-react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";

const allServices = [
  { title: "Refrigerator", icon: Refrigerator, desc: "Compressor, thermostat, leaks & cooling" },
  { title: "Washing Machine", icon: WashingMachine, desc: "Drum, motor, drainage & spin" },
  { title: "Air Conditioner", icon: Snowflake, desc: "Gas refill, cooling & compressor" },
  { title: "Microwave Oven", icon: Microwave, desc: "Heating, turntable & magnetron" },
  { title: "Television", icon: Tv, desc: "Screen, sound & display issues" },
  { title: "Water Purifier", icon: Droplets, desc: "Filter, RO membrane & leaks" },
  { title: "Geyser", icon: Flame, desc: "Heating element & thermostat" },
  { title: "Kitchen Chimney & Hob", icon: Wind, desc: "Suction, motor & auto-clean" },
  { title: "Dishwasher", icon: UtensilsCrossed, desc: "Spray arm, drainage & cycles" },
  { title: "Vacuum Cleaner", icon: Sparkles, desc: "Suction power, filter & motor" },
  { title: "Smart Home Devices", icon: Shield, desc: "Cameras, locks, plugs & switches" },
];

const ServicesPage = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      
      <Navbar />

      {/* Hero */}
      <section
        className="pt-28 pb-20 relative overflow-hidden"
        style={{ background: "var(--hero-gradient)" }}
      >
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage:
              "linear-gradient(hsl(160 84% 39%) 1px, transparent 1px), linear-gradient(90deg, hsl(160 84% 39%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
          }}
        />

        <motion.div
          animate={{ y: [-20, 20, -20] }}
          transition={{ duration: 8, repeat: Infinity }}
          className="absolute top-10 right-[10%] w-64 h-64 rounded-full blur-[120px] opacity-20"
          style={{ background: "hsl(160 84% 39%)" }}
        />

        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <motion.h1 className="text-4xl sm:text-5xl lg:text-6xl font-display font-bold text-foreground mb-4">
            All <span className="text-gradient">Services</span>
          </motion.h1>

          <motion.p className="text-muted-foreground text-lg max-w-xl mx-auto">
            Expert repair for every appliance in your home
          </motion.p>
        </div>
      </section>

      {/* Services Grid */}
      <main className="flex-1 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {allServices.map((s, i) => {
              const Icon = s.icon;

              return (
                <motion.div
                  key={s.title}
                  initial={{ opacity: 0, y: 40 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.05 }}
                  whileHover={{ y: -8 }}
                  className="glass rounded-2xl p-7 cursor-pointer group hover:shadow-card-hover transition-all duration-300"
                >
                  <div className="w-12 h-12 rounded-xl bg-primary/10 text-primary flex items-center justify-center mb-5 group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
                    <Icon size={22} />
                  </div>

                  <h3 className="text-lg font-display font-bold text-foreground mb-2">
                    {s.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {s.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default ServicesPage;