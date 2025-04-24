import Navbar from "@/components/organism/games/Dewordle/Navbar";
import React from "react";

const Dewordlelayout = ({ children }) => {
  return (
    <main className="">
      <Navbar />
      {children}
    </main>
  );
};

export default Dewordlelayout;
