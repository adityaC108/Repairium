import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import {
  FaSnowflake,
  FaTv,
  FaBlender,
  FaFan,
} from "react-icons/fa";

const Services = () => {
  const navigate = useNavigate();

  const services = [
    { title: "AC Repair", icon: <FaSnowflake /> },
    { title: "Washing Machine", icon: <FaBlender /> },
    { title: "Fridge Repair", icon: <FaFan /> },
    { title: "TV Repair", icon: <FaTv /> },
  ];

  const handleClick = (service) => {
    navigate("/services", { state: { service } }); // 👈 pass selected service
  };

  return (
    <div className="py-16 px-6 bg-white text-center">
      <h2 className="text-3xl font-bold mb-10">Our Services</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-5xl mx-auto">
        {services.map((s, i) => (
          <motion.div
            key={i}
            whileHover={{ scale: 1.05 }}
            onClick={() => handleClick(s.title)}
            className="p-6 bg-gray-50 rounded-xl shadow-sm hover:shadow-xl transition cursor-pointer flex flex-col items-center"
          >
            <div className="text-4xl text-blue-500">{s.icon}</div>
            <h3 className="mt-3 font-semibold">{s.title}</h3>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default Services;