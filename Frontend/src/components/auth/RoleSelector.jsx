import React from "react";
import { motion } from "framer-motion";

const roles = [
  { name: "user", label: "User 👤", color: "from-blue-500 to-indigo-600" },
  { name: "technician", label: "Technician 🛠️", color: "from-green-500 to-emerald-600" },
  { name: "admin", label: "Admin 🧑‍💼", color: "from-purple-500 to-pink-600" },
];

const RoleSelector = ({ setRole }) => {
  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-gradient-to-br from-gray-900 via-gray-800 to-black px-4">
      
      {/* SAME CARD STYLE AS LOGIN */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-md bg-white/10 backdrop-blur-xl border border-white/20 rounded-2xl p-8 shadow-2xl"
      >
        <h2 className="text-2xl font-bold text-white text-center mb-6">
          Choose Your Role
        </h2>

        <div className="flex flex-col gap-4">
          {roles.map((role) => (
            <motion.button
              key={role.name}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setRole(role.name)}
              className={`w-full py-3 rounded-xl bg-gradient-to-r ${role.color} text-white font-medium shadow-lg`}
            >
              {role.label}
            </motion.button>
          ))}
        </div>
      </motion.div>
    </div>
  );
};

export default RoleSelector;