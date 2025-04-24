"use client";
import { useState, useEffect } from "react";
import { HeroSlider } from "@/components/organism/landing-page/HeroSlider";
import MostPlayed from "@/components/organism/landing-page/MostPlayed";
import PlayOurGame from "@/components/organism/landing-page/playourgame";
import TrendingGames from "@/components/organism/landing-page/TrendingGames";
import WhatsNew from "@/components/organism/landing-page/WhatsNew";
import { LandingPageSkeletonLoader } from "@/components/ui/LandingPageSkeletonLoader";

export default function Page() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <LandingPageSkeletonLoader />;
  }

  return (
    <div className="bg-[#ffffff]">
      <HeroSlider />
      <PlayOurGame />
      <TrendingGames />
      <WhatsNew />
      <MostPlayed />
    </div>
  );
}
