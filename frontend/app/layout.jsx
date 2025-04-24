"use client";

import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata";
import { Manrope } from "next/font/google";
import { Roboto } from "next/font/google";

import { Bounce, ToastContainer } from "react-toastify";
import LandingPageNavbar from "@/components/organism/landing-page/LandingPageNavbar";

import { usePathname } from "next/navigation";

import { QueryProvider, SessionProvider } from "@/providers";
import { ThemeProvider } from "../context/ThemeContext";
import { AppProvider } from "@/context/AppContext";

const roboto = Roboto({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-roboto",
});
const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-manrope",
});
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// global layout
export default function RootLayout({ children }) {
  const pathname = usePathname();
  // Define the routes where you want to hide the footer
  const hideFooterRoutes = [
    "/signin",
    "/signup",
    "/game",
    "/spelling-bee",
    "/onboard-dewordle",
  ];
  const hideNavbarRoutes = [
    "/signin",
    "/signup",
    "/admin-signin",
    "/subadmin-signin",
    "/onboard-dewordle",
    "/dewordle",
    "/spelling-bee",
    "/profile",
    "/setting",
    "/stats",
    "/forgot-password",
    "/game-guide",
  ];

  return (
    <ThemeProvider>
      <html
        lang="en"
        className={`${geistSans.variable} ${geistMono.variable} ${manrope.variable} ${roboto.variable}`}
      >
        <head>
          <meta name="title" content={metadata.title} />
          <meta name="description" content={metadata.description} />
        </head>
        <body className="min-h-screen flex flex-col justify-between h-auto w-full antialiased">
          <QueryProvider>
            <AppProvider>
              
              <main className="flex-grow ">{children}</main>
              <ToastContainer
                position="top-right"
                autoClose={5000}
                hideProgressBar={false}
                newestOnTop={false}
                closeOnClick={false}
                rtl={false}
                pauseOnFocusLoss
                draggable
                pauseOnHover
                theme="light"
                transition={Bounce}
              />
              {/* Render Footer only if the current route is NOT in hideFooterRoutes */}
            
            </AppProvider>
          </QueryProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
