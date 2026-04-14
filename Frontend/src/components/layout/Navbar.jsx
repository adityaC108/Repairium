import React, { useState, useRef, useEffect } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { 
  LayoutDashboard, 
  LogOut, 
  Menu, 
  X, 
  Wrench, 
  User as UserIcon, 
  ChevronDown, 
  Settings,
  ShieldCheck,
  BadgeCheck,
  Bell
} from "lucide-react";
import useAuth from "../../hooks/useAuth";
import NotificationDropdown from "../NotificationDropdown";
import notificationService from "../../services/notificationService";

const Navbar = () => {
  const { logout, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const dropdownRef = useRef(null);

  // Manual Color Definitions (since no Tailwind config is defined)
  const colors = {
    primary: "#4f46e5", // Indigo 600
    primaryHover: "#4338ca", // Indigo 700
    dark: "#0f172a", // Slate 900
    textMain: "#1e293b", // Slate 800
    textMuted: "#556274", // Slate 500
    border: "#e2e8f0", // Slate 200
  };

  const roleRoutes = {
    user: "/user/dashboard",
    technician: "/technician/dashboard",
    admin: "/admin/dashboard",
  };
  const dashboardPath = roleRoutes[user?.role] || "/user/dashboard";

  const NAV_LINKS = [
    { label: "Services", path: "/services" },
    { label: "About Us", path: "/about" },
    { label: "Contact", path: "/contact" },
  ];

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 15);
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
      className={`fixed top-0 left-0 right-0 z-[100] transition-all duration-300 ${
        scrolled
          ? "py-3 bg-gray-100/90 backdrop-blur-md border-b"
          : "py-5 bg-transparent"
      }`}
      style={{ borderColor: scrolled ? colors.border : "transparent" }}
    >
      <div className="max-w-7xl mx-auto px-6 lg:px-8">
        <div className="flex items-center justify-between">
          
          {/* Logo Section */}
          <Link to="/" className="flex items-center gap-3 group no-underline">
            <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center transition-transform group-hover:rotate-12 shadow-lg"
                style={{ backgroundColor: colors.dark }}
            >
              <Wrench className="text-white" size={20} />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-black tracking-tighter leading-none uppercase" style={{ color: colors.dark }}>
                Repair<span style={{ color: colors.primary }}>ium</span>
              </span>
              <span className="text-[9px] font-extrabold tracking-[0.3em] uppercase" style={{ color: colors.textMuted }}>
                Expert Fix
              </span>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center gap-2 p-1 rounded-2xl bg-slate-400/50">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-5 py-2 rounded-xl text-sm font-bold transition-all no-underline ${
                  location.pathname === link.path
                    ? "bg-white shadow-sm"
                    : "hover:text-slate-900"
                }`}
                style={{ 
                    color: location.pathname === link.path ? colors.primary : colors.textMuted 
                }}
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* Action Area */}
          <div className="flex items-center gap-4">
            {/* Notification Dropdown - Added to left of existing actions */}
            {isAuthenticated && (
              <div className="relative">
                <NotificationDropdown />
              </div>
            )}
            
            {isAuthenticated ? (
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen(!dropdownOpen)}
                  className="flex items-center gap-3 p-1.5 pl-4 bg-white border rounded-2xl shadow-sm hover:shadow-md transition-all group"
                  style={{ borderColor: colors.border }}
                >
                  <div className="flex flex-col items-end hidden lg:flex">
                    <span className="text-xs font-black flex items-center gap-1" style={{ color: colors.dark }}>
                        <BadgeCheck size={16} style={{ color: colors.primary }} />{user?.firstName}
                    </span>
                    <span className="text-[9px] font-bold uppercase tracking-tighter" style={{ color: colors.primary }}>
                        {user?.role}
                    </span>
                  </div>
                  <div className="w-9 h-9 rounded-xl bg-slate-100 overflow-hidden flex items-center justify-center border">
                    {user?.avatar ? (
                      <img src={user.avatar} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <UserIcon size={18} style={{ color: colors.textMuted }} />
                    )}
                  </div>
                </button>

                <AnimatePresence>
                  {dropdownOpen && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-3 w-56 bg-white border rounded-[2rem] shadow-2xl p-2"
                      style={{ borderColor: colors.border }}
                    >
                      <DropdownItem 
                        onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                        icon={<LayoutDashboard size={18} />}
                        label="Dashboard"
                        color={colors.textMain}
                      />
                      <DropdownItem 
                        onClick={() => { navigate(dashboardPath); setDropdownOpen(false); }}
                        icon={<Settings size={18} />}
                        label="Profile Settings"
                        color={colors.textMain}
                      />
                      <div className="h-px my-2 bg-slate-100" />
                      <button
                        onClick={logout}
                        className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold text-rose-500 hover:bg-rose-50 rounded-2xl transition-all"
                      >
                        <LogOut size={18} /> Logout
                      </button>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <div className="flex items-center gap-3">
                <Link to="/login" className="hidden sm:block text-sm font-bold no-underline" style={{ color: colors.textMuted }}>
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-6 py-3 text-white text-xs font-black rounded-2xl transition-all hover:-translate-y-0.5 shadow-lg active:scale-95 no-underline"
                  style={{ backgroundColor: colors.primary, shadowColor: `${colors.primary}40` }}
                >
                  JOIN NOW
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-3 rounded-xl bg-slate-100"
              style={{ color: colors.textMain }}
            >
              {mobileOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 w-full max-w-xs bg-white shadow-2xl z-[150] p-8 flex flex-col"
          >
            <div className="flex justify-between items-center mb-10">
               <span className="font-black text-xl">MENU</span>
               <button onClick={() => setMobileOpen(false)} className="p-2 bg-slate-100 rounded-full"><X size={20}/></button>
            </div>
            
            <nav className="flex flex-col gap-4">
              {NAV_LINKS.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="text-2xl font-black no-underline"
                  style={{ color: location.pathname === link.path ? colors.primary : colors.dark }}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-auto pt-10 border-t space-y-4">
              {isAuthenticated ? (
                <button 
                  onClick={() => {navigate(dashboardPath); setMobileOpen(false);}}
                  className="w-full py-4 rounded-2xl font-black text-white"
                  style={{ backgroundColor: colors.dark }}
                >
                  GO TO DASHBOARD
                </button>
              ) : (
                <Link 
                   to="/login" 
                   onClick={() => setMobileOpen(false)}
                   className="block w-full py-4 rounded-2xl font-black text-white text-center no-underline"
                   style={{ backgroundColor: colors.primary }}
                >
                  GET STARTED
                </Link>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

const DropdownItem = ({ onClick, icon, label, color }) => (
  <button
    onClick={onClick}
    className="flex items-center gap-3 w-full px-4 py-3 text-sm font-bold rounded-2xl transition-all hover:bg-slate-50"
    style={{ color: color }}
  >
    {icon} {label}
  </button>
);

export default Navbar;