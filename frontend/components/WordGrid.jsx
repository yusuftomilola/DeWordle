"use client";
import React, { useContext } from "react";
import { AppContext } from "../context/AppContext";
function WordGrid() {
  // const inputs = Array.from({ length: 25 });
  const { gridData } = useContext(AppContext);

  return (
    <div className="mt-5">
      <div className="grid grid-cols-5 gap-2  md:gap-[13px] place-content-center mx-auto w-[250px] sm:w-[330px] md:w-[422px] text-foreground">
        {gridData.map((char, index) => (
          <div
            key={index}
            className="w-[40px] h-[40px] sm:w-[55px] sm:h-[55px] md:w-[74px] md:h-[74px] rounded-[4px] bg-[#fff] border-[1px] border-[#777777] flex items-center justify-center text-2xl font-bold"
          >
            {char}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordGrid;
