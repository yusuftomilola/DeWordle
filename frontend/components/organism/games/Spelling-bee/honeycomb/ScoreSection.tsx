"use client";

import React, { useState } from "react";
import RankingProgress from "@/components/atoms/Spelling-bee/RankingProgess";
import {  CircleHelp } from "lucide-react";
import { HowToPlayModal } from "@/components/atoms/Spelling-bee/HowToPlayModal";
import { Progress } from "@/components/atoms/Spelling-bee/Progress";

interface Props {
  score: number;
  guessedWords: string[];
}

export default function ScoreSection({ guessedWords, score }: Props) {
    const [progress, setProgress] = useState(0);
    const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);
  return (
    <div>
      <div className="flex-1 mb-5">
        <RankingProgress score={score} className="mb-5" />
        <div className="border rounded-lg p-6">
          <h2 className="text-lg mb-4">
            You have found {guessedWords.length}{" "}
            {guessedWords.length === 1 ? "word" : "words"}
          </h2>
          {guessedWords.map(renderGuessedWord)}
        </div>
      </div>
      <div className="flex flex-col gap-2 max-w-md">
        {/* Help Icon - placed above or beside the box */}
        <div className="flex justify-end">
          <Progress value={progress} className="mb-4" />
          <button
            onClick={() => {
              setIsHowToPlayOpen(true);
              setProgress(25);
            }}
            className="flex items-center gap-2 text-sm text-gray-600 hover:text-black"
            title="How to Play"
          >
            <CircleHelp className="w-5 h-5" />
          </button>
        </div>
      </div>
      <HowToPlayModal
        open={isHowToPlayOpen}
        onOpenChange={setIsHowToPlayOpen}
      />
    </div>
  );

  function renderGuessedWord(word: string) {
    return (
      <div key={word} className="w-40 mb-4 border-b border-slate-300">
        {word.toUpperCase()}
      </div>
    );
  }
}
