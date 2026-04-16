// import React from "react";
// import { motion } from "framer-motion";
// import { Phone, Mail, ArrowRight } from "lucide-react";

// const Contact = () => {
//   return (
//     <section className="py-24 lg:py-32 bg-background">
//       <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
//         <motion.div
//           initial={{ opacity: 0, y: 20 }}
//           whileInView={{ opacity: 1, y: 0 }}
//           viewport={{ once: true }}
//         >
//           {/* Heading */}
//           <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
//             Get In Touch
//           </span>

//           <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-10">
//             Contact Us
//           </h2>

//           {/* Contact Cards */}
//           <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="glass rounded-xl px-6 py-4 flex items-center gap-3"
//             >
//               <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
//                 <Phone size={18} />
//               </div>
//               <span className="font-medium text-foreground">
//                 +91 9876543210
//               </span>
//             </motion.div>

//             <motion.div
//               whileHover={{ scale: 1.05 }}
//               className="glass rounded-xl px-6 py-4 flex items-center gap-3"
//             >
//               <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
//                 <Mail size={18} />
//               </div>
//               <span className="font-medium text-foreground">
//                 support@repairium.com
//               </span>
//             </motion.div>
//           </div>

//           {/* CTA Button */}
//              <a
//             href="mailto:support@repairium.com"
//             className="group inline-flex items-center justify-center gap-2
//                        bg-gradient-to-r from-white/80 to-slate-400
//                        text-black px-8 py-4 rounded-xl font-semibold
//                        hover:scale-105 hover:shadow-lg transition-all duration-300"
//           >
//             Get Support
//             <ArrowRight
//               size={16}
//               className="group-hover:translate-x-1 transition-transform"
//             />
//           </a>
//         </motion.div>
//       </div>
//     </section>
//   );
// };

// export default Contact;

import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, MapPin } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* 🔹 Heading */}
        <div className="text-center mb-16">
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            Get In Touch
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3">
            Contact Us
          </h2>
        </div>

        {/* 🔥 MAIN GRID */}
        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* ================= LEFT SIDE ================= */}
          <div className="space-y-10">
            {/* Phone */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                <Phone size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">
                  +91 9876543210
                </h4>
                <p className="text-muted-foreground text-sm">
                  24/7 support. Give us a call.
                </p>
              </div>
            </div>

            {/* Email */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                <Mail size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">
                  support@repairium.com
                </h4>
                <p className="text-muted-foreground text-sm">
                  For technical issues and requests.
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="flex items-start gap-4">
              <div className="w-12 h-12 border border-gray-300 rounded-lg flex items-center justify-center">
                <MapPin size={20} />
              </div>
              <div>
                <h4 className="font-semibold text-foreground text-lg">Pune</h4>
                <p className="text-muted-foreground text-sm">Maharashtra</p>
              </div>
            </div>
          </div>

          {/* ================= RIGHT SIDE (FORM) ================= */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            className="border border-gray-200 rounded-2xl p-8 bg-white/40 backdrop-blur-md"
          >
            <form className="space-y-6">
              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Name 
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Email 
                </label>
                <input
                  type="email"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Subject
                </label>
                <input
                  type="text"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium mb-1">
                  Your Message
                </label>
                <textarea
                  rows="5"
                  className="w-full border border-gray-300 rounded-lg px-4 py-2"
                ></textarea>
              </div>

              <button
                type="submit"
                className="bg-gray-900 text-white px-6 py-2 rounded-lg hover:bg-black transition"
              >
                Send
              </button>
            </form>
          </motion.div>
        </div>
      </div>
    </section>
  );
};

export default Contact;