import React from "react";
import { GamesData } from "@/utils/GamesData";
import GameCard from "@/components/atoms/GameCard";

const Games = () => {
  return (
    <div className="py-16 px-4 pb-40">
      <h1 className="text-5xl text-[#29296e] text-center font-bold mb-6">
        Start playing today!
      </h1>
      <p className="text-center text-gray-700 text-lg mb-16 max-w-3xl mx-auto">
        <strong>
          "Play a curated selection of engaging word games—from classic
          challenges to creative twists—all in one place."
        </strong>
      </p>

      <div className="max-w-7xl mx-auto">
        {/* Top row of games */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          {GamesData.map((game, index) => (
            <GameCard key={`top-${index}`} {...game} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default Games;
