// src/components/Navigation.tsx

import React, { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

interface NavigationProps {
  cartCount: number;
  onNavigate: (page: "home" | "products" | "input") => void;
  currentPage: "home" | "products" | "input";
}

const Navigation: React.FC<NavigationProps> = ({
  cartCount,
  onNavigate,
  currentPage,
}) => {
  const location = useLocation();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);

  // Use the AuthContext
  const { isAuthenticated, userData, logout } = useAuth();

  const handleLogout = async () => {
    await logout();
    setShowUserMenu(false);
    navigate("/");
  };

  const toggleUserMenu = () => {
    setShowUserMenu(!showUserMenu);
  };

  return (
    <nav className="bg-white shadow-md sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-3 h-16">
          {/* Navigation Links pushed further left - now in first column */}
          <div className="hidden md:flex items-center space-x-5 justify-start pl-2">
            <Link
              to="/"
              onClick={() => onNavigate("home")}
              className={`text-gray-700 nav-head hover:text-[#FF9EAA] transition duration-300 font-medium ${
                location.pathname === "/" ? "text-[#FF9EAA]" : ""
              }`}
            >
              Home
            </Link>
            <Link
              to="/products"
              onClick={() => onNavigate("products")}
              className={`text-gray-700 nav-head hover:text-[#FF9EAA] transition duration-300 font-medium ${
                location.pathname === "/products" ? "text-[#FF9EAA]" : ""
              }`}
            >
              Products
            </Link>
            <Link
              to="/input"
              onClick={() => onNavigate("input")}
              className={`text-gray-700 nav-head hover:text-[#FF9EAA] transition duration-300 font-medium ${
                location.pathname === "/input" ? "text-[#FF9EAA]" : ""
              }`}
            >
              Add Product
            </Link>
            <a
              href="#"
              className="text-gray-700 nav-head hover:text-[#FF9EAA] transition duration-300 font-medium"
            >
              About
            </a>
            <a
              href="#"
              className="text-gray-700 nav-head hover:text-[#FF9EAA] transition duration-300 font-medium"
            >
              Contact
            </a>
          </div>

          {/* FOST Logo in perfectly centered middle column */}
          <div className="flex items-center justify-center">
            <Link
              to="/"
              className="flex-shrink-0 flex items-center cursor-pointer"
              onClick={() => onNavigate("home")}
            >
              <span className="text-2xl font-bold text-[#000000]">F O S T</span>
            </Link>
          </div>

          {/* Auth and Cart in the third column */}
          <div className="flex items-center space-x-4 justify-end">
            {/* Auth Links */}
            <div className="hidden md:flex items-center space-x-4">
              {isAuthenticated ? (
                <div className="relative">
                  <button
                    onClick={toggleUserMenu}
                    className="flex items-center space-x-2 text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium"
                  >
                    {userData?.photoURL ? (
                      <img
                        src={userData.photoURL}
                        alt="User"
                        className="w-8 h-8 rounded-full"
                      />
                    ) : (
                      <div className="w-8 h-8 rounded-full bg-[#FF9EAA] flex items-center justify-center text-white">
                        {userData?.name
                          ? userData.name.charAt(0).toUpperCase()
                          : "U"}
                      </div>
                    )}
                    <span>{userData?.name || "User"}</span>
                  </button>

                  {showUserMenu && (
                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                      <button
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      >
                        Logout
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                <>
                  <Link
                    to="/login"
                    className={`text-gray-700 hover:text-[#FF9EAA] transition duration-300 font-medium nav-head ${
                      location.pathname === "/login" ? "text-[#FF9EAA]" : ""
                    }`}
                  >
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className={`text-gray-700 hover:text-[#FF9EAA] transition duration-300 nav-head font-medium ${
                      location.pathname === "/register" ? "text-[#FF9EAA]" : ""
                    }`}
                  >
                    Register
                  </Link>
                </>
              )}
            </div>
            {/* Cart Icon */}
            <Link
              to="/cart"
              className="p-2 rounded-full hover:bg-gray-100 transition duration-300 relative"
            >
              <i className="fas fa-shopping-cart text-gray-700"></i>
              <span className="absolute -top-1 -right-1 bg-[#FF9EAA] text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                {cartCount}
              </span>
            </Link>
            <div className="ml-3 md:hidden">
              <button className="p-2 rounded-full hover:bg-gray-100 transition duration-300">
                <i className="fas fa-bars text-gray-700"></i>
              </button>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
