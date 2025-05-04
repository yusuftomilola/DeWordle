'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

// Update the component to include the new game mechanics
export default function LetterBoxedGame() {
  const router = useRouter();
  const [currentWord, setCurrentWord] = useState('');
  const [selectedLetters, setSelectedLetters] = useState([]);
  const [paths, setPaths] = useState([]);
  const [solvedWords, setSolvedWords] = useState([]);
  const [lastSelectedSide, setLastSelectedSide] = useState(null);
  const [gameCompleted, setGameCompleted] = useState(false);
  const [targetWordCount] = useState(6);
  const [errorMessage, setErrorMessage] = useState(null);
  const [lastLetter, setLastLetter] = useState(null);
  const [isFirstWord, setIsFirstWord] = useState(true);
  const [completedPaths, setCompletedPaths] = useState([]);

  // Game letters configuration
  const letters = [
    // Top side
    { char: 'B', side: 'top', position: { x: 623, y: 175 } },
    { char: 'L', side: 'top', position: { x: 695, y: 175 } },
    { char: 'Z', side: 'top', position: { x: 765, y: 175 } },

    // Right side
    { char: 'E', side: 'right', position: { x: 820, y: 232 } },
    { char: 'W', side: 'right', position: { x: 820, y: 302 } },
    { char: 'O', side: 'right', position: { x: 820, y: 373 } },

    // Bottom side
    { char: 'D', side: 'bottom', position: { x: 695, y: 430 } },
    { char: 'I', side: 'bottom', position: { x: 765, y: 430 } },
    { char: 'A', side: 'bottom', position: { x: 623, y: 430 } },

    // Left side
    { char: 'M', side: 'left', position: { x: 568, y: 232 } },
    { char: 'T', side: 'left', position: { x: 568, y: 302 } },
    { char: 'F', side: 'left', position: { x: 568, y: 373 } },
  ];

  // Dictionary of valid words (simplified for demo)
  const validWords = ['BOLD', 'DOME', 'FLAT', 'WIFE', 'TEAM', 'ZEAL'];

  const handleLetterClick = (letter) => {
    // Clear any error message
    setErrorMessage(null);

    // If this is not the first word and we have a last letter constraint
    if (!isFirstWord && lastLetter && currentWord.length === 0) {
      // First letter of new word must match last letter of previous word
      if (letter.char !== lastLetter) {
        setErrorMessage(`First letter must be ${lastLetter}`);
        return;
      }
    }

    // Can't select from the same side twice in a row
    if (lastSelectedSide === letter.side) {
      return;
    }

    // Add letter to current word
    setCurrentWord((prev) => prev + letter.char);

    // Add to selected letters
    const newSelectedLetters = [...selectedLetters, letter];
    setSelectedLetters(newSelectedLetters);

    // Update last selected side
    setLastSelectedSide(letter.side);

    // Create path if we have at least two letters
    if (selectedLetters.length > 0) {
      const lastLetter = selectedLetters[selectedLetters.length - 1];
      setPaths([
        ...paths,
        {
          from: lastLetter,
          to: letter,
        },
      ]);
    }
  };

  const handleDelete = () => {
    // Clear any error message
    setErrorMessage(null);

    if (currentWord.length === 0) return;

    // Remove last letter
    setCurrentWord((prev) => prev.slice(0, -1));

    // Remove last selected letter
    const newSelectedLetters = [...selectedLetters];
    newSelectedLetters.pop();
    setSelectedLetters(newSelectedLetters);

    // Update last selected side
    if (newSelectedLetters.length > 0) {
      setLastSelectedSide(
        newSelectedLetters[newSelectedLetters.length - 1].side
      );
    } else {
      setLastSelectedSide(null);
    }

    // Remove last path
    const newPaths = [...paths];
    newPaths.pop();
    setPaths(newPaths);
  };

  const handleEnter = () => {
    // Check if word is valid
    if (
      validWords.includes(currentWord) &&
      !solvedWords.includes(currentWord)
    ) {
      // Store the completed paths before resetting
      setCompletedPaths([...completedPaths, ...paths]);

      // Add to solved words
      setSolvedWords([...solvedWords, currentWord]);

      // Set the last letter for the next word
      setLastLetter(currentWord[currentWord.length - 1]);

      // No longer the first word
      setIsFirstWord(false);

      // Reset current word
      resetCurrentWord();

      // Check if game is completed
      if (solvedWords.length + 1 >= targetWordCount) {
        setGameCompleted(true);
      }
    } else {
      // Invalid word
      if (!validWords.includes(currentWord)) {
        setErrorMessage('not in word list');
      } else if (solvedWords.includes(currentWord)) {
        setErrorMessage('word already used');
      }
    }
  };

  const handleRestart = () => {
    resetCurrentWord();
    setSolvedWords([]);
    setGameCompleted(false);
    setLastLetter(null);
    setIsFirstWord(true);
    setErrorMessage(null);
    setCompletedPaths([]);
  };

  const resetCurrentWord = () => {
    setCurrentWord('');
    setSelectedLetters([]);
    setPaths([]);
    setLastSelectedSide(null);
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#f4b8b8]">
      <div className="flex-1 flex lg:md:flex-row flex-col items-center justify-center p-4">
        <div className="flex-1 flex flex-col justify-center items-center">
          {/* Current word display with error message */}
          <div className="relative">
            <div className="text-3xl font-bold mb-2 min-h-[48px] text-center">
              {currentWord ||
                (solvedWords.length > 0
                  ? solvedWords[solvedWords.length - 1]
                  : '')}
            </div>

            {errorMessage && (
              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 bg-[#2e2e7a] text-white text-xs px-3 py-1 rounded-md min-w-[100px]">
                {errorMessage}
              </div>
            )}
          </div>

          <div className="border-b border-gray-700 lg:md:w-[460px] w-[300px] mb-4"></div>

          {/* Word count and history */}
          <div className="mb-2 text-center">
            <p className="text-gray-700">
              {solvedWords.length} {solvedWords.length === 1 ? 'word' : 'words'}
            </p>
            <p className="text-sm text-gray-600">
              {solvedWords.length > 0 && solvedWords.join(' - ')}
            </p>
          </div>

          {/* Instructions */}
          <p className="text-gray-700 mb-8 text-center">
            Try to solve in {targetWordCount} words
          </p>
        </div>
        <div className="flex-1 flex flex-col justify-center items-center">
          {/* Game board */}
          <div className="relative w-[300px] h-[300px] mb-10 p-8">
            {/* Square background */}
            <div className="absolute inset-0 border-2 border-gray-800 bg-gray-100/80"></div>

            {/* Paths between letters */}
            <svg
              className="absolute inset-0 w-full h-full pointer-events-none"
              viewBox="0 0 300 300"
            >
              {/* Completed word paths - solid lines */}
              {completedPaths.map((path, index) => {
                // Convert from game coordinates to SVG viewBox coordinates
                const fromX = (path.from.position.x - 568) * (300 / 252);
                const fromY = (path.from.position.y - 175) * (300 / 255);
                const toX = (path.to.position.x - 568) * (300 / 252);
                const toY = (path.to.position.y - 175) * (300 / 255);

                return (
                  <line
                    key={`completed-${index}`}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#f87171"
                    strokeWidth="1"
                    opacity="0.5"
                  />
                );
              })}

              {/* Current word paths - dashed lines */}
              {paths.map((path, index) => {
                // Convert from game coordinates to SVG viewBox coordinates
                const fromX = (path.from.position.x - 568) * (300 / 252);
                const fromY = (path.from.position.y - 175) * (300 / 255);
                const toX = (path.to.position.x - 568) * (300 / 252);
                const toY = (path.to.position.y - 175) * (300 / 255);

                return (
                  <line
                    key={`current-${index}`}
                    x1={fromX}
                    y1={fromY}
                    x2={toX}
                    y2={toY}
                    stroke="#f87171"
                    strokeWidth="2"
                    strokeDasharray="5,5"
                  />
                );
              })}
            </svg>

            {/* Letters */}
            {letters.map((letter, index) => {
              // Convert from game coordinates to relative positioning
              const left = (letter.position.x - 568) * (300 / 252);
              const top = (letter.position.y - 175) * (300 / 255);

              const isSelected = selectedLetters.some(
                (l) => l.char === letter.char && l.side === letter.side
              );

              // Highlight the letter if it's the required first letter for the next word
              const isHighlighted =
                currentWord.length === 0 &&
                !isFirstWord &&
                lastLetter === letter.char;

              // Position for the circle (on the box line)
              const circleLeft = left;
              const circleTop = top;

              // Position for the letter (outside the circle)
              let letterLeft = left;
              let letterTop = top;

              // Move letters outside the circles based on side
              if (letter.side === 'top') {
                letterTop -= 20;
              } else if (letter.side === 'right') {
                letterLeft += 20;
              } else if (letter.side === 'bottom') {
                letterTop += 20;
              } else if (letter.side === 'left') {
                letterLeft -= 20;
              }

              return (
                <div
                  key={index}
                  className="absolute"
                  style={{ left: 0, top: 0 }}
                >
                  {/* Circle on the box line */}
                  <button
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-4 h-4 rounded-full flex items-center justify-center text-lg font-medium border-black border-2
                    ${
                      isSelected
                        ? 'bg-red-400 text-white'
                        : isHighlighted
                        ? 'bg-red-200 text-gray-900 border-2 border-red-400'
                        : 'bg-white text-gray-900 border border-gray-300'
                    }
                    hover:bg-red-300 transition-colors `}
                    style={{
                      left: `${circleLeft}px`,
                      top: `${circleTop}px`,
                      transform: 'translate(-50%, -50%)',
                    }}
                    onClick={() => handleLetterClick(letter)}
                  ></button>

                  {/* Letter outside the circle */}
                  <div
                    className={`absolute transform -translate-x-1/2 -translate-y-1/2 w-8 h-8 rounded-full flex items-center justify-center text-2xl font-medium text-white`}
                    style={{ left: `${letterLeft}px`, top: `${letterTop}px` }}
                  >
                    {letter.char}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Game controls */}
          <div className="flex gap-4">
            <button
              className="px-6 py-2 rounded-full bg-[#f4b8b8] border border-[#2e2e7a] hover:bg-[#e99a9a] text-gray-700 transition-colors"
              onClick={handleRestart}
            >
              Restart
            </button>

            <button
              className="px-6 py-2 rounded-full bg-[#f4b8b8] border border-[#2e2e7a] hover:bg-[#e99a9a] text-gray-700 transition-colors"
              onClick={handleDelete}
            >
              Delete
            </button>

            <button
              className="px-6 py-2 rounded-full bg-[#f4b8b8] border border-[#2e2e7a] hover:bg-[#e99a9a] text-gray-700 transition-colors"
              onClick={handleEnter}
            >
              Enter
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
