import React, { createContext, useState } from "react";

export const AppContext = createContext();

export const AppProvider = ({ children }) => {
  const [currentRow, setCurrentRow] = useState(0);
  const [currentCol, setCurrentCol] = useState(0);
  const [gridData, setGridData] = useState(Array(25).fill(""));

  const value = {
    currentRow,
    setCurrentRow,
    currentCol,
    setCurrentCol,
    gridData,
    setGridData,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};
