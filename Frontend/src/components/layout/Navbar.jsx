import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { FaUserCircle } from "react-icons/fa";
import { MdDashboard, MdLogout, MdMenu, MdClose } from "react-icons/md";
import { Wrench } from "lucide-react";
import useAuth from "../../hooks/useAuth";

const NAV_LINKS = [
  { label: "Services", path: "/services" },
  { label: "About", path: "/about" },
  { label: "Contact", path: "/contact" },
];

const Navbar = () => {
  const { logout, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        scrolled
          ? "bg-background/80 backdrop-blur-xl border-b border-border"
          : "bg-transparent"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-2 group"
          >
            <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center group-hover:bg-primary transition-all">
              <Wrench className="text-primary group-hover:text-primary-foreground" size={18} />
            </div>
            <span className="text-xl font-display font-bold text-foreground">
              Repair<span className="text-primary">ium</span>
            </span>
          </button>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-6">
            {NAV_LINKS.map((link) => (
              <button
                key={link.path}
                onClick={() => navigate(link.path)}
                className="relative text-sm font-medium text-muted-foreground hover:text-foreground transition"
              >
                {link.label}

                {/* Active underline */}
                {isActive(link.path) && (
                  <motion.div
                    layoutId="nav-underline"
                    className="absolute left-0 -bottom-1 w-full h-[2px] bg-primary rounded-full"
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Section */}
          <div className="hidden md:flex items-center gap-3">
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-2 px-3 py-2 rounded-xl hover:bg-muted transition"
                >
                  <FaUserCircle className="text-xl text-muted-foreground" />
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      className="absolute right-0 mt-2 w-48 glass rounded-xl shadow-lg"
                    >
                      <button
                        onClick={() => navigate("/user/dashboard")}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm hover:bg-muted"
                      >
                        <MdDashboard /> Dashboard
                      </button>

                      <button
                        onClick={handleLogout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm text-red-500 hover:bg-muted"
                      >
                        <MdLogout /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground px-5 py-2 rounded-xl font-semibold hover:shadow-glow transition"
              >
                Login
              </button>
            )}
          </div>

          {/* Mobile Menu */}
          <button
            className="md:hidden p-2 rounded-lg text-foreground"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            {mobileOpen ? <MdClose size={22} /> : <MdMenu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Dropdown */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden glass border-t border-border"
          >
            <div className="px-4 py-4 flex flex-col gap-2">
              {NAV_LINKS.map((link) => (
                <button
                  key={link.path}
                  onClick={() => navigate(link.path)}
                  className="text-left px-4 py-3 rounded-lg hover:bg-muted"
                >
                  {link.label}
                </button>
              ))}

              <button
                onClick={() => navigate("/login")}
                className="bg-primary text-primary-foreground px-4 py-3 rounded-xl mt-2"
              >
                Login
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default Navbar;