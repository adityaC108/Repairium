import React from "react";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";
import Contact from "../components/home/Contact";


const ContactPage = () => {
  return (
    <div className="min-h-screen flex flex-col">
      

      {/* Main Content */}
      <main className="flex-1 pt-16">
        <Contact />
      </main>

    </div>
  );
};

export default ContactPage;