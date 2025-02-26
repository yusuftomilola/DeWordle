"use client";
import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gridData, setGridData] = useState(Array(25).fill(""));

  // Function to reset the grid for a new game
  const resetGrid = () => {
    setCurrentRow(0);
    setCurrentCol(0);
    setGridData(Array(25).fill(""));
  };

  const value = {
    currentRow,
    setCurrentRow,
    currentCol,
    setCurrentCol,
    gridData,
    setGridData,
    resetGrid, // Add resetGrid to the context value
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
