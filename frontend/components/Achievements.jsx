"use client";

import { useState } from "react";
import {
  Trophy,
  Flame,
  Star,
  Award,
  XCircle,
  ChevronUp,
  ChevronDown,
} from "lucide-react";

export default function DewordleAchievements() {
  const [streak, setStreak] = useState(0);
  const [totalWins, setTotalWins] = useState(0);
  const [level, setLevel] = useState(1);
  const [xp, setXp] = useState(0);
  const [showAchievement, setShowAchievement] = useState(false);
  const [latestAchievement, setLatestAchievement] = useState(null);
  const [showBadges, setShowBadges] = useState(false);

  const badges = [
    {
      id: "first-win",
      name: "First Win",
      icon: Trophy,
      description: "Win your first game",
      earned: true,
    },
    {
      id: "5-day-streak",
      name: "5-Day Streak",
      icon: Flame,
      description: "Play for 5 consecutive days",
      earned: true,
    },
    {
      id: "flawless-victory",
      name: "Flawless Victory",
      icon: Star,
      description: "Solve the word in 1 try",
      earned: false,
    },
    {
      id: "10-wins",
      name: "10 Wins",
      icon: Award,
      description: "Win 10 games in total",
      earned: false,
    },
  ];

  // Simulating a game win
  const simulateWin = () => {
    setStreak((prevStreak) => prevStreak + 1);
    setTotalWins((prevWins) => prevWins + 1);
    addXp(50);
    checkAchievements();
  };

  // Simulating a game loss
  const simulateLoss = () => {
    setStreak(0);
    addXp(10);
  };

  // Add XP and check for level up
  const addXp = (amount) => {
    setXp((prevXp) => {
      const newXp = prevXp + amount;
      if (newXp >= level * 100) {
        setLevel((prevLevel) => prevLevel + 1);
        return newXp - level * 100;
      }
      return newXp;
    });
  };

  // Check for new achievements
  const checkAchievements = () => {
    if (totalWins === 0) {
      unlockAchievement("first-win");
    }
    if (streak === 5) {
      unlockAchievement("5-day-streak");
    }
    if (totalWins === 9) {
      unlockAchievement("10-wins");
    }
  };

  // Unlock a new achievement
  const unlockAchievement = (id) => {
    const achievement = badges.find((badge) => badge.id === id);
    if (achievement && !achievement.earned) {
      achievement.earned = true;
      setLatestAchievement(achievement);
      setShowAchievement(true);
      setTimeout(() => setShowAchievement(false), 3000);
    }
  };

  // Reset game state (for demo purposes)
  const resetGame = () => {
    setStreak(0);
    setTotalWins(0);
    setLevel(1);
    setXp(0);
    badges.forEach((badge) => (badge.earned = false));
    badges[0].earned = true;
    badges[1].earned = true;
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-center text-gray-900 dark:text-white mb-6">
          Dewordle Achievements
        </h1>

        {/* Streak and Stats */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center">
            <Flame className="w-6 h-6 text-orange-500 mr-2" />
            <span className="text-xl font-bold text-gray-800 dark:text-white">
              {streak} Day Streak
            </span>
          </div>
          <div className="text-sm text-gray-600 dark:text-gray-400">
            Total Wins: {totalWins}
          </div>
        </div>

        {/* XP Progress Bar */}
        <div className="mb-4">
          <div className="flex justify-between items-center mb-1">
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Level {level}
            </span>
            <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {xp} / {level * 100} XP
            </span>
          </div>
          <div className="w-full bg-gray-200 rounded-full h-2.5 dark:bg-gray-700">
            <div
              className="bg-blue-600 h-2.5 rounded-full transition-all duration-500 ease-out"
              style={{ width: `${(xp / (level * 100)) * 100}%` }}
            ></div>
          </div>
        </div>

        {/* Badges Section */}
        <div className="mb-6">
          <div
            className="flex justify-between items-center cursor-pointer"
            onClick={() => setShowBadges(!showBadges)}
          >
            <h2 className="text-lg font-semibold text-gray-800 dark:text-white">
              Badges
            </h2>
            {showBadges ? (
              <ChevronUp className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <ChevronDown className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </div>
          {showBadges && (
            <div className="mt-3 grid grid-cols-2 gap-3">
              {badges.map((badge) => (
                <div
                  key={badge.id}
                  className={`flex items-center p-2 rounded-lg ${
                    badge.earned
                      ? "bg-green-100 dark:bg-green-900"
                      : "bg-gray-100 dark:bg-gray-700 opacity-50"
                  }`}
                >
                  <badge.icon
                    className={`w-8 h-8 mr-2 ${
                      badge.earned
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-400 dark:text-gray-500"
                    }`}
                  />
                  <div>
                    <p className="text-sm font-medium text-gray-800 dark:text-white">
                      {badge.name}
                    </p>
                    <p className="text-xs text-gray-600 dark:text-gray-400">
                      {badge.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Game Simulation Buttons (for demo purposes) */}
        <div className="flex justify-center space-x-4 mb-4">
          <button
            onClick={simulateWin}
            className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors"
          >
            Simulate Win
          </button>
          <button
            onClick={simulateLoss}
            className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
          >
            Simulate Loss
          </button>
        </div>
        <button
          onClick={resetGame}
          className="w-full px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium rounded-lg transition-colors dark:bg-gray-700 dark:text-white dark:hover:bg-gray-600"
        >
          Reset Game
        </button>
      </div>

      {/* Achievement Popup */}
      {showAchievement && latestAchievement && (
        <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 rounded-lg shadow-lg p-4 flex items-center space-x-3 animate-fade-in-up">
          <latestAchievement.icon className="w-8 h-8 text-yellow-500" />
          <div>
            <p className="font-semibold text-gray-800 dark:text-white">
              {latestAchievement.name}
            </p>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {latestAchievement.description}
            </p>
          </div>
          <button
            onClick={() => setShowAchievement(false)}
            className="ml-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <XCircle className="w-5 h-5" />
          </button>
        </div>
      )}
    </div>
  );
}
