"use client";
import { useState, useContext, useEffect, useRef } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import {
  BarChartIcon,
  Bell,
  ChevronDown,
  LogOut,
  Menu,
  SettingsIcon,
  X,
} from "lucide-react";
import { AppContext } from "@/context/AppContext";
import { motion, AnimatePresence } from "framer-motion";
import { Settings } from "./Settings";


export default function LandingPageNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userData } = useContext(AppContext);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isStatsOpen, setIsStatsOpen] = useState(false);
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const profileButtonRef = useRef(null);
  const dropdownRef = useRef(null);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const toggleProfileDropdown = () => {
    setIsProfileOpen(!isProfileOpen);
  };

  const isLoggedIn = userData?.userName;

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target) &&
        profileButtonRef.current &&
        !profileButtonRef.current.contains(event.target)
      ) {
        setIsProfileOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <header className="w-full border-b border-gray-100 relative">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <Link
            href="/"
            className="flex items-center text-[#29296e] font-bold text-xl"
          >
            <span className="text-[#29296e]">⚔️</span>Lead Studios
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              href="/"
              className="text-gray-700 hover:text-[#29296e] transition-colors"
            >
              Home
            </Link>
            <Link
              href="/all-games"
              className="text-gray-700 hover:text-[#29296e] transition-colors"
            >
              All games
            </Link>
            <Link
              href="/categories"
              className="text-gray-700 hover:text-[#29296e] transition-colors"
            >
              Categories
            </Link>
            <Link
              href="/new"
              className="text-gray-700 hover:text-[#29296e] transition-colors"
            >
              New
            </Link>
          </nav>

          {/* Desktop Auth Buttons/User */}
          <div className="hidden md:flex items-center space-x-4">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  className="border-[#29296e] text-[#29296e] hover:bg-[#29296e]/10 rounded-full px-6"
                  asChild
                >
                  <Link href="/signin">Log In</Link>
                </Button>
                <Button
                  className="bg-[#29296e] hover:bg-[#29296e]/90 text-white rounded-full px-6"
                  asChild
                >
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </>
            ) : (
              <div className="navbar-end flex items-center gap-x-8 mt-4">
                <div className="relative">
                  <button
                    ref={profileButtonRef}
                    onClick={toggleProfileDropdown}
                    className="flex items-center gap-2 text-[#29296E] font-medium"
                  >
                    <span className="text-[#29296e] font-medium text-base">
                      Hello, {userData.userName}
                    </span>
                    <ChevronDown size={16} />
                  </button>
                </div>

                {/* Profile Dropdown */}
                <AnimatePresence>
                  {userData && isProfileOpen && (
                    <motion.div
                      ref={dropdownRef}
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.3, ease: "easeInOut" }}
                      className="absolute top-10 right-10 mt-2 bg-white rounded-lg shadow-lg py-4 z-50 w-[20rem] overflow-hidden"
                    >
                      {/* Profile Info */}
                      <div className="flex flex-col items-center justify-center px-4 py-4">
                        <div className="w-20 h-20 rounded-full overflow-hidden flex items-center justify-center border-4 border-[#29296E] mb-2">
                          {userData.avatar ? (
                            <Image
                              src={userData.avatar}
                              alt={userData.name}
                              width={80}
                              height={80}
                              className="object-cover"
                            />
                          ) : (
                            <span className="text-2xl font-medium text-[#29296E]">
                              😃
                            </span>
                          )}
                        </div>
                        <h3 className="text-xl font-semibold text-center">
                          {userData.userName}
                        </h3>
                        <p className="text-sm text-gray-500 text-center">
                          {userData.email}
                        </p>

                        <Link
                          href="/profile"
                          className="w-full mt-3 py-2 text-center bg-[#29296E] text-white font-medium rounded-full"
                        >
                          View Profile
                        </Link>
                      </div>

                      {/* Menu Items */}
                      <div className="mt-2">
                        <button
                          onClick={() => setIsSettingsOpen(true)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3 bg-gray-100"
                        >
                          <SettingsIcon size={18} className="text-[#29296E]" />
                          <span>Settings</span>
                        </button>
                        <Settings
                          isOpen={isSettingsOpen}
                          onClose={() => setIsSettingsOpen(false)}
                        />

                        <button
                          // onClick={() => isStatsOpen(true)}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <BarChartIcon size={18} className="text-[#29296E]" />
                          <span>Stats</span>
                        </button>
                       


                        <button
                          onClick={() => handleNavigation("/notifications")}
                          className="w-full px-4 py-3 text-left hover:bg-gray-50 flex items-center gap-3"
                        >
                          <Bell size={18} className="text-[#29296E]" />
                          <span>Notifications</span>
                        </button>

                        <div className="mt-12">
                          <button
                            onClick={() => {
                              localStorage.clear();
                              window.location.href = "/";
                            }}
                            className="w-full px-4 py-2 text-left flex items-center gap-3"
                          >
                            <LogOut size={18} className="text-[#29296E]" />
                            <span>Log Out</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden text-[#29296e]"
            onClick={toggleMenu}
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X size={24} /> : <Menu size={24} />}
          </button>
        </div>
      </div>

      {/* Mobile Menu with slide animation */}
      <div
        className={`md:hidden bg-white shadow-md overflow-hidden transition-all duration-300 ease-in-out ${
          isMenuOpen ? "max-h-96" : "max-h-0"
        }`}
      >
        <nav className="flex flex-col space-y-4 p-4">
          <Link
            href="/"
            className="text-gray-700 hover:text-[#29296e] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Home
          </Link>
          <Link
            href="/games"
            className="text-gray-700 hover:text-[#29296e] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            All games
          </Link>
          <Link
            href="/categories"
            className="text-gray-700 hover:text-[#29296e] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            Categories
          </Link>
          <Link
            href="/new"
            className="text-gray-700 hover:text-[#29296e] transition-colors py-2"
            onClick={() => setIsMenuOpen(false)}
          >
            New
          </Link>
          {/* mobile auth buttons/Users */}
          <div className="flex flex-col space-y-3 pt-2">
            {!isLoggedIn ? (
              <>
                <Button
                  variant="outline"
                  className="border-[#29296e] text-[#29296e] hover:bg-[#29296e]/10 rounded-full w-full"
                  asChild
                >
                  <Link href="/login" onClick={() => setIsMenuOpen(false)}>
                    Log In
                  </Link>
                </Button>
                <Button
                  className="bg-[#29296e] hover:bg-[#29296e]/90 text-white rounded-full w-full"
                  asChild
                >
                  <Link href="/signup" onClick={() => setIsMenuOpen(false)}>
                    Sign Up
                  </Link>
                </Button>
              </>
            ) : (
              <span className="text-[#29296e] font-medium text-sm">
                Hello, {userData.userName}
              </span>
            )}
          </div>
        </nav>
      </div>
    </header>
  );
}
