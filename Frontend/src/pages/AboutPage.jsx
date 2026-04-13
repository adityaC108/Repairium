import React from "react";
import Navbar from "../components/layout/Navbar";
import AboutSection from "../components/home/About";
import Footer from "../components/home/Footer";

const AboutPage = () => {
  return (
    <div className="min-h-screen">
      {/* Navbar */}
      <Navbar />

      {/* Content */}
      <div className="pt-16">
        <AboutSection />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
};

export default AboutPage;