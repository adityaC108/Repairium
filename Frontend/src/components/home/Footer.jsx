import React from "react";
import { Link } from "react-router-dom";
import { Wrench } from "lucide-react";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaXTwitter,
} from "react-icons/fa6";

const Footer = () => {

  // Manual Color Definitions (since no Tailwind config is defined)
  const colors = {
    primary: "#4f46e5", // Indigo 600
    primaryHover: "#4338ca", // Indigo 700
    dark: "#0f172a", // Slate 900
    textMain: "#1e293b", // Slate 800
    textMuted: "#556274", // Slate 500
    border: "#e2e8f0", // Slate 200
  };
  
  return (
    <footer className="bg-muted/40  mt-20">
      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-16">
        {/* 🔥 MAIN GRID */}
        <div className="grid md:grid-cols-4 gap-10">
          {/* ================= LOGO + SOCIAL ================= */}
          <div>
            {/* Logo (same as Navbar) */}
            <Link to="/" className="flex items-center gap-3 group no-underline">
              <div
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg"
                style={{ backgroundColor: colors.dark }}
              >
                <Wrench className="text-white" size={20} />
              </div>
              <div className="flex flex-col">
                <span
                  className="text-xl font-black tracking-tighter leading-none uppercase"
                  style={{ color: colors.dark }}
                >
                  Repair<span style={{ color: colors.primary }}>ium</span>
                </span>
                <span
                  className="text-[9px] font-extrabold tracking-[0.3em] uppercase"
                  style={{ color: colors.textMuted }}
                >
                  Expert Fix
                </span>
              </div>
            </Link>
            <br />

            <p className="text-sm text-muted-foreground mb-4">
              Your trusted platform for fast, reliable home appliance repair
              services.
            </p>

            {/* Social Icons */}
            <div className="flex gap-4 text-muted-foreground text-lg">
              <a
                href="https://www.instagram.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaInstagram className="cursor-pointer hover:text-foreground transition" />
              </a>

              <a
                href="https://x.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaXTwitter className="cursor-pointer hover:text-foreground transition" />
              </a>

              <a
                href="https://www.facebook.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaFacebookF className="cursor-pointer hover:text-foreground transition" />
              </a>

              <a
                href="https://www.linkedin.com/"
                target="_blank"
                rel="noopener noreferrer"
              >
                <FaLinkedinIn className="cursor-pointer hover:text-foreground transition" />
              </a>
            </div>
          </div>

          {/* ================= QUICK LINKS ================= */}
          <div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wide">
              Quick Links
            </h3>

            <div className="flex flex-col gap-2 text-sm">
              <Link
                to="/services"
                className="text-muted-foreground hover:text-foreground"
              >
                Services
              </Link>
              <Link
                to="/about"
                className="text-muted-foreground hover:text-foreground"
              >
                About Us
              </Link>
              <Link
                to="/contact"
                className="text-muted-foreground hover:text-foreground"
              >
                Contact Us
              </Link>
            </div>
          </div>

          {/* ================= OUR SERVICES ================= */}
          <div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wide">
              Our Services
            </h3>

            <div className="flex flex-col gap-2 text-sm text-muted-foreground">
              <span>AC Repair</span>
              <span>Washing Machine</span>
              <span>Refrigerator</span>
              <span>TV Repair</span>
              <span>Microwave</span>
              <span>Fan Repair</span>
            </div>
          </div>

          {/* ================= APP DOWNLOAD ================= */}
          <div>
            <h3 className="text-sm font-bold mb-4 uppercase tracking-wide">
              Get Our App
            </h3>

            <div className="flex flex-col gap-4">
              {/* Google Play */}
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg"
                alt="Google Play"
                className="w-40 cursor-pointer"
              />

              {/* App Store */}
              <img
                src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg"
                alt="App Store"
                className="w-40 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* 🔥 BOTTOM */}
        <div className=" mt-12 pt-6 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Repairium. All rights reserved.
        </div>
      </div>
    </footer>
  );
};;

export default Footer;