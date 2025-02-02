"use client";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
function WordGrid() {
  // const inputs = Array.from({ length: 25 });
  const { gridData } = useContext(AppContext);

  return (
    <div className="mt-5">
      <div className="grid grid-cols-5 gap-2 md:gap-4 place-content-center mx-auto w-[250px] md:w-[350px] text-foreground">
        {gridData.map((char, index) => (
          <div
            key={index}
            className="w-[40px] h-[40px] md:w-[60px] md:h-[60px] rounded-[5px] bg-[#939B9F4D] flex items-center justify-center text-2xl font-bold"
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordGrid;