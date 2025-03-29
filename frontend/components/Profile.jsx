"use client";
import { useContext, useEffect } from "react";
import { AppContext } from "@/context/AppContext";
import { StatsCard } from "./profile/StatsCard";
import { AccountInfoCard } from "./profile/AccountInfoCard";
import { PersonalInfoCard } from "./profile/PersonalInfoCard";

// Main Profile Page Component
export default function ProfilePage() {
  const { userData } = useContext(AppContext);

  useEffect(() => {
    console.log("user data clg: ", userData);
  }, [userData]);

  return (
    <div className="min-h-screen bg-[#f5f5f5]">
      {/* Main Content */}
      <main className="grid grid-cols-1 gap-8 px-4 py-2 md:px-8 lg:px-16 lg:py-8 lg:grid-cols-2">
        {/* Left Column */}
        <PersonalInfoCard userData={userData} />

        {/* Right Column */}
        <div className="space-y-6 md:space-y-8">
          <StatsCard />
          <AccountInfoCard userData={userData} />
        </div>
      </main>
    </div>
  );
}
