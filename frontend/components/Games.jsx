import React from "react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";

const Games = () => {
  const topRowGames = [
    {
      title: "Dewordle",
      description: "Think fast, you have 6 chances to guess the right 5-letter word. Test your skills and challenge yourself with every round.",
      available: true,
      icon: "/dewordle.png",
      iconAlt: "Dewordle",
    },
    {
      title: "Spelling Bee",
      description: "Test your spelling skills. Compete, learn and become a spelling champion!.",
      available: false,
      icon: "/spelling bee.png",
      iconAlt: "Spelling Bee",
    },
    {
      title: "Tiles",
      description: "Form words using a selection of tiles. Choose wisely to score big with limited moves!.",
      available: false,
      icon: "/tiles.png",
      iconAlt: "Tiles",
    },
  ];

  const bottomRowGames = [
    {
      title: "Connections",
      description: "Group four words that share a common connection. Find all the sets before you run out of guesses!.",
      available: false,
      icon: "/game-connections.png",
      iconAlt: "Connections",
    },
   
    {
      title: "Letter Boxed",
      description: "Use every letter to form words that link together.",
      available: false,
      icon: "/letter-boxed.png",
      iconAlt: "Letter Boxed",
    },
    {
      title: "Strands",
      description: "Highlight interconnected words hidden in a grid. Find the themed words and uncover the pangram!.",
      available: false,
      icon: "/game-strands.png",
      iconAlt: "Strands",
    },
  
  ];

  const GameCard = ({ title, description, available, icon, iconAlt }) => {
    return (
          <div
            className="game-card border-black border-4 rounded-lg overflow-hidden flex flex-col
            hover:scale-105 hover:shadow-2xl hover:z-10 cursor-pointer
            transition-all duration-300 ease-in-out"
          >
            {/* Full-size image with no background */}
            <div className="h-72 overflow-hidden">
              <Image
                width={300}
                height={300}
                src={icon}
                alt={iconAlt}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-4 bg-white flex-grow">
              <h3 className="text-3xl font-bold">{title}</h3>
              <p className="text-base my-10 mb-4">{description}</p>
              <div className="mt-4 flex ">
                {available ? (
                  <Button
                    variant="outline"
                    className="border-[#29296e] text-[#29296e] hover:bg-[#29296e]/10 rounded-full px-6"
                    asChild
                  >
                    <Link href="/dewordle">Play Now</Link>
                  </Button>
                ) : (
                  <p className="text-indigo-800 font-extrabold text-sm md:text-xl">
                    Coming Soon!
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      };

      return (
      <div className="py-16 px-4 pb-40">
        <h1 className="text-5xl text-[#29296e] text-center font-bold mb-6">
        Start playing today!
        </h1>
        <p className="text-center text-gray-700 text-lg mb-16 max-w-3xl mx-auto">
         <strong>"Play a curated selection of engaging word games—from classic challenges to creative twists—all in one place."</strong>
        </p>

        <div className="max-w-7xl mx-auto">
          {/* Top row of games */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
            {topRowGames.map((game, index) => (
              <GameCard key={`top-${index}`} {...game} />
            ))}
          </div>

          {/* Bottom row of games */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-20">
            {bottomRowGames.map((game, index) => (
              <GameCard key={`bottom-${index}`} {...game} />
            ))}
          </div>
        </div>
      </div>
    );
  };
// };

export default Games;
