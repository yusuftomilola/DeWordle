"use client";

import { useContext, useEffect, useState } from "react";
import { motion } from "framer-motion";
import Link from "next/link";
import Image from "next/image";
import { AppContext } from "@/context/AppContext";
import { HelpCircle } from "lucide-react";
import { HelpGuide } from "./HelpGuide";

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
      <div className=" max-w-7xl mx-auto">
        <div className="flex flex-col-reverse lg:flex-row justify-between gap-10 xl:gap-24 mt-8">
          {/* Text Section */}
          <div className="pt-8 sm:pt-10 lg:pb-1 xl:max-w-[548px]">
            <h1 className="text-3xl sm:text-5xl font-semibold tracking-[1.2px] text-[#29296E] font-roboto break-words leading-tight sm:leading-[58px] lg:leading-[70px]">
              Get 6 Chances to guess a 5-letter word.
            </h1>
            <p className="mt-6 text-lg sm:text-[24px] font-normal leading-[40px] text-black w-full">
              Think fast, you have 6 chances to guess the right 5-letter word.
              Test your skills and challenge yourself with every round.
            </p>
            <div className="mt-8 lg:mt-16 flex flex-wrap items-center gap-4">
              {isLoggedIn ? (
                <Link
                  href="/dewordle"
                  className="bg-[#29296E] text-lg font-bold text-white hover:bg-opacity-90 inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2"
                >
                  Play Now
                </Link>
              ) : (
                <>
                  <Link
                    href="/signin"
                    className="border border-[#29296E] text-[#29296E] hover:bg-accent font-bold inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2 text-lg"
                  >
                    Log In
                  </Link>
                  <Link
                    href="/dewordle"
                    className="bg-[#29296E] text-lg font-bold text-white hover:bg-opacity-90 inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2"
                  >
                    Play as Guest.
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Image Section */}
          <div className="relative w-full max-w-[630px] h-auto flex items-center justify-center mx-auto">
            <div className="relative w-full aspect-square max-w-[630px]">
              <Image
                src="/landingpageImg.svg"
                alt="Word game illustration"
                fill
                sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                priority
              />
            </div>
          </div>
        </div>
        {/* Help Button */}
        <div className="flex justify-end mt-20">
          <motion.button
            onClick={() => setIsHelpGuideOpen(true)}
            className="flex items-center text-[#29296E]"
            animate={{ scale: [0.7, 1.2, 0.7] }}
            transition={{ repeat: Infinity, duration: 1.2, ease: "linear" }}
          >
            <HelpCircle size={30} />
          </motion.button>
        </div>
      </div>
      {/* Help Guide Modal */}
      <HelpGuide
        isOpen={isHelpGuideOpen}
        onClose={() => setIsHelpGuideOpen(false)}
      />
    </div>
  );
};

export default Dewordle;
