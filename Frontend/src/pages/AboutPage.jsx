import React from "react";
import Navbar from "../components/layout/Navbar";
import AboutSection from "../components/home/About";
import Footer from "../components/home/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Content */}
      <div className="pt-16">
        <AboutSection />
      </div>

    </div>
  );
};

export default AboutPage;