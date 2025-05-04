"use client";

import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";
import { HelpCircle } from "lucide-react";
import { HelpGuide } from "./HelpGuide";
import Image from 'next/image';

const navigation = [{ name: "How to play", href: "#" }];

const Dewordle = () => {
  const { userData } = useContext(AppContext);
  const isLoggedIn = userData?.userName;
  const [hasShadow, setHasShadow] = useState(false);
  const [isHelpGuideOpen, setIsHelpGuideOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setHasShadow(window.scrollY > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="w-full relative px-4 sm:px-10 xl:px-20 overflow-hidden">
      {/* Enhanced Blockchain-inspired Animated Background */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-[#29296E]/10">
          {/* Hexagonal Grid Pattern */}
          <div
            className="absolute inset-0"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M30 0l25.98 15v30L30 60 4.02 45V15z' stroke-width='1.5' stroke='rgba(41, 41, 110, 0.2)' fill='none'/%3E%3C/svg%3E")`,
              backgroundSize: "60px 60px",
            }}
          />
          {[...Array(12)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute rounded-full border-2 border-[#29296E]/30"
              initial={{
                width: Math.random() * 60 + 60, // Random size between 60-120px
                height: Math.random() * 60 + 60,
                x: Math.random() * window.innerWidth,
                y: Math.random() * window.innerHeight,
                opacity: 0.2,
              }}
              animate={{
                x: [
                  Math.random() * window.innerWidth * 0.9,
                  Math.random() * window.innerWidth * 0.9,
                ],
                y: [
                  Math.random() * window.innerHeight * 0.9,
                  Math.random() * window.innerHeight * 0.9,
                ],
                opacity: [0.15, 0.3, 0.15],
                rotate: [0, 360],
                scale: [1, 1.1, 1],
              }}
              transition={{
                duration: Math.random() * 15 + 25, // Random duration between 25-40s
                repeat: Infinity,
                repeatType: "reverse",
                ease: "easeInOut",
                times: [0, 0.5, 1],
              }}
              style={{
                background: `linear-gradient(135deg, rgba(41, 41, 110, ${Math.random() * 0.1 + 0.05}) 0%, rgba(41, 41, 110, ${Math.random() * 0.15 + 0.1}) 100%)`,
                backdropFilter: "blur(2px)",
                boxShadow: "0 0 30px rgba(41, 41, 110, 0.1)",
              }}
            />
          ))}

          {/* Enhanced Gradient Overlay */}
          <motion.div
            className="absolute inset-0"
            animate={{
              background: [
                "radial-gradient(circle at 30% 30%, rgba(41, 41, 110, 0.12) 0%, transparent 70%)",
                "radial-gradient(circle at 70% 70%, rgba(41, 41, 110, 0.12) 0%, transparent 70%)",
                "radial-gradient(circle at 30% 30%, rgba(41, 41, 110, 0.12) 0%, transparent 70%)",
              ],
            }}
            transition={{
              duration: 25,
              repeat: Infinity,
              ease: "easeInOut",
            }}
          />
        </div>

        {/* Subtle Blur Overlay */}
        <div className="absolute inset-0 backdrop-blur-[2px]" />
      </div>
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-10 xl:gap-24 mt-8">
          {/* Text Section */}
          <div className="pt-8 sm:pt-10 lg:pb-1 xl:max-w-[548px]">
            <motion.h1
              className="text-3xl sm:text-5xl font-semibold tracking-[1.2px] text-[#29296E] font-roboto break-words leading-tight sm:leading-[58px] lg:leading-[70px] relative"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <motion.span
                className="inline-block glow-text"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.8 }}
              >
                Get 6 chances to guess
              </motion.span>{" "}
              <motion.span
                className="inline-block glow-text"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.6, duration: 0.8 }}
              >
                the 5-letter word.
              </motion.span>
            </motion.h1>
            <motion.p
              className="mt-6 text-lg sm:text-[24px] font-normal leading-[40px] text-black w-full space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.9, duration: 0.8 }}
            >
              <motion.span
                className="inline-block"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.2, duration: 0.8 }}
              >
                Think fast, you have 6 chances to guess the right 5-letter word.
              </motion.span>
              <motion.span
                className="block mt-4"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 1.5, duration: 0.8 }}
              >
                Test your skills and challenge yourself with every round.
              </motion.span>
            </motion.p>
            <div className="mt-8 lg:mt-16 flex flex-row items-center justify-start gap-4 flex-nowrap">
              {isLoggedIn ? (
                <Link href="/dewordle" className="button">
                  <div className="button-outer">
                    <div className="button-inner">
                      <span>Play Now</span>
                    </div>
                  </div>
                </Link>
              ) : (
                <>
                  <Link href="/signin" className="button login-button">
                    <div className="button-outer">
                      <div className="button-inner">
                        <span>Log In</span>
                      </div>
                    </div>
                  </Link>
                  <Link href="/dewordle" className="btn">
                    <i className="animation" />
                    <span className="whitespace-nowrap">Play as Guest</span>
                    <i className="animation" />
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative w-full max-w-[630px] h-auto flex items-center justify-center mx-auto">
            <motion.div 
              className="relative w-full aspect-square max-w-[630px]"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
            >
              <Image
                src="/landingpageImg.svg"
                alt="DeWordle Game Illustration"
                width={630}
                height={630}
                className="w-full h-full object-contain"
                priority
              />
            </motion.div>
          </div>
        </div>
        {/* Help Button */}
        <div className="flex justify-end mt-20">
          <motion.button
            onClick={() => setIsHelpGuideOpen(true)}
            className="faq-button"
            whileHover={{ scale: 1.05 }}
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 320 512" className="h-6 w-6 fill-white">
              <path d="M80 160c0-35.3 28.7-64 64-64h32c35.3 0 64 28.7 64 64v3.6c0 21.8-11.1 42.1-29.4 53.8l-42.2 27.1c-25.2 16.2-40.4 44.1-40.4 74V320c0 17.7 14.3 32 32 32s32-14.3 32-32v-1.4c0-8.2 4.2-15.8 11-20.2l42.2-27.1c36.6-23.6 58.8-64.1 58.8-107.7V160c0-70.7-57.3-128-128-128H144C73.3 32 16 89.3 16 160c0 17.7 14.3 32 32 32s32-14.3 32-32zm80 320a40 40 0 1 0 0-80 40 40 0 1 0 0 80z" />
            </svg>
            <span className="tooltip">FAQ</span>
          </motion.button>
        </div>
      </div>
      <HelpGuide
        isOpen={isHelpGuideOpen}
        onClose={() => setIsHelpGuideOpen(false)}
      />
      {/* </div> */}
      );
    </div>
  );
};

export default Dewordle;
