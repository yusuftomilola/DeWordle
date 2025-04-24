"use client";

import { motion, useInView } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useRef } from "react";

const games = [
  {
    title: "Dewordle",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
    link: "/play/dewordle",
  },
  {
    title: "Dewordle",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
    link: "/play/dewordle",
  },
  {
    title: "Dewordle",
    description: "Lorem ipsum dolor sit amet, consectetur adipiscing.",
    link: "/play/dewordle",
  },
];

const MostPlayed = () => {
  const sectionRef = useRef(null);
  const isInView = useInView(sectionRef, { once: true, margin: "-100px" });

  return (
    <section
      ref={sectionRef}
      className="container mx-auto px-4 lg:px-5 py-8 mb-[5rem]"
    >
      <motion.h2
        initial={{ opacity: 0, y: 20 }}
        animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.6 }}
        className="text-[30px] text-center text-[#29296E] mb-[5rem]"
      >
        Most Played
      </motion.h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {games.map((game, index) => (
          <motion.div
            key={`${game.title}-${index}`}
            initial={{ opacity: 0, y: 30 }}
            animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
            transition={{ duration: 0.5, delay: index * 0.2 }}
            className="bg-white rounded-lg border-4 border-black transition-all duration-300"
          >
            <div className="p-6 h-[256px] flex justify-center items-center bg-[#CECEED]">
              <Image
                src={'/assets/grid.svg'}
                alt={game.title}
                width={162}
                height={162}
                className="rounded"
              />
            </div>
            <div className="p-6">
              <h3 className="text-[24px] text-[#1F1F1F] mb-2">{game.title}</h3>
              <p className="text-[16px] text-[#303030] mb-4">
                {game.description}
              </p>
              <Link href={game.link} className="inline-flex items-center">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={`px-10 py-2 rounded-full border border-[#29296E] text-[#29296E] hover:bg-[#29296E] hover:text-white transition-all duration-300`}
                >
                  Play
                </motion.button>
              </Link>
            </div>
          </motion.div>
        ))}
      </div>
    </section>
  );
};

export default MostPlayed;
