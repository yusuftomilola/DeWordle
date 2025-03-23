"use client";

import { Geist, Azeret_Mono as Geist_Mono } from "next/font/google";
import "./globals.css";
import { metadata } from "./metadata";
import { ThemeProvider } from "../context/ThemeContext";
import { Manrope } from "next/font/google";
import { Roboto } from "next/font/google";
import { QueryProvider, SessionProvider } from "@/app/providers";
import { Bounce, ToastContainer } from "react-toastify";

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

export default function RootLayout({ children }) {
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
          </QueryProvider>
        </body>
      </html>
    </ThemeProvider>
  );
}
