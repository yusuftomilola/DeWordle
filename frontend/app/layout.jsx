"use client";

import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import "./globals.css";
import Footer from "../components/footer";
import { useState, useEffect } from "react";
import { metadata } from "./metadata";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});



export default function RootLayout({ children }) {
  const [isDarkMode, setIsDarkMode] = useState(false);

  useEffect(() => {
    // Checking localStorage for theme preference
    const savedTheme = localStorage.getItem("theme");
    if (savedTheme === "dark") {
      setIsDarkMode(true);
      document.documentElement.classList.add("dark");
    } else {
      setIsDarkMode(false);
      document.documentElement.classList.remove("dark");
    }
  }, []);

  useEffect(() => {
    // Updating theme in localStorage to apply locally
    if (isDarkMode) {
      localStorage.setItem("theme", "dark");
      document.documentElement.classList.add("dark");
    } else {
      localStorage.setItem("theme", "light");
      document.documentElement.classList.remove("dark");
    }
  }, [isDarkMode]);

  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <head>
        <meta name="title" content={metadata.title} />
        <meta name="description" content={metadata.description} />
      </head>
      <body className="flex flex-col min-h-screen antialiased">
        <main className="flex-grow">{children}</main>
        {/* footerpage */}
        <Footer />
      </body>
    </html>
  );
}