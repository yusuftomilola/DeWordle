"use client"

import { useState } from "react"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { Trophy, Flame, Zap, Calendar, Hash, BarChart2 } from "lucide-react"

export default function DewordleStats() {
  // Mock data - in a real app, this would come from an API or local storage
  const [stats, setStats] = useState({
    gamesPlayed: 87,
    winPercentage: 76,
    bestTime: "1:24",
    leastAttempts: 2,
    longestStreak: 12,
    currentStreak: 3,
    avgGuesses: 3.8,
    gameHistory: [
      { day: "Mon", guesses: 3, won: true },
      { day: "Tue", guesses: 4, won: true },
      { day: "Wed", guesses: 6, won: false },
      { day: "Thu", guesses: 2, won: true },
      { day: "Fri", guesses: 3, won: true },
      { day: "Sat", guesses: 5, won: true },
      { day: "Sun", guesses: 4, won: false },
    ],
  })

  // Prepare data for the win/loss chart
  const winLossData = [
    { name: "Wins", value: stats.winPercentage, fill: "#4ade80" },
    { name: "Losses", value: 100 - stats.winPercentage, fill: "#f87171" },
  ]

  // Prepare data for the guesses chart with color coding
  const guessesData = stats.gameHistory.map((game) => ({
    day: game.day,
    guesses: game.guesses,
    fill: game.won ? "#4ade80" : "#f87171",
  }))

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-10">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">Dewordle Stats</h1>
          <p className="text-gray-600">Track your personal insights & performance</p>
        </div>

        {/* Stats Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
          <StatCard
            title="Games Played"
            value={stats.gamesPlayed}
            icon={<Calendar className="w-6 h-6 text-indigo-500" />}
          />
          <StatCard
            title="Win Percentage"
            value={`${stats.winPercentage}%`}
            icon={<Flame className="w-6 h-6 text-orange-500" />}
            highlight={true}
          />
          <StatCard
            title="Best Performance"
            value={`${stats.leastAttempts} attempts`}
            subtext={`Fastest: ${stats.bestTime}`}
            icon={<Trophy className="w-6 h-6 text-yellow-500" />}
          />
          <StatCard
            title="Longest Streak"
            value={stats.longestStreak}
            subtext={`Current: ${stats.currentStreak}`}
            icon={<Zap className="w-6 h-6 text-purple-500" />}
            highlight={true}
          />
          <StatCard title="Avg. Guesses" value={stats.avgGuesses} icon={<Hash className="w-6 h-6 text-blue-500" />} />
          <StatCard
            title="Game Insights"
            value="View Charts"
            icon={<BarChart2 className="w-6 h-6 text-green-500" />}
            isLink={true}
            onClick={() => document.getElementById("charts").scrollIntoView({ behavior: "smooth" })}
          />
        </div>

        {/* Charts Section */}
        <div id="charts" className="bg-white rounded-xl shadow-md p-6 mb-10">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Graphical Insights</h2>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Win/Loss Ratio Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Win/Loss Ratio</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={winLossData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} />
                    <YAxis dataKey="name" type="category" />
                    <Tooltip
                      formatter={(value) => [`${value}%`, "Percentage"]}
                      contentStyle={{ backgroundColor: "#fff", borderRadius: "0.5rem" }}
                    />
                    <Bar dataKey="value" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Daily Performance Chart */}
            <div className="bg-gray-50 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Daily Performance</h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={guessesData}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="day" />
                    <YAxis domain={[0, 6]} />
                    <Tooltip
                      formatter={(value) => [`${value} guesses`, "Performance"]}
                      contentStyle={{ backgroundColor: "#fff", borderRadius: "0.5rem" }}
                    />
                    <Bar dataKey="guesses" fill="#8884d8" radius={[4, 4, 0, 0]}>
                      {guessesData.map((entry, index) => (
                        <Bar key={`cell-${index}`} fill={entry.fill} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        </div>

        {/* Value Proposition */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Why Track Your Stats?</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <ValueCard
              title="Motivation"
              description="Increase your motivation by tracking performance over time."
              emoji="🔥"
            />
            <ValueCard
              title="Improvement"
              description="Identify patterns to improve your gameplay strategy."
              emoji="📈"
            />
            <ValueCard
              title="Insights"
              description="Gain valuable insights into your strengths and weaknesses."
              emoji="💡"
            />
          </div>
        </div>
      </div>
    </div>
  )
}

// Stat Card Component
function StatCard({ title, value, subtext, icon, highlight = false, isLink = false, onClick }) {
  return (
    <div
      className={`bg-white rounded-xl shadow-md p-6 transition-all duration-200 ${highlight ? "border-l-4 border-indigo-500" : ""} ${isLink ? "cursor-pointer hover:shadow-lg" : ""}`}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold mt-1 ${highlight ? "text-indigo-600" : "text-gray-900"}`}>{value}</p>
          {subtext && <p className="text-sm text-gray-500 mt-1">{subtext}</p>}
        </div>
        <div className="bg-gray-50 p-2 rounded-lg">{icon}</div>
      </div>
    </div>
  )
}

// Value Proposition Card
function ValueCard({ title, description, emoji }) {
  return (
    <div className="bg-gray-50 rounded-lg p-6">
      <div className="text-3xl mb-3">{emoji}</div>
      <h3 className="text-lg font-semibold text-gray-800 mb-2">{title}</h3>
      <p className="text-gray-600">{description}</p>
    </div>
  )
}

