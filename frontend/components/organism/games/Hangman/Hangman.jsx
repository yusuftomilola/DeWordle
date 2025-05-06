"use client";

import { useState, useEffect } from "react";
import { Play, Trophy, HelpCircle, Lightbulb, Info } from "lucide-react";
import HangmanDrawing from "./hangman-drawing";
import Keyboard from "./keyboard";
import WordDisplay from "./word-display";
import GameOverModal from "./game-over-modal";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import confetti from "canvas-confetti";

// Word categories with examples for clues
const CATEGORIES = {
  verbs: {
    name: "Verb",
    description: "An action word",
    examples: [
      "run",
      "jump",
      "swim",
      "eat",
      "sleep",
      "write",
      "read",
      "sing",
      "dance",
      "play",
    ],
  },
  nouns: {
    name: "Noun",
    description: "A person, place, or thing",
    examples: [
      "house",
      "tree",
      "book",
      "computer",
      "mountain",
      "ocean",
      "teacher",
      "student",
      "dog",
      "cat",
    ],
  },
  animals: {
    name: "Animal",
    description: "A living creature",
    examples: [
      "elephant",
      "giraffe",
      "tiger",
      "penguin",
      "dolphin",
      "eagle",
      "snake",
      "spider",
      "monkey",
      "zebra",
    ],
  },
  foods: {
    name: "Food",
    description: "Something to eat",
    examples: [
      "pizza",
      "hamburger",
      "spaghetti",
      "sushi",
      "chocolate",
      "apple",
      "banana",
      "carrot",
      "bread",
      "cheese",
    ],
  },
  countries: {
    name: "Country",
    description: "A nation in the world",
    examples: [
      "france",
      "japan",
      "brazil",
      "canada",
      "australia",
      "egypt",
      "india",
      "mexico",
      "italy",
      "china",
    ],
  },
  cars: {
    name: "Car",
    description: "A vehicle with four wheels",
    examples: [
      "toyota",
      "honda",
      "ford",
      "tesla",
      "bmw",
      "mercedes",
      "audi",
      "porsche",
      "ferrari",
      "jeep",
    ],
  },
  desserts: {
    name: "Dessert",
    description: "A sweet treat",
    examples: [
      "cake",
      "icecream",
      "cookie",
      "brownie",
      "pudding",
      "pie",
      "cupcake",
      "donut",
      "chocolate",
      "candy",
    ],
  },
  sports: {
    name: "Sport",
    description: "A physical activity or game",
    examples: [
      "soccer",
      "basketball",
      "tennis",
      "swimming",
      "baseball",
      "golf",
      "hockey",
      "volleyball",
      "rugby",
      "cricket",
    ],
  },
  programming: {
    name: "Programming",
    description: "Related to coding",
    examples: [
      "javascript",
      "python",
      "react",
      "function",
      "variable",
      "algorithm",
      "database",
      "component",
      "interface",
      "typescript",
    ],
  },
  fallback: {
    name: "Word",
    description: "A sequence of letters",
    examples: [
      "guess",
      "word",
      "letter",
      "hangman",
      "game",
      "play",
      "challenge",
      "puzzle",
      "solve",
      "think",
    ],
  },
};

// Fallback words with categories
const fallbackWords = [
  { word: "JAVASCRIPT", category: "programming" },
  { word: "REACT", category: "programming" },
  { word: "PYTHON", category: "programming" },
  { word: "ELEPHANT", category: "animals" },
  { word: "GIRAFFE", category: "animals" },
  { word: "TIGER", category: "animals" },
  { word: "PIZZA", category: "foods" },
  { word: "HAMBURGER", category: "foods" },
  { word: "SPAGHETTI", category: "foods" },
  { word: "FRANCE", category: "countries" },
  { word: "JAPAN", category: "countries" },
  { word: "BRAZIL", category: "countries" },
  { word: "TOYOTA", category: "cars" },
  { word: "HONDA", category: "cars" },
  { word: "FERRARI", category: "cars" },
  { word: "CAKE", category: "desserts" },
  { word: "ICECREAM", category: "desserts" },
  { word: "COOKIE", category: "desserts" },
  { word: "SOCCER", category: "sports" },
  { word: "BASKETBALL", category: "sports" },
  { word: "TENNIS", category: "sports" },
  { word: "RUN", category: "verbs" },
  { word: "JUMP", category: "verbs" },
  { word: "SWIM", category: "verbs" },
  { word: "HOUSE", category: "nouns" },
  { word: "TREE", category: "nouns" },
  { word: "BOOK", category: "nouns" },
];

export default function Hangman() {
  const [gameStarted, setGameStarted] = useState(false);
  const [word, setWord] = useState("");
  const [category, setCategory] = useState("fallback");
  const [guessedLetters, setGuessedLetters] = useState([]);
  const [wrongGuesses, setWrongGuesses] = useState(0);
  const [score, setScore] = useState(0);
  const [gameOver, setGameOver] = useState(false);
  const [gameWon, setGameWon] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [error, setError] = useState(null);
  const [isUsingFallback, setIsUsingFallback] = useState(false);
  const [showHowToPlay, setShowHowToPlay] = useState(false);

  const MAX_WRONG_GUESSES = 6;

  useEffect(() => {
    // Load score from localStorage on initial render
    const savedScore = localStorage.getItem("hangmanScore");
    if (savedScore) {
      setScore(Number.parseInt(savedScore));
    }
  }, []);

  // Function to get a random word from the fallback list
  const getRandomFallbackWord = () => {
    const randomIndex = Math.floor(Math.random() * fallbackWords.length);
    return fallbackWords[randomIndex];
  };

  // Function to trigger confetti
  const triggerWinConfetti = () => {
    const duration = 3000;
    const animationEnd = Date.now() + duration;
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 };

    // min: number, max: number
    const randomInRange = (min, max) => {
      return Math.random() * (max - min) + min;
    };

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now();

      if (timeLeft <= 0) {
        return clearInterval(interval);
      }

      const particleCount = 50 * (timeLeft / duration);

      // Since particles fall down, start a bit higher than random
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.1, 0.3), y: Math.random() - 0.2 },
        colors: [
          "#26ccff",
          "#a25afd",
          "#ff5e7e",
          "#88ff5a",
          "#fcff42",
          "#ffa62d",
          "#ff36ff",
        ],
      });
      confetti({
        ...defaults,
        particleCount,
        origin: { x: randomInRange(0.7, 0.9), y: Math.random() - 0.2 },
        colors: [
          "#26ccff",
          "#a25afd",
          "#ff5e7e",
          "#88ff5a",
          "#fcff42",
          "#ffa62d",
          "#ff36ff",
        ],
      });
    }, 250);
  };

  const startGame = async () => {
    setIsLoading(true);
    setShowHint(false);
    setError(null);
    setIsUsingFallback(false);

    try {
      // Try to fetch a word from the API
      const response = await fetch("/api/words/random");

      // Check if response is OK
      if (!response.ok) {
        throw new Error(`API responded with status: ${response.status}`);
      }

      // Parse the response
      const data = await response.json();

      // Check if data has the expected structure
      if (data && typeof data.word === "string") {
        setWord(data.word.toUpperCase());
        setCategory(data.category?.toLowerCase() || "fallback");

        // If the API returned a word but we're using the fallback mechanism
        // (this happens when our API route uses fallback but still returns a 200)
        if (data._fallback) {
          setIsUsingFallback(true);
        }
      } else {
        throw new Error("Invalid response format from API");
      }
    } catch (error) {
      console.error("Failed to fetch word:", error);

      // Use a fallback word directly in the component
      const fallbackWord = getRandomFallbackWord();
      setWord(fallbackWord.word);
      setCategory(fallbackWord.category);
      setIsUsingFallback(true);

      // Show a non-blocking warning
      setError("Using local word bank. Connect to the server for more words!");
    } finally {
      // Reset game state regardless of success/failure
      setGuessedLetters([]);
      setWrongGuesses(0);
      setGameStarted(true);
      setGameOver(false);
      setGameWon(false);
      setIsLoading(false);
    }
  };

  const handleGuess = (letter) => {
    if (gameOver || guessedLetters.includes(letter)) return;

    const newGuessedLetters = [...guessedLetters, letter];
    setGuessedLetters(newGuessedLetters);

    if (!word.includes(letter)) {
      const newWrongGuesses = wrongGuesses + 1;
      setWrongGuesses(newWrongGuesses);

      if (newWrongGuesses >= MAX_WRONG_GUESSES) {
        setGameOver(true);
        setGameWon(false);
      }
    } else {
      // Check if player has won
      const isWon = word
        .split("")
        .every((char) => newGuessedLetters.includes(char) || char === " ");

      if (isWon) {
        setGameWon(true);
        setGameOver(true);
        const newScore = score + 1;
        setScore(newScore);
        localStorage.setItem("hangmanScore", newScore.toString());

        // Trigger confetti animation
        setTimeout(() => {
          triggerWinConfetti();
        }, 300);
      }
    }
  };

  // Get category info or fallback
  const categoryInfo = CATEGORIES[category] || CATEGORIES.fallback;

  // Get random examples from the category
  const getRandomExamples = () => {
    const examples = categoryInfo.examples;
    const shuffled = [...examples].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 3);
  };

  const toggleHint = () => {
    setShowHint(!showHint);
  };

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-lg shadow-lg overflow-hidden">
      <div className="relative bg-grid-pattern min-h-[500px] flex flex-col items-center justify-between p-6">
        <div className="absolute top-0 left-0 w-full h-full bg-grid-pattern opacity-20 pointer-events-none"></div>

        <div className="flex justify-between items-center w-full relative z-10 mb-4">
          <h1 className="text-4xl font-bold text-blue-500 tracking-wider">
            HANGMAN
          </h1>

          <Button
            variant="ghost"
            size="sm"
            className="flex items-center gap-1 text-blue-600"
            onClick={() => setShowHowToPlay(true)}
          >
            <Info className="h-4 w-4" />
            <span className="hidden sm:inline">How to Play</span>
          </Button>
        </div>

        {!gameStarted ? (
          <div className="flex flex-col items-center justify-center flex-grow">
            {error && (
              <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md text-amber-700 max-w-md text-center">
                {error}
              </div>
            )}
            <button
              onClick={startGame}
              disabled={isLoading}
              className="bg-green-400 hover:bg-green-500 text-white rounded-full w-24 h-24 flex items-center justify-center transition-colors duration-200"
            >
              {isLoading ? (
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
              ) : (
                <Play size={48} />
              )}
            </button>
          </div>
        ) : (
          <>
            <div className="flex flex-col items-center justify-center w-full">
              {/* Fallback Notice */}
              {isUsingFallback && (
                <div className="mb-4 px-3 py-1 bg-amber-50 border border-amber-200 rounded-md text-amber-700 text-xs">
                  Using local word bank. Connect to the server for more words!
                </div>
              )}

              {/* Category Badge and Hint */}
              <div className="mb-4 flex items-center gap-2">
                <Badge
                  variant="outline"
                  className="bg-blue-100 text-blue-800 border-blue-300 px-3 py-1 text-sm"
                >
                  Category: {categoryInfo.name}
                </Badge>

                {/* <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full" onClick={toggleHint}>
                        <HelpCircle className="h-4 w-4" />
                        <span className="sr-only">Show hint</span>
                      </Button>
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Show/hide hint</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider> */}
              </div>

              {/* Hint Box */}
              {showHint && (
                <div className="mb-4 p-3 bg-amber-50 border border-amber-200 rounded-md w-full max-w-md text-center">
                  <div className="flex items-center justify-center gap-2 mb-1">
                    <Lightbulb className="h-4 w-4 text-amber-500" />
                    <span className="font-medium text-amber-700">Hint</span>
                  </div>
                  <p className="text-amber-800 text-sm mb-1">
                    {categoryInfo.description}
                  </p>
                  <p className="text-amber-700 text-xs">
                    Examples: {getRandomExamples().join(", ")}
                  </p>
                </div>
              )}

              <HangmanDrawing
                wrongGuesses={wrongGuesses}
                gameOver={gameOver}
                won={gameWon}
              />
              <WordDisplay
                word={word}
                guessedLetters={guessedLetters}
                gameOver={gameOver}
              />
            </div>

            <Keyboard
              guessedLetters={guessedLetters}
              onGuess={handleGuess}
              word={word}
              disabled={gameOver}
            />
          </>
        )}

        <div className="flex items-center mt-4 text-yellow-600 font-bold">
          <Trophy size={24} />
          <span className="ml-2 text-2xl">{score}</span>
        </div>
      </div>

      {gameOver && (
        <GameOverModal
          isOpen={gameOver}
          onClose={() => setGameStarted(false)}
          onPlayAgain={startGame}
          won={gameWon}
          word={word}
          category={categoryInfo.name}
        />
      )}
    </div>
  );
}
