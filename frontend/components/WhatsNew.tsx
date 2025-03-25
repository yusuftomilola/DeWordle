"use client";
import whatsNew1 from "@/assets/whats-new-1.svg";
import whatsNew2 from "@/assets/whats-new-2.svg";
import whatsNew3 from "@/assets/whats-new-3.svg";
import whatsNew4 from "@/assets/whats-new-4.svg";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import { useRef } from "react";

interface GameCard {
  title: string;
  description: string;
  icon: string;
  status: "coming-soon" | "available";
}

const games: GameCard[] = [
  {
    title: "Connectors",
    description: "Lorem ipsum dolor sit.",
    icon: whatsNew1,
    status: "coming-soon",
  },
  {
    title: "Letter Boxed",
    description: "Lorem ipsum dolor sit.",
    icon: whatsNew2,
    status: "coming-soon",
  },
  {
    title: "Strands",
    description: "Lorem ipsum dolor sit.",
    icon: whatsNew3,
    status: "coming-soon",
  },
  {
    title: "Spelling Bee",
    description: "Lorem ipsum dolor sit.",
    icon: whatsNew4,
    status: "coming-soon",
  },
];

const WhatsNew = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section ref={sectionRef} className="container mx-auto px-4 lg:px-5 py-8">
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="text-[30px] text-center text-[#29296E] mb-[5rem]"
      >
        What's New
      </motion.h2>
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-7 justify-center pb-4 scrollbar-hide">
        {games.map((game, index) => (
          <motion.div
            key={game.title}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white rounded-lg border border-[#D0D0D0] transition-all duration-300 transform hover:scale-105"
          >
            <div className="grid grid-cols-3">
              <Image src={game.icon} alt={game.title} className="col-span-1" />
              <div className="col-span-2 p-3">
                <h3 className="font-semibold text-[14px] text-[#1F1F1F]">
                  {game.title}
                </h3>
                <p className="text-[#303030] text-[14px]">{game.description}</p>
                <p className="text-[14px] text-[#29296E] mt-3">Coming Soon</p>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default WhatsNew;
