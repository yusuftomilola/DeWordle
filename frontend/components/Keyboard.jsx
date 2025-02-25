"use client";
import React, { useContext, useEffect, useCallback } from "react";
import { Delete } from "lucide-react";
import { AppContext } from "../context/AppContext";

const Keyboard = () => {
  const {
    currentRow,
    setCurrentRow,
    currentCol,
    setCurrentCol,
    gridData,
    setGridData,
  } = useContext(AppContext);

  const rows = [
    ["Q", "W", "E", "R", "T", "Y", "U", "I", "O", "P"],
    ["A", "S", "D", "F", "G", "H", "J", "K", "L"],
    [
      "Enter",
      "Z",
      "X",
      "C",
      "V",
      "B",
      "N",
      "M",
      { label: "", icon: <Delete />, type: "icon" },
    ],
  ];

  const handleKeyPress = useCallback(
    (key) => {
      if (currentRow >= 5) return; // Game is complete

      const currentPosition = currentRow * 5 + currentCol;

      if (
        key === "Backspace" ||
        (typeof key === "object" && key.type === "icon")
      ) {
        if (currentCol > 0) {
          const newGridData = [...gridData];
          newGridData[currentPosition - 1] = "";
          setGridData(newGridData);
          setCurrentCol((prev) => prev - 1);
        }
        return;
      }

      if (key === "Enter") {
        if (currentCol === 5) {
          setCurrentRow((prev) => prev + 1);
          setCurrentCol(0);
        }
        return;
      }

      if (currentCol < 5) {
        const newGridData = [...gridData];
        newGridData[currentPosition] = key;
        setGridData(newGridData);
        setCurrentCol((prev) => prev + 1);
      }
    },
    [
      currentRow,
      currentCol,
      gridData,
      setGridData,
      setCurrentCol,
      setCurrentRow,
    ]
  );

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === "Backspace") {
        handleKeyPress("Backspace");
      } else if (event.key === "Enter") {
        handleKeyPress("Enter");
      } else if (/^[a-zA-Z]$/.test(event.key)) {
        handleKeyPress(event.key.toUpperCase());
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyPress]);

  return (
    <div className="w-full  mx-auto mt-10 mb-5">
      <div className="space-y-4 p-[5px]">
        {rows.map((row, rowIndex) => (
          <div
            key={rowIndex}
            className="flex justify-center items-center space-x-2">
            {row.map((key, keyIndex) => {
              if (typeof key === "object" && key.type === "icon") {
                return (
                  <button
                    key={keyIndex}
                    onClick={() => handleKeyPress(key)}
                    className={`bg-[#EAEAF1] hover:bg-gray-400/60 text-center flex justify-center items-center 
                      ${
                        key === "Enter"
                        ? "w-[60px] sm:w-[80px] md:w-[119px]"
                        : "w-[60px] sm:w-[80px] md:w-[119px]"
                        } 
                        text-[#29296E] h-[30px] sm:h-[60px] md:h-[72px] 
                        font-semibold p-[6px] sm:p-[8px] md:p-[8px] 
                        rounded-[6px] sm:rounded-[8px] shadow-md transition-all text-xs sm:text-sm`}>
                    {key.icon}
                    <span>{key.label}</span>
                  </button>
                );
              }

              return (
                <button
                  key={keyIndex}
                  onClick={() => handleKeyPress(key)}
                  className={`bg-[#EAEAF1] hover:bg-gray-400/60  
                    ${
                      key === "Enter"
                        ? "w-[60px] sm:w-[80px] md:w-[119px]"
                        : "w-[40px] sm:w-[55px] md:w-[72px]"
                    } 
                    text-[#29296E] h-[30px] sm:h-[60px] md:h-[72px] 
                    font-semibold p-[6px] sm:p-[8px] md:p-[8px] 
                    rounded-[4px] sm:rounded-[8px] shadow-md transition-all text-xs sm:text-sm`}>
                  {key}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
};

export default Keyboard;
