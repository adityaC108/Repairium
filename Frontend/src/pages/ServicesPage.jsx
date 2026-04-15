import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import Navbar from "../components/layout/Navbar";
import Footer from "../components/home/Footer";
import API from "../services/api";
import { Navigate } from "react-router-dom";
import { useNavigate } from "react-router-dom";

const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [filtered, setFiltered] = useState([]);

  const [brands, setBrands] = useState([]);
  const [categories, setCategories] = useState([]);

  const [selectedBrand, setSelectedBrand] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");

  const navigate = useNavigate();

  useEffect(() => {
    const fetchAppliances = async () => {
      try {
        const res = await API.get("/appliances");

        const data = res.data.data.data;

        setServices(data);
        setFiltered(data);

        // Extract unique brands & categories
        const uniqueBrands = [...new Set(data.map((item) => item.brand))];
        const uniqueCategories = [...new Set(data.map((item) => item.category))];

        setBrands(uniqueBrands);
        setCategories(uniqueCategories);

      } catch (err) {
        console.error(err);
      }
    };

    fetchAppliances();
  }, []);

  // 🔥 Filter logic
  useEffect(() => {
    let temp = [...services];

    if (selectedBrand) {
      temp = temp.filter((item) => item.brand === selectedBrand);
    }

    if (selectedCategory) {
      temp = temp.filter((item) => item.category === selectedCategory);
    }

    setFiltered(temp);
  }, [selectedBrand, selectedCategory, services]);

  return (
    <div className="min-h-screen flex flex-col bg-background">

      {/* Hero */}
      <section className="pt-28 pb-10 text-center">
        <h1 className="text-4xl font-bold">All Services</h1>
        <p className="text-gray-500">Filter by brand & category</p>
      </section>

      {/* 🔥 Filters */}
      <div className="max-w-7xl mx-auto px-4 mb-10 flex flex-wrap gap-4 justify-center">

        {/* Brand Filter */}
        <select
          value={selectedBrand}
          onChange={(e) => setSelectedBrand(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="">All Brands</option>
          {brands.map((b) => (
            <option key={b} value={b}>{b}</option>
          ))}
        </select>

        {/* Category Filter */}
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
          className="px-4 py-2 rounded-lg border"
        >
          <option value="">All Categories</option>
          {categories.map((c) => (
            <option key={c} value={c}>{c}</option>
          ))}
        </select>

      </div>

      {/* Grid */}
      <main className="flex-1 py-10">
        <div className="max-w-7xl mx-auto px-4">

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">

            {filtered.map((s, i) => (
              <motion.div
                key={s._id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                onClick={() => navigate(`/book/${s._id}`)}
                className="bg-slate-100 rounded-2xl p-6 hover:shadow-lg transition"
              >
                <h3 className="font-bold text-lg mb-2">{s.name}</h3>

                <p className="text-sm text-gray-600 mb-2">
                  {s.brand} • {s.category}
                </p>

                <p className="text-sm text-gray-500 mb-3">
                  {s.description}
                </p>

                <p className="text-primary font-semibold">
                  ₹{s.totalPrice}
                </p>

                <p className="text-xs text-gray-400 mt-2">
                  {s.estimatedServiceTime} mins
                </p>
              </motion.div>
            ))}

          </div>

          {/* Empty state */}
          {filtered.length === 0 && (
            <p className="text-center mt-10 text-gray-500">
              No services found 😢
            </p>
          )}

        </div>
      </main>   
    </div>
  );
};

export default ServicesPage;