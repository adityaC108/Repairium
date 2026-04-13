import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";

const Footer = () => {
  return (
    <footer className="border-t border-border bg-card/50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        
        {/* Top Section */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          
          {/* Logo */}
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
              <Wrench size={16} className="text-primary" />
            </div>
            <span className="text-lg font-display font-bold text-foreground">
              Repair<span className="text-primary">ium</span>
            </span>
          </div>

          {/* Navigation Links */}
          <div className="flex gap-8 text-sm">
            <Link
              to="/services"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Services
            </Link>
            <Link
              to="/about"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              About
            </Link>
            <Link
              to="/contact"
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              Contact
            </Link>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="border-t border-border mt-8 pt-6 text-center text-xs text-muted-foreground">
          © {new Date().getFullYear()} Repairium. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;