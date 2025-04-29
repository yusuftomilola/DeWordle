'use client';

import { useState, useEffect, useCallback } from 'react';
import { RefreshCw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';

// Hexagon positions in a honeycomb pattern
const OUTER_POSITIONS = [
  { top: 0, left: '50%' }, // top
  { top: '25%', left: '85%' }, // top right
  { top: '75%', left: '85%' }, // bottom right
  { top: '100%', left: '50%' }, // bottom
  { top: '75%', left: '15%' }, // bottom left
  { top: '25%', left: '15%' }, // top left
];

export default function HoneycombGame() {
  const [centerLetter, setCenterLetter] = useState('P');
  const [outerLetters, setOuterLetters] = useState([
    'O',
    'I',
    'N',
    'A',
    'C',
    'T',
  ]);
  const [currentWord, setCurrentWord] = useState('');
  const [foundWords, setFoundWords] = useState([]);
  const [isShuffling, setIsShuffling] = useState(false);

  // Handle keyboard input
  useEffect(() => {
    const handleKeyDown = (e) => {
      const key = e.key.toUpperCase();

      // Handle letter keys
      if (/^[A-Z]$/.test(key)) {
        const validLetters = [centerLetter, ...outerLetters];
        if (validLetters.includes(key)) {
          setCurrentWord((prev) => prev + key);
        }
      }

      // Handle delete/backspace
      if (e.key === 'Backspace' || e.key === 'Delete') {
        setCurrentWord((prev) => prev.slice(0, -1));
      }

      // Handle enter
      if (e.key === 'Enter') {
        handleSubmit();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [centerLetter, outerLetters]);

  // Handle letter click
  const handleLetterClick = (letter) => {
    setCurrentWord((prev) => prev + letter);
  };

  // Handle delete button click
  const handleDelete = () => {
    setCurrentWord((prev) => prev.slice(0, -1));
  };

  // Handle shuffle button click
  const handleShuffle = () => {
    if (isShuffling) return;

    setIsShuffling(true);

    // Create a shuffled copy of the outer letters
    const shuffled = [...outerLetters];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    setOuterLetters(shuffled);

    // Reset shuffling state after animation completes
    setTimeout(() => {
      setIsShuffling(false);
    }, 500);
  };

  // Handle submit button click
  const handleSubmit = useCallback(() => {
    if (currentWord.length > 0) {
      // Check if the word contains the center letter
      if (currentWord.includes(centerLetter)) {
        // Check if the word hasn't been found before
        if (!foundWords.includes(currentWord)) {
          setFoundWords((prev) => [...prev, currentWord]);
        }
      }
      setCurrentWord('');
    }
  }, [currentWord, centerLetter, foundWords]);

  // Highlight letters in the current word
  const getLetterColor = (letter, isCenter) => {
    if (isCenter) return 'bg-yellow-200 text-indigo-900';
    return 'bg-gray-200 text-indigo-900 hover:bg-gray-300';
  };

  // Highlight letters in the current word display
  const getDisplayLetterColor = (letter, index) => {
    if (letter === centerLetter) return 'text-yellow-500';
    return 'text-indigo-900';
  };

  return (
    <div className="flex flex-col md:flex-row w-full max-w-6xl mx-auto p-4 gap-8 container">
      <div className="flex-1 flex flex-col items-center justify-center">
        {/* Current word display */}
        <div className="text-4xl font-bold  h-12 tracking-wider">
          {currentWord.split('').map((letter, index) => (
            <span key={index} className={getDisplayLetterColor(letter, index)}>
              {letter}
            </span>
          ))}
        </div>
        <div>
          {/* Honeycomb grid */}
          <div className="relative  mx-auto w-[300px] h-56 lg:md:mr-20 ">
            {/* Center hexagon */}
            <button
              className={`absolute top-1/2 left-1/2 transform   w-24 h-24 ${getLetterColor(
                centerLetter,
                true
              )} hexagon flex items-center justify-center text-2xl font-bold cursor-pointer`}
              onClick={() => handleLetterClick(centerLetter)}
            >
              {centerLetter}
            </button>

            {/* Outer hexagons */}
            <AnimatePresence>
              {outerLetters.map((letter, index) => (
                <motion.button
                  key={letter}
                  className={`absolute w-24 h-24  ${getLetterColor(
                    letter,
                    false
                  )} hexagon border-2 flex items-center justify-center text-xl font-bold cursor-pointer`}
                  style={{
                    top: OUTER_POSITIONS[index].top,
                    left: OUTER_POSITIONS[index].left,
                    transform: 'translate(-50%, -50%)',
                  }}
                  onClick={() => handleLetterClick(letter)}
                  animate={{
                    x: 0,
                    y: 0,
                    opacity: 1,
                    scale: 1,
                    transition: { duration: 0.5 },
                  }}
                  exit={{ opacity: 0, scale: 0.8 }}
                  initial={isShuffling ? { scale: 0.8, opacity: 0.5 } : false}
                >
                  {letter}
                </motion.button>
              ))}
            </AnimatePresence>
          </div>

          {/* Game controls */}
          <div className="flex justify-center items-center gap-4 my-32">
            <Button
              variant="outline"
              onClick={handleDelete}
              className="px-6 rounded-3xl"
            >
              Delete
            </Button>
            <Button
              variant="outline"
              onClick={handleShuffle}
              className="w-10 h-10 p-0 rounded-full"
              disabled={isShuffling}
            >
              <RefreshCw
                className={`w-4 h-4 ${isShuffling ? 'animate-spin' : ''}`}
              />
            </Button>
            <Button
              variant="outline"
              onClick={handleSubmit}
              className="px-6 rounded-3xl "
            >
              Enter
            </Button>
          </div>
        </div>
      </div>

      {/* Found words panel */}
      <div className="flex-1 border rounded-lg p-6 max-w-md">
        <h2 className="text-lg mb-4">You have found 0</h2>
      </div>
    </div>
  );
}
