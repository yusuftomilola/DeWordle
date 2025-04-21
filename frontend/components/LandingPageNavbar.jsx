"use client";

import { useState, useContext } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Menu, X } from "lucide-react";
import { AppContext } from "@/context/AppContext";

export default function LandingPageNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { userData } = useContext(AppContext);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  const isLoggedIn = userData?.userName;

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
              <span className="text-[#29296e] font-medium text-base">
                Hello, {userData.userName}
              </span>
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
