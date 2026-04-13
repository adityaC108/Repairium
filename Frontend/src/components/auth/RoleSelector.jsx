import React from "react";
import { motion } from "framer-motion";
import { User, Wrench, Shield } from "lucide-react";

const roles = [
  { name: "user", label: "User", icon: User },
  { name: "technician", label: "Technician", icon: Wrench },
  { name: "admin", label: "Admin", icon: Shield },
];

const RoleSelector = ({ setRole }) => {
  return (
    <div
      className="min-h-screen flex items-center justify-center px-4"
      style={{ background: "var(--hero-gradient)" }}
    >
      {/* Glow */}
           <div className="absolute w-72 h-72 bg-gray-500 blur-[220px] rounded-full bottom-20 left-10" />
      <div className="absolute w-72 h-72 bg-slate-500 blur-[150px] rounded-full top-20 right-10" />

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative w-full max-w-md glass rounded-2xl p-8 shadow-xl bg-slate-100"
      >
        <h2 className="text-2xl font-display font-bold text-center mb-6">
          Choose Your Role
        </h2>

        <div className="flex flex-col gap-4">
          {roles.map((role) => {
            const Icon = role.icon;

            return (
              <motion.button
                key={role.name}
                whileHover={{ scale: 1.03 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setRole(role.name)}
                className="w-full flex items-center gap-3 px-5 py-3 rounded-xl
                bg-primary/10 text-foreground border border-border
                hover:bg-primary hover:text-primary-foreground transition"
              >
                {/* Icon */}
                <Icon size={18} />

                {/* Text */}
                <span>{role.label}</span>
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;  