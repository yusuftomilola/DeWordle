"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
// import confetti from "canvas-confetti";
import Link from "next/link";

export default function HangmanSection() {
  const [animationState, setAnimationState] = useState("intro");
  const [guessCount, setGuessCount] = useState(0);
  const canvasRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);

  // Progress through animation states
  useEffect(() => {
    if (!isPlaying) return;

    const states = [
      "intro",
      "wrong1",
      "wrong2",
      "wrong3",
      "wrong4",
      "win",
      "lose",
    ];

    let currentIndex = states.indexOf(animationState);

    const interval = setInterval(() => {
      currentIndex = (currentIndex + 1) % states.length;
      setAnimationState(states[currentIndex]);

      // Trigger confetti on win state
      if (states[currentIndex] === "win" && typeof window !== "undefined") {
        confetti({
          particleCount: 150,
          spread: 90,
          origin: { y: 0.6 },
          colors: ["#ffffff", "#0a192f", "#4299e1"],
        });
      }

      setGuessCount((prev) => prev + 1);
    }, 3000);

    return () => clearInterval(interval);
  }, [animationState, isPlaying]);

  // Draw the stickman animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 300;
    canvas.height = 300;

    // Animation variables
    let frameCount = 0;
    let animationFrameId;

    // Clear canvas
    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Draw gallows
    const drawGallows = () => {
      ctx.strokeStyle = "#0a192f"; // Navy blue
      ctx.lineWidth = 4;
      ctx.beginPath();

      // Base
      ctx.moveTo(60, 250);
      ctx.lineTo(240, 250);

      // Trapdoor
      if (animationState === "lose") {
        // Open trapdoor
        ctx.moveTo(120, 250);
        ctx.lineTo(100, 270);

        ctx.moveTo(180, 250);
        ctx.lineTo(200, 270);
      } else {
        // Closed trapdoor
        ctx.moveTo(120, 250);
        ctx.lineTo(180, 250);
      }

      // Pole
      ctx.moveTo(100, 250);
      ctx.lineTo(100, 50);

      // Top
      ctx.lineTo(180, 50);

      // Rope
      if (
        ["wrong1", "wrong2", "wrong3", "wrong4", "lose"].includes(
          animationState
        )
      ) {
        const ropeLength =
          animationState === "wrong1"
            ? 60
            : animationState === "wrong2"
            ? 65
            : animationState === "wrong3"
            ? 70
            : 75; // For wrong4 and lose

        ctx.moveTo(180, 50);
        ctx.lineTo(180, ropeLength);
      }

      ctx.stroke();
    };

    // Draw stickman
    const drawStickman = () => {
      ctx.strokeStyle = "#0a192f"; // Navy blue
      ctx.lineWidth = 3;
      ctx.beginPath();

      if (animationState === "intro") {
        // Nervous stickman looking up at the gallows
        const nervousShake = Math.sin(frameCount * 0.2) * 2;

        // Head
        ctx.arc(150, 120 + nervousShake, 15, 0, Math.PI * 2);

        // Eyes looking up
        ctx.moveTo(145, 115 + nervousShake);
        ctx.arc(145, 115 + nervousShake, 2, 0, Math.PI * 2);
        ctx.moveTo(155, 115 + nervousShake);
        ctx.arc(155, 115 + nervousShake, 2, 0, Math.PI * 2);

        // Worried mouth
        ctx.moveTo(145, 125 + nervousShake);
        ctx.bezierCurveTo(
          145,
          128 + nervousShake,
          155,
          128 + nervousShake,
          155,
          125 + nervousShake
        );

        // Body
        ctx.moveTo(150, 135 + nervousShake);
        ctx.lineTo(150, 180 + nervousShake);

        // Arms - shaking
        ctx.moveTo(150, 150 + nervousShake);
        ctx.lineTo(135, 165 + nervousShake * 1.5);

        ctx.moveTo(150, 150 + nervousShake);
        ctx.lineTo(165, 165 + nervousShake * 1.5);

        // Legs
        ctx.moveTo(150, 180 + nervousShake);
        ctx.lineTo(140, 210 + nervousShake);

        ctx.moveTo(150, 180 + nervousShake);
        ctx.lineTo(160, 210 + nervousShake);
      } else if (
        ["wrong1", "wrong2", "wrong3", "wrong4"].includes(animationState)
      ) {
        // Stickman with noose getting tighter
        const fearShake = Math.sin(frameCount * 0.3) * 3;
        const neckHeight =
          animationState === "wrong1"
            ? 75
            : animationState === "wrong2"
            ? 80
            : animationState === "wrong3"
            ? 85
            : 90; // For wrong4

        // Head
        ctx.arc(180, neckHeight + 15 + fearShake, 15, 0, Math.PI * 2);

        // Scared eyes
        ctx.moveTo(175, neckHeight + 10 + fearShake);
        ctx.arc(175, neckHeight + 10 + fearShake, 2, 0, Math.PI * 2);
        ctx.moveTo(185, neckHeight + 10 + fearShake);
        ctx.arc(185, neckHeight + 10 + fearShake, 2, 0, Math.PI * 2);

        // Worried mouth - more worried as wrong guesses increase
        ctx.moveTo(175, neckHeight + 20 + fearShake);
        const mouthCurve =
          animationState === "wrong1"
            ? -1
            : animationState === "wrong2"
            ? -2
            : animationState === "wrong3"
            ? -3
            : -4; // For wrong4
        ctx.bezierCurveTo(
          175,
          neckHeight + 20 + mouthCurve + fearShake,
          185,
          neckHeight + 20 + mouthCurve + fearShake,
          185,
          neckHeight + 20 + fearShake
        );

        // Body
        ctx.moveTo(180, neckHeight + 30 + fearShake);
        ctx.lineTo(180, neckHeight + 80 + fearShake);

        // Arms - increasingly drooping
        const armDroop =
          animationState === "wrong1"
            ? 0
            : animationState === "wrong2"
            ? 5
            : animationState === "wrong3"
            ? 10
            : 15; // For wrong4

        ctx.moveTo(180, neckHeight + 45 + fearShake);
        ctx.lineTo(165, neckHeight + 60 + armDroop + fearShake);

        ctx.moveTo(180, neckHeight + 45 + fearShake);
        ctx.lineTo(195, neckHeight + 60 + armDroop + fearShake);

        // Legs - increasingly limp
        const legDroop =
          animationState === "wrong1"
            ? 0
            : animationState === "wrong2"
            ? 3
            : animationState === "wrong3"
            ? 6
            : 10; // For wrong4

        ctx.moveTo(180, neckHeight + 80 + fearShake);
        ctx.lineTo(170, neckHeight + 110 + legDroop + fearShake);

        ctx.moveTo(180, neckHeight + 80 + fearShake);
        ctx.lineTo(190, neckHeight + 110 + legDroop + fearShake);
      } else if (animationState === "lose") {
        // Slumped stickman as trapdoor drops
        const swingAngle = Math.sin(frameCount * 0.1) * 0.1;

        // Calculate position with swing
        const centerX = 180;
        const topY = 75;
        const radius = 15;

        // Translate to rope point and rotate
        ctx.save();
        ctx.translate(centerX, topY);
        ctx.rotate(swingAngle);

        // Head (slumped to side)
        ctx.arc(0, radius, radius, 0, Math.PI * 2);

        // X eyes
        ctx.moveTo(-5, radius - 5);
        ctx.lineTo(-2, radius - 2);
        ctx.moveTo(-5, radius - 2);
        ctx.lineTo(-2, radius - 5);

        ctx.moveTo(5, radius - 5);
        ctx.lineTo(2, radius - 2);
        ctx.moveTo(5, radius - 2);
        ctx.lineTo(2, radius - 5);

        // Mouth (straight line)
        ctx.moveTo(-5, radius + 5);
        ctx.lineTo(5, radius + 5);

        // Body (hanging limp)
        ctx.moveTo(0, radius * 2);
        ctx.lineTo(0, radius * 2 + 50);

        // Arms (hanging down)
        ctx.moveTo(0, radius * 2 + 15);
        ctx.lineTo(-15, radius * 2 + 40);

        ctx.moveTo(0, radius * 2 + 15);
        ctx.lineTo(15, radius * 2 + 40);

        // Legs (hanging down)
        ctx.moveTo(0, radius * 2 + 50);
        ctx.lineTo(-10, radius * 2 + 80);

        ctx.moveTo(0, radius * 2 + 50);
        ctx.lineTo(10, radius * 2 + 80);

        ctx.restore();
      } else if (animationState === "win") {
        // Dancing stickman with fist pumps
        const danceY = Math.sin(frameCount * 0.2) * 5;
        const armPump = Math.sin(frameCount * 0.3) * 15;

        // Head (bobbing up and down)
        ctx.arc(150, 120 + danceY, 15, 0, Math.PI * 2);

        // Happy eyes
        ctx.moveTo(145, 115 + danceY);
        ctx.arc(145, 115 + danceY, 2, 0, Math.PI * 2);
        ctx.moveTo(155, 115 + danceY);
        ctx.arc(155, 115 + danceY, 2, 0, Math.PI * 2);

        // Smile
        ctx.moveTo(140, 125 + danceY);
        ctx.bezierCurveTo(
          140,
          130 + danceY,
          160,
          130 + danceY,
          160,
          125 + danceY
        );

        // Body
        ctx.moveTo(150, 135 + danceY);
        ctx.lineTo(150, 180 + danceY);

        // Arms - fist pumping
        ctx.moveTo(150, 150 + danceY);
        ctx.lineTo(135, 130 - armPump + danceY);

        ctx.moveTo(150, 150 + danceY);
        ctx.lineTo(165, 130 - armPump + danceY);

        // Legs - dancing
        const legDance = Math.sin(frameCount * 0.4) * 10;

        ctx.moveTo(150, 180 + danceY);
        ctx.lineTo(140 + legDance, 210 + danceY);

        ctx.moveTo(150, 180 + danceY);
        ctx.lineTo(160 - legDance, 210 + danceY);
      }

      ctx.stroke();
    };

    // Animation loop
    const animate = () => {
      frameCount++;
      clearCanvas();
      drawGallows();
      drawStickman();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [animationState]);

  return (
    <section className="w-full bg-[#0a192f] text-white overflow-hidden min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <motion.div
            className="space-y-8"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7 }}
          >
            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.7 }}
            >
              <span className="block">🎬 Meet the Stickman</span>
              <span className="block text-blue-300 mt-2">
                Who's One Guess Away From Glory… or the Gallows.
              </span>
            </motion.h1>

            <motion.div
              className="space-y-6 text-lg md:text-base text-blue-100"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 0.7 }}
            >
              <p>
                In Lead Studio's newest game, a brave little stickman dangles
                between doom and triumph — and you hold his fate.
              </p>

              <p>
                Each wrong guess pulls the noose tighter. Each right letter
                brings a fist-pumping celebration. Watch him dance with joy as
                confetti rains down in victory... or slump in defeat as the
                trapdoor drops.
              </p>
            </motion.div>

            <motion.div
              className="space-y-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6, duration: 0.7 }}
            >
              <p className="text-xl text-blue-300 italic">
                Are you quick enough to keep him alive?
              </p>
              <p className="text-2xl font-bold text-white">
                Play smart. Guess fast. Save the stickman.
              </p>
            </motion.div>
            <div className=" w-96 flex justify-between">
                <div className="">
                  <button
                    className="bg-white text-[#0a192f] font-bold py-3 px-8 rounded-full hover:bg-blue-100 transition-colors mt-4"
                    onClick={() => setIsPlaying(!isPlaying)}
                  >
                    {isPlaying ? "Pause Animation" : "Play Animation"}
                  </button>
                </div>

                <div className="">
                    <button className="bg-white text-[#0a192f] font-bold py-3 px-8 rounded-full hover:bg-blue-100 transition-colors mt-4">
                      <Link href="/onboard-hangman">Play Game</Link>
                    </button>
                  </div>
              </div>
          </motion.div>
          

          <motion.div
            className="relative"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.3, duration: 0.7 }}
          >
            <div className="bg-white rounded-xl p-8 shadow-2xl">
              <div className="text-center mb-6">
                <span className="inline-block bg-[#0a192f] text-white px-6 py-2 rounded-full text-lg font-bold">
                  {animationState === "intro"
                    ? "The Challenge Begins..."
                    : animationState === "win"
                    ? "🎉 Victory!"
                    : animationState === "lose"
                    ? "💀 Game Over"
                    : `Guess ${guessCount}: ${
                        animationState.includes("wrong") ? "Wrong!" : "Correct!"
                      }`}
                </span>
              </div>

              <canvas
                ref={canvasRef}
                width="300"
                height="300"
                className="mx-auto border-4 border-[#0a192f] rounded-lg bg-blue-50"
              />

              <div className="text-[#0a192f] text-center mt-6 space-y-2">
                <p className="font-bold text-xl">
                  {animationState === "intro"
                    ? "Will you save him?"
                    : animationState === "win"
                    ? "You saved the stickman!"
                    : animationState === "lose"
                    ? "Too many wrong guesses!"
                    : animationState.includes("wrong")
                    ? `${
                        5 - Number.parseInt(animationState.charAt(5))
                      } chances left!`
                    : "Great guess!"}
                </p>
                <p className="text-sm italic">
                  {isPlaying
                    ? "Watch the story unfold..."
                    : "Click Play to see the animation"}
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
