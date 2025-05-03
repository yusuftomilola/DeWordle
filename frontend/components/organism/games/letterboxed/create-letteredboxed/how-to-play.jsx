'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function HowToPlayModal({ onClose }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: 'Start with any letter',
      description: 'Begin your word by selecting any letter on the board.',
      animation: <StartAnimation />,
    },
    {
      title: 'Build words by connecting letters',
      description:
        'Connect letters from different sides of the box to form words. Letters must be from different sides.',
      animation: <ConnectAnimation />,
    },
    {
      title: 'No repeats from the same side',
      description:
        'You cannot use two letters from the same side consecutively.',
      animation: <NoRepeatsAnimation />,
    },
    {
      title: 'Use all letters to win',
      description:
        'Your goal is to use every letter on the board at least once to win the game.',
      animation: <WinAnimation />,
    },
  ];

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.9, opacity: 0 }}
        transition={{ type: 'spring', damping: 25 }}
        className="bg-white dark:bg-slate-800 rounded-2xl p-6 max-w-md w-full shadow-2xl"
      >
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-[#f4b8b8] dark:text-purple-400">
            How to Play
          </h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="rounded-full h-8 w-8"
          >
            <X className="h-4 w-4" />
            <span className="sr-only">Close</span>
          </Button>
        </div>

        <div className="relative overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStep}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="mb-6"
            >
              <h3 className="text-xl font-semibold mb-2">
                {steps[currentStep].title}
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                {steps[currentStep].description}
              </p>

              <div className="bg-slate-100 dark:bg-slate-700 rounded-xl p-4 aspect-square">
                {steps[currentStep].animation}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        <div className="flex justify-between mt-6">
          <Button
            variant="outline"
            onClick={prevStep}
            disabled={currentStep === 0}
            className="px-4"
          >
            Previous
          </Button>

          <div className="flex space-x-1">
            {steps.map((_, idx) => (
              <div
                key={idx}
                className={`w-2 h-2 rounded-full ${
                  idx === currentStep
                    ? 'bg-[#f4b8b8]'
                    : 'bg-slate-300 dark:bg-slate-600'
                }`}
              />
            ))}
          </div>

          <Button
            onClick={nextStep}
            className="bg-[#f4b8b8] hover:bg-[#f4b8b8] px-4"
          >
            {currentStep === steps.length - 1 ? 'Finish' : 'Next'}
          </Button>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Animation components for each step
function StartAnimation() {
  const [active, setActive] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setActive((prev) => !prev);
    }, 1500);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="w-3/4 h-3/4 border-4 border-slate-300 dark:border-slate-600 rounded-lg relative">
        {/* Sample letters */}
        {['S', 'N', 'O', 'W', 'A', 'R', 'M', 'I', 'T', 'H', 'E', 'D'].map(
          (letter, idx) => {
            const position =
              idx < 3 ? 'top' : idx < 6 ? 'right' : idx < 9 ? 'bottom' : 'left';
            const index = idx % 3;

            let x, y;
            const size = 100;
            const padding = -10;

            switch (position) {
              case 'top':
                x = padding + (size / 3) * (index + 0.5);
                y = padding;
                break;
              case 'right':
                x = padding + size;
                y = padding + (size / 3) * (index + 0.5);
                break;
              case 'bottom':
                x = padding + size - (size / 3) * (index + 0.5);
                y = padding + size;
                break;
              case 'left':
                x = padding;
                y = padding + size - (size / 3) * (index + 0.5);
                break;
            }

            const isHighlighted = letter === 'S' && active;

            return (
              <motion.div
                key={`${position}-${index}`}
                className={`absolute w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full
                ${
                  isHighlighted
                    ? 'bg-[#f4b8b8] text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: isHighlighted ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  scale: { duration: 0.5 },
                }}
              >
                {letter}
              </motion.div>
            );
          }
        )}

        {/* Animated hand cursor */}
        <motion.div
          className="absolute w-10 h-10 pointer-events-none"
          style={{
            left: '25%',
            top: '10%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            scale: active ? 0.8 : 1,
            opacity: active ? 0.7 : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          👆
        </motion.div>
      </div>
    </div>
  );
}

function ConnectAnimation() {
  const [step, setStep] = useState(0);
  const [path, setPath] = useState([]);

  useEffect(() => {
    const sequence = [
      ['S'],
      ['S', 'W'],
      ['S', 'W', 'A'],
      ['S', 'W', 'A', 'R'],
      ['S', 'W', 'A', 'R', 'M'],
      [],
    ];

    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % sequence.length);
      setPath(sequence[step]);
    }, 1000);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="w-3/4 h-3/4 border-4 border-slate-300 dark:border-slate-600 rounded-lg relative">
        {/* Sample letters */}
        {['S', 'N', 'O', 'W', 'A', 'R', 'M', 'I', 'T', 'H', 'E', 'D'].map(
          (letter, idx) => {
            const position =
              idx < 3 ? 'top' : idx < 6 ? 'right' : idx < 9 ? 'bottom' : 'left';
            const index = idx % 3;

            let x, y;
            const size = 100;
            const padding = -10;

            switch (position) {
              case 'top':
                x = padding + (size / 3) * (index + 0.5);
                y = padding;
                break;
              case 'right':
                x = padding + size;
                y = padding + (size / 3) * (index + 0.5);
                break;
              case 'bottom':
                x = padding + size - (size / 3) * (index + 0.5);
                y = padding + size;
                break;
              case 'left':
                x = padding;
                y = padding + size - (size / 3) * (index + 0.5);
                break;
            }

            const isHighlighted = path.includes(letter);

            return (
              <motion.div
                key={`${position}-${index}`}
                className={`absolute w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full
                ${
                  isHighlighted
                    ? 'bg-[#f4b8b8] text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: 10,
                }}
                animate={{
                  scale: isHighlighted ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
              >
                {letter}
              </motion.div>
            );
          }
        )}

        {/* Path lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none">
          {path.length > 1 &&
            path.slice(0, -1).map((letter, idx) => {
              const nextLetter = path[idx + 1];

              // Get positions for current and next letter
              const getPosition = (l) => {
                const letterIdx = [
                  'S',
                  'N',
                  'O',
                  'W',
                  'A',
                  'R',
                  'M',
                  'I',
                  'T',
                  'H',
                  'E',
                  'D',
                ].indexOf(l);
                const position =
                  letterIdx < 3
                    ? 'top'
                    : letterIdx < 6
                    ? 'right'
                    : letterIdx < 9
                    ? 'bottom'
                    : 'left';
                const index = letterIdx % 3;

                let x, y;
                const size = 100;
                const padding = 10;

                switch (position) {
                  case 'top':
                    x = padding + (size / 3) * (index + 0.5);
                    y = padding;
                    break;
                  case 'right':
                    x = padding + size;
                    y = padding + (size / 3) * (index + 0.5);
                    break;
                  case 'bottom':
                    x = padding + size - (size / 3) * (index + 0.5);
                    y = padding + size;
                    break;
                  case 'left':
                    x = padding;
                    y = padding + size - (size / 3) * (index + 0.5);
                    break;
                }

                return { x, y };
              };

              const start = getPosition(letter);
              const end = getPosition(nextLetter);

              return (
                <motion.line
                  key={`line-${idx}`}
                  x1={`${start.x}%`}
                  y1={`${start.y}%`}
                  x2={`${end.x}%`}
                  y2={`${end.y}%`}
                  stroke="#f4b8b8"
                  strokeWidth="3"
                  strokeLinecap="round"
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{ duration: 0.4, delay: 0.1 }}
                />
              );
            })}
        </svg>

        {/* Word display */}
        {path.length > 0 && (
          <motion.div
            className="absolute bottom-[-40px] left-1/2 transform -translate-x-1/2 bg-purple-100 dark:bg-purple-900/30 px-4 py-1 rounded-full text-[#f4b8b8] dark:text-purple-200 font-bold"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
          >
            {path.join('')}
          </motion.div>
        )}
      </div>
    </div>
  );
}

function NoRepeatsAnimation() {
  const [step, setStep] = useState(0);
  const [showError, setShowError] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setStep((prev) => (prev + 1) % 4);
      if (step === 2) {
        setShowError(true);
        setTimeout(() => setShowError(false), 800);
      } else {
        setShowError(false);
      }
    }, 1200);

    return () => clearInterval(interval);
  }, [step]);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="w-3/4 h-3/4 border-4 border-slate-300 dark:border-slate-600 rounded-lg relative">
        {/* Sample letters */}
        {['S', 'N', 'O', 'W', 'A', 'R', 'M', 'I', 'T', 'H', 'E', 'D'].map(
          (letter, idx) => {
            const position =
              idx < 3 ? 'top' : idx < 6 ? 'right' : idx < 9 ? 'bottom' : 'left';
            const index = idx % 3;

            let x, y;
            const size = 100;
            const padding = -10;

            switch (position) {
              case 'top':
                x = padding + (size / 3) * (index + 0.5);
                y = padding;
                break;
              case 'right':
                x = padding + size;
                y = padding + (size / 3) * (index + 0.5);
                break;
              case 'bottom':
                x = padding + size - (size / 3) * (index + 0.5);
                y = padding + size;
                break;
              case 'left':
                x = padding;
                y = padding + size - (size / 3) * (index + 0.5);
                break;
            }

            // Highlight S and then N (same side) to show invalid move
            const isHighlighted =
              (step === 1 && letter === 'S') ||
              (step === 2 && (letter === 'S' || letter === 'N'));
            const isError = step === 2 && letter === 'N';

            return (
              <motion.div
                key={`${position}-${index}`}
                className={`absolute w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full
                ${
                  isError
                    ? 'bg-red-500 text-white'
                    : isHighlighted
                    ? 'bg-[#f4b8b8] text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: isHighlighted ? [1, 1.2, 1] : 1,
                  x: isError ? [0, -5, 5, -5, 5, 0] : 0,
                }}
                transition={{
                  scale: { duration: 0.3 },
                  x: { duration: 0.4 },
                }}
              >
                {letter}
              </motion.div>
            );
          }
        )}

        {/* Error message */}
        <AnimatePresence>
          {showError && (
            <motion.div
              className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-red-500 text-white px-4 py-2 rounded-full font-bold"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
            >
              Invalid Move!
            </motion.div>
          )}
        </AnimatePresence>

        {/* Hand cursor */}
        <motion.div
          className="absolute w-10 h-10 pointer-events-none"
          style={{
            left: step === 0 ? '25%' : '40%',
            top: '10%',
            transform: 'translate(-50%, -50%)',
          }}
          animate={{
            x: step === 1 ? [0, 15] : 0,
            scale: step === 1 || step === 2 ? 0.8 : 1,
            opacity: step === 1 || step === 2 ? 0.7 : 1,
          }}
          transition={{
            duration: 0.3,
          }}
        >
          👆
        </motion.div>
      </div>
    </div>
  );
}

function WinAnimation() {
  const [highlightedLetters, setHighlightedLetters] = useState([]);
  const [complete, setComplete] = useState(false);

  useEffect(() => {
    const letters = [
      'S',
      'N',
      'O',
      'W',
      'A',
      'R',
      'M',
      'I',
      'T',
      'H',
      'E',
      'D',
    ];
    let currentIndex = 0;

    const interval = setInterval(() => {
      if (currentIndex < letters.length) {
        setHighlightedLetters((prev) => [...prev, letters[currentIndex]]);
        currentIndex++;
      } else {
        clearInterval(interval);
        setTimeout(() => {
          setComplete(true);
        }, 500);
      }
    }, 300);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full h-full relative flex items-center justify-center">
      <div className="w-3/4 h-3/4 border-4 border-slate-300 dark:border-slate-600 rounded-lg relative">
        {/* Sample letters */}
        {['S', 'N', 'O', 'W', 'A', 'R', 'M', 'I', 'T', 'H', 'E', 'D'].map(
          (letter, idx) => {
            const position =
              idx < 3 ? 'top' : idx < 6 ? 'right' : idx < 9 ? 'bottom' : 'left';
            const index = idx % 3;

            let x, y;
            const size = 100;
            const padding = -10;

            switch (position) {
              case 'top':
                x = padding + (size / 3) * (index + 0.5);
                y = padding;
                break;
              case 'right':
                x = padding + size;
                y = padding + (size / 3) * (index + 0.5);
                break;
              case 'bottom':
                x = padding + size - (size / 3) * (index + 0.5);
                y = padding + size;
                break;
              case 'left':
                x = padding;
                y = padding + size - (size / 3) * (index + 0.5);
                break;
            }

            const isHighlighted = highlightedLetters.includes(letter);

            return (
              <motion.div
                key={`${position}-${index}`}
                className={`absolute w-8 h-8 flex items-center justify-center text-lg font-bold rounded-full
                ${
                  isHighlighted
                    ? 'bg-[#f4b8b8] text-white'
                    : 'bg-slate-200 dark:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                style={{
                  left: `${x}%`,
                  top: `${y}%`,
                  transform: 'translate(-50%, -50%)',
                }}
                animate={{
                  scale: isHighlighted ? [1, 1.2, 1] : 1,
                }}
                transition={{
                  scale: { duration: 0.3 },
                }}
              >
                {letter}
              </motion.div>
            );
          }
        )}

        {/* Win message */}
        <AnimatePresence>
          {complete && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              <motion.div
                className="bg-green-100 dark:bg-green-900/30 px-6 py-3 rounded-xl text-green-800 dark:text-green-200 font-bold text-xl"
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{
                  type: 'spring',
                  stiffness: 300,
                  damping: 15,
                }}
              >
                You Win! 🎉
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
