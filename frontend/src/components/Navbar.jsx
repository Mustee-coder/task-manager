import { Link, NavLink, useNavigate } from "react-router-dom";
import { useState, useEffect } from "react";
import ThemeSelector from "./ThemeSelector.jsx";
import TaskManagerLogo from "./TaskManagerLogo";

const Navbar = () => {
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  const navigate = useNavigate();
  const role = localStorage.getItem("userRole"); // "admin" or "user"

  // Handle logout without full page reload
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("userRole");
    navigate("/login");
  };

  // Shadow on scroll
  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <nav
      className={`bg-white px-6 py-3 flex justify-between items-center sticky top-0 z-50 transition-shadow ${
        scrolled ? "shadow-lg" : "shadow-md"
      }`}
    >
    
    
    
      {/* Logo */}
      <NavLink
        to={role === "admin" ? "/admin" : "/dashboard"}
        className={({ isActive }) =>
          isActive ? "text-blue-600 font-bold" : "text-gray-700 hover:text-blue-600"
        }
      >
        <TaskManagerLogo />
      </NavLink>

      {/* Links */}
      <div className="flex items-center gap-6">
        <ThemeSelector />

       

       


        {/* Avatar / Dropdown */}
        <div className="relative">
          <button
            onClick={() => setOpen(!open)}
            className="w-9 h-9 rounded-full bg-blue-500 text-white flex items-center justify-center"
          >
            {open ? "✖" : "☰"}
          </button>

          {open && (
            <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg p-2">
              <p className="px-3 py-2 text-sm text-gray-500">{role}</p>
              <button
                onClick={handleLogout}
                className="w-full text-left px-3 py-2 hover:bg-gray-100 text-red-500"
              >
                Logout
              </button>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;