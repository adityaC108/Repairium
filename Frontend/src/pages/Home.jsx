import React from "react";
import Navbar from "../components/layout/Navbar";
import HeroSection from "../components/home/HeroSection";
import ServicesPreview from "../components/home/Services";
import WhyChooseUs from "../components/home/WhyChooseUs";
import HowItWorks from "../components/home/HowItWorks.jsx";
import AboutSection from "../components/home/About";
import ContactSection from "../components/home/Contact";
import Footer from "../components/home/Footer";

const Home = () => {
  return (
    <div className="min-h-screen flex flex-col">
      
      {/* Main Content */}
      <main className="flex-1 pt-20">
        <HeroSection />
        <ServicesPreview />
        <WhyChooseUs />
        <HowItWorks />
        <AboutSection />
        <ContactSection />
      </main>
      
    </div>
  );
};

export default Home;