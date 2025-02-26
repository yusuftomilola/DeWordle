"use client";
import React, { useContext, useEffect } from "react";
import { AppContext } from "../context/AppContext";

function WordGrid() {
  const { gridData, setGridData } = useContext(AppContext);
  const colors = [
    "#939B9F", // Gray
    "#CEB02C", // Yellow
    "#66A060", // Green
  ];

  useEffect(() => {
    let updated = false;
    const newGridData = gridData.map((cell, index) => {
      if (cell.char && !cell.color) {
        const randomColor = colors[Math.floor(Math.random() * colors.length)];
        updated = true;
        return { ...cell, color: randomColor };
      }
      return cell;
    });

    if (updated) {
      setGridData(newGridData);
    }
  }, [gridData, setGridData, colors]);

  return (
    <div className="mt-5">
      <div className="grid grid-cols-5 gap-3 md:gap-5 place-content-center mx-auto w-[300px] md:w-[400px] text-foreground">
        {gridData.map((cell, index) => (
          <div
            key={index}
            className="w-[74px] h-[74px] rounded-[4px] flex items-center justify-center text-2xl font-semibold shadow-md transition-all duration-300 ease-in-out"
            style={{
              backgroundColor: cell.color || "#ffffff", // Use assigned color or default to white
              border: "1px solid #777777",
              animation: cell.char ? "fadeIn 0.5s ease-in-out" : "none", // Apply animation
            }}
          >
            {cell.char}
          </div>
        ))}
      </div>
    </div>
  );
}

export default WordGrid;
