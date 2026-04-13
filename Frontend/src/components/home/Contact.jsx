import React from "react";
import { motion } from "framer-motion";
import { Phone, Mail, ArrowRight } from "lucide-react";

const Contact = () => {
  return (
    <section className="py-24 lg:py-32 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
        >
          {/* Heading */}
          <span className="text-primary font-semibold text-xs uppercase tracking-[0.2em]">
            Get In Touch
          </span>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-display font-bold text-foreground mt-3 mb-10">
            Contact Us
          </h2>

          {/* Contact Cards */}
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center mb-10">
            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl px-6 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Phone size={18} />
              </div>
              <span className="font-medium text-foreground">
                +91 9876543210
              </span>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.05 }}
              className="glass rounded-xl px-6 py-4 flex items-center gap-3"
            >
              <div className="w-10 h-10 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                <Mail size={18} />
              </div>
              <span className="font-medium text-foreground">
                support@repairium.com
              </span>
            </motion.div>
          </div>

          {/* CTA Button */}
          <a
            href="mailto:support@repairium.com"
            className="group inline-flex items-center gap-2 bg-primary text-primary-foreground px-8 py-3.5 rounded-xl font-semibold hover:shadow-glow transition-all duration-300"
          >
            Get Support
            <ArrowRight
              size={16}
              className="group-hover:translate-x-1 transition-transform"
            />
          </a>
        </motion.div>
      </div>
    </section>
  );
};

export default Contact;