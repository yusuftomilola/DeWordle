import React from "react";
import { Button } from "../ui/button";
import Link from "next/link";
import Image from "next/image";

const GameCard = ({ title, description, available, icon, iconAlt, href }) => {
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
              <Link href={href}>Play Now</Link>
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

export default GameCard;