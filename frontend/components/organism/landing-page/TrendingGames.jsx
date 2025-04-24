"use client";

import React, { useEffect, useRef } from "react";
import ComingSoon from "../../atoms/ComingSoon";
import { Button } from "../../ui/button";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/dist/ScrollTrigger";
import GameCard from "../../atoms/GameCard";
import Image from "next/image";

const TrendingGames = () => {
  const spellingBeeRef = useRef(null);
  const dewordleRef = useRef(null);
  const trendingContainerRef = useRef(null);
  const cardsContainerRef = useRef(null);
  const gridContainerRef = useRef(null); // New ref for the grid container with dewordle and spelling bee
  const cards = [
    {
      title: "Connections",
      description:
        "Group four words that share a common connection. Find all the sets before you run out of guesses!",
      available: false,
      icon: "/connections.png",
      iconAlt: "image of connections game",

      bgColor: "bg-indigo-300",
    },
    {
      title: "Strands",
      description:
        "Highlight interconnected words hidden in a grid. Find the themed words and uncover the pangram!",
      available: false,
      icon: "/strands.png",
      iconAlt: "image of strands game",
      bgColor: "bg-gray-600",
    },
    {
      title: "Tiles",
      description:
        "Form words using a selection of tiles. Choose wisely to score big with limited moves!",
      available: false,
      icon: "/tiles.jpeg",
      iconAlt: "image of tiles game",
      bgColor: "bg-[#b1ecc9]",
    },
  ];

  // Register ScrollTrigger with GSAP
  if (typeof window !== "undefined") {
    gsap.registerPlugin(ScrollTrigger);
  }

  useEffect(() => {
    // Skip animation setup during SSR
    if (typeof window === "undefined") return;

    // Initialize main section animation
    gsap.set(trendingContainerRef.current, {
      opacity: 0,
      y: 50,
    });

    // Set initial cards container state
    gsap.set(cardsContainerRef.current, {
      opacity: 0,
      y: 30,
    });

    // Set initial state for spellingBee and dewordle sections
    gsap.set([spellingBeeRef.current, dewordleRef.current], {
      opacity: 0,
      y: 40,
    });

    // Create timeline for the animations
    const tl = gsap.timeline({
      scrollTrigger: {
        trigger: trendingContainerRef.current,
        start: "top 80%",
        toggleActions: "play none none none",
      },
      onComplete: () => {
        // Clear all transforms after animation completes to allow hover effects
        gsap.set(".game-card", { clearProps: "all" });
      },
    });

    // Add animations to timeline
    tl.to(trendingContainerRef.current, {
      opacity: 1,
      y: 0,
      duration: 0.8,
      ease: "power2.out",
    })
      .to(
        cardsContainerRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.6,
          ease: "power2.out",
        },
        "-=0.4"
      )
      .fromTo(
        ".game-card",
        {
          opacity: 0,
          y: 20,
          scale: 0.95,
        },
        {
          opacity: 1,
          y: 0,
          scale: 1,
          stagger: 0.15,
          duration: 0.5,
          ease: "back.out(1.2)",
        },
        "-=0.2"
      )
      // Add animations for spellingBee and dewordle sections AFTER cards complete
      .to(
        spellingBeeRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "+=0.2" // Delay after cards animation completes
      )
      .to(
        dewordleRef.current,
        {
          opacity: 1,
          y: 0,
          duration: 0.7,
          ease: "power3.out",
        },
        "-=0.4" // Slightly overlap with spellingBee animation
      );

    // Cleanup function
    return () => {
      if (tl.scrollTrigger) {
        tl.scrollTrigger.kill();
      }
      tl.kill();
    };
  }, []);

  return (
    <div ref={trendingContainerRef}>
      {/* Trending Games Section */}
      <h2 className="text-5xl text-[#29296e] text-center my-24">
        Trending Games
      </h2>
      <div className="container mx-auto px-4 py-8" ref={cardsContainerRef}>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 max-w-[1180px] mx-auto">
          {cards.map((card, index) => (
            <GameCard {...card} key={index} />
          ))}
        </div>
      </div>
      <div
        className="grid grid-cols-1 md:grid-cols-2 md:gap-8 md:p-8 max-w-screen-2xl mx-auto"
        ref={gridContainerRef}
      >
        <div
          ref={spellingBeeRef}
          className="text-white bg-gray-100 p-6 flex justify-evenly items-center"
          style={{ background: "linear-gradient(to right, #2C2C47, #6C6CAD)" }}
        >
          <div className="w-full mb-6 flex flex-col">
            <h3 className="text-4xl font-bold mb-2">Spelling Bee</h3>
            <p className="mb-6 mt-6">
              Create as many words as possible from seven letters. How many
              points can you score?
            </p>
            <ComingSoon />
          </div>
          <Image
            src="/spelling-bee.png"
            alt="Spelling Bee"
            className="w-[55%] ml-4 "
            width={100}
            height={100}
          />
        </div>
        {/* Spelling Bee Section */}
        <div
          ref={dewordleRef}
          className="bg-gray-100 p-6 flex justify-evenly items-center "
          style={{ background: "linear-gradient(to right, #757599, #C3C3FF)" }}
        >
          <div className="text-white w-full mb-6 ">
            <h3 className="text-4xl font-bold mb-2">Dewordle</h3>
            <p className="mt-6">
              "Test your vocabulary skills with our word-guessing game. Six
              attempts to find the hidden word!"
            </p>
            <Button
              variant="outline"
              className="font-bold text-md text-[#29296e] rounded-full px-10 py-6 mt-8 hover:text-[#29296e]"
              asChild
            >
              <Link href="/onboard-dewordle">Play Now</Link>
            </Button>
          </div>
          <Image
            width={100}
            height={100}
            src="/landingpageImg.svg"
            alt="Landing Image"
            className="w-[55%] ml-4"
          />
        </div>
      </div>
    </div>
  );
};

export default TrendingGames;
