"use client";

import React, { use } from "react";
import Header from "./SpellingBeeHeader";
import Image from "next/image";
import { useRouter } from "next/navigation";

const SpellingBee = () => {
  const router = useRouter(); // Initialize the router

  const handleSignIn = () => {
    router.push("/signin"); // Navigate to the sign-in page
  };

  return (
    <>
      <Header />
      <section className="flex flex-col items-center justify-center text-center py-32 bg-gradient-to-b bg-indigo-400">
        <div className="mb-4">
          <Image
            src={'/assets/threeBees.png'}
            alt="Spelling Bee"
            className="w-[170px] h-[100px]"
            width={100}
            height={100}
          />
        </div>
        <h2 className="text-5xl font-semibold text-white">Spelling bee</h2>
        <p className="text-white mt-6 text-[18px] max-w-md">
          Test your spelling skills. Compete, learn and become a spelling
          champion!
        </p>
        <div className="mt-6 flex space-x-4">
          <button className="px-16 py-3 bg-white text-indigo-900 font-medium rounded-full shadow hover:bg-gray-100">
            Play
          </button>
          <button
            className="px-16 py-1 border border-white text-white font-medium rounded-full hover:bg-white hover:text-indigo-900"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </section>
    </>
  );
};

export default SpellingBee;
