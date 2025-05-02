"use client";

import { useContext, useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { User } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { AppContext } from "@/context/AppContext";

export default function HangmanOnboardingWelcome() {
  const canvasRef = useRef(null);
  const [isAnimating, setIsAnimating] = useState(true);
  const [cursorVisible, setCursorVisible] = useState(true);
  const { userData } = useContext(AppContext);
  const isLoggedIn = userData?.userName;
  // Blink cursor effect
  useEffect(() => {
    const interval = setInterval(() => {
      setCursorVisible((prev) => !prev);
    }, 500);

    return () => clearInterval(interval);
  }, []);

  // Draw the animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !isAnimating) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Set canvas dimensions
    canvas.width = 800;
    canvas.height = 400;

    // Animation variables
    let frameCount = 0;
    let animationFrameId = 0;
    let beamProgress = 0;
    let nooseProgress = 0;
    let letterProgress = 0;
    let wrongGuesses = 0;
    let lastWrongGuessTime = 0;

    // Colors
    const colors = {
      darkBlue: "#0a192f",
      lightBlue: "#90cdf4",
      yellow: "#fbd38d",
      white: "#ffffff",
    };

    // Clear canvas
    const clearCanvas = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
    };

    // Draw player character
    const drawPlayer = () => {
      ctx.strokeStyle = colors.darkBlue;
      ctx.lineWidth = 3;
      ctx.fillStyle = colors.lightBlue;

      const playerX = 150;
      const playerY = 250;
      const bounce = Math.sin(frameCount * 0.05) * 5;
      const excitement = Math.sin(frameCount * 0.1) * 3;

      // Head
      ctx.beginPath();
      ctx.arc(playerX, playerY - 50 + bounce, 20, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Eyes
      ctx.fillStyle = colors.darkBlue;
      ctx.beginPath();
      ctx.arc(playerX - 7, playerY - 55 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.beginPath();
      ctx.arc(playerX + 7, playerY - 55 + bounce, 3, 0, Math.PI * 2);
      ctx.fill();

      // Smile
      ctx.beginPath();
      ctx.arc(playerX, playerY - 45 + bounce, 10, 0, Math.PI);
      ctx.stroke();

      // Body
      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 30 + bounce);
      ctx.lineTo(playerX, playerY + 20 + bounce);
      ctx.stroke();

      // Arms - excited waving
      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 10 + bounce);
      ctx.lineTo(playerX - 25, playerY - 20 - excitement + bounce);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(playerX, playerY - 10 + bounce);
      ctx.lineTo(playerX + 30, playerY - 30 + excitement + bounce);
      ctx.stroke();

      // Legs
      ctx.beginPath();
      ctx.moveTo(playerX, playerY + 20 + bounce);
      ctx.lineTo(playerX - 15, playerY + 60 + bounce);
      ctx.stroke();

      ctx.beginPath();
      ctx.moveTo(playerX, playerY + 20 + bounce);
      ctx.lineTo(playerX + 15, playerY + 60 + bounce);
      ctx.stroke();

      // Speech bubble
      ctx.fillStyle = colors.white;
      ctx.beginPath();
      ctx.moveTo(playerX + 40, playerY - 80);
      ctx.lineTo(playerX + 40, playerY - 40);
      ctx.lineTo(playerX + 30, playerY - 50);
      ctx.lineTo(playerX + 20, playerY - 40);
      ctx.lineTo(playerX + 20, playerY - 80);
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Exclamation marks in speech bubble
      ctx.fillStyle = colors.yellow;
      ctx.beginPath();
      ctx.arc(playerX + 30, playerY - 65, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = colors.lightBlue;
      ctx.beginPath();
      ctx.arc(playerX + 30, playerY - 55, 5, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    };

    // Draw gallows
    const drawGallows = () => {
      ctx.strokeStyle = colors.darkBlue;
      ctx.lineWidth = 4;

      // Base
      ctx.beginPath();
      ctx.moveTo(250, 300);
      ctx.lineTo(350, 300);
      ctx.stroke();

      // Pole
      ctx.beginPath();
      ctx.moveTo(300, 300);
      ctx.lineTo(300, 100);
      ctx.stroke();

      // Beam - animated drawing
      if (frameCount > 30) {
        beamProgress = Math.min(1, (frameCount - 30) / 60);
        ctx.beginPath();
        ctx.moveTo(300, 100);
        ctx.lineTo(300 + 100 * beamProgress, 100);
        ctx.stroke();
      }

      // Noose - animated after beam is complete
      if (beamProgress >= 1) {
        nooseProgress = Math.min(1, (frameCount - 90) / 30);
        ctx.beginPath();
        ctx.moveTo(400, 100);
        ctx.lineTo(400, 100 + 30 * nooseProgress);
        ctx.stroke();

        // Noose swaying
        if (nooseProgress >= 1) {
          const sway = Math.sin(frameCount * 0.05) * 5;
          ctx.beginPath();
          ctx.arc(400 + sway, 130, 10, 0, Math.PI * 2);
          ctx.stroke();
        }
      }
    };

    // Draw letter tiles
    const drawLetters = () => {
      if (frameCount > 120) {
        letterProgress = Math.min(26, Math.floor((frameCount - 120) / 5));
        const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";

        for (let i = 0; i < letterProgress; i++) {
          const row = Math.floor(i / 9);
          const col = i % 9;
          const x = 500 + col * 35;
          const y = 150 + row * 40;

          // Calculate bounce effect
          const bounceTime = i * 5 + 120;
          const timeSinceBounce = frameCount - bounceTime;
          const bounce =
            timeSinceBounce > 0
              ? Math.max(
                  0,
                  10 *
                    Math.exp(-timeSinceBounce / 10) *
                    Math.sin(timeSinceBounce / 2)
                )
              : 0;

          // Draw tile
          ctx.fillStyle = colors.lightBlue;
          ctx.strokeStyle = colors.darkBlue;
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.roundRect(x, y - bounce, 30, 30, 5);
          ctx.fill();
          ctx.stroke();

          // Draw letter
          ctx.fillStyle = colors.darkBlue;
          ctx.font = "bold 18px Arial";
          ctx.textAlign = "center";
          ctx.textBaseline = "middle";
          ctx.fillText(letters[i], x + 15, y + 15 - bounce);
        }
      }
    };

    // Draw hangman figure based on wrong guesses
    const drawHangman = () => {
      if (frameCount > 240 && frameCount - lastWrongGuessTime > 60) {
        wrongGuesses++;
        lastWrongGuessTime = frameCount;
      }

      if (wrongGuesses > 0 && nooseProgress >= 1) {
        ctx.strokeStyle = colors.darkBlue;
        ctx.lineWidth = 3;

        const sway = Math.sin(frameCount * 0.05) * 5;
        const x = 400 + sway;
        const y = 130;

        // Head
        if (wrongGuesses >= 1) {
          const headOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = headOpacity;
          ctx.beginPath();
          ctx.arc(x, y + 20, 20, 0, Math.PI * 2);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Body
        if (wrongGuesses >= 2) {
          const bodyOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = bodyOpacity;
          ctx.beginPath();
          ctx.moveTo(x, y + 40);
          ctx.lineTo(x, y + 100);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Left arm
        if (wrongGuesses >= 3) {
          const armOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = armOpacity;
          ctx.beginPath();
          ctx.moveTo(x, y + 60);
          ctx.lineTo(x - 30, y + 50);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Right arm
        if (wrongGuesses >= 4) {
          const armOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = armOpacity;
          ctx.beginPath();
          ctx.moveTo(x, y + 60);
          ctx.lineTo(x + 30, y + 50);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Left leg
        if (wrongGuesses >= 5) {
          const legOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = legOpacity;
          ctx.beginPath();
          ctx.moveTo(x, y + 100);
          ctx.lineTo(x - 20, y + 140);
          ctx.stroke();
          ctx.globalAlpha = 1;
        }

        // Right leg
        if (wrongGuesses >= 6) {
          const legOpacity = Math.min(
            1,
            (frameCount - lastWrongGuessTime + 60) / 30
          );
          ctx.globalAlpha = legOpacity;
          ctx.beginPath();
          ctx.moveTo(x, y + 100);
          ctx.lineTo(x + 20, y + 140);
          ctx.stroke();
          ctx.globalAlpha = 1;

          // Reset wrong guesses to start over
          if (frameCount - lastWrongGuessTime > 30) {
            wrongGuesses = 0;
          }
        }
      }
    };

    // Animation loop
    const animate = () => {
      frameCount++;
      clearCanvas();
      drawPlayer();
      drawGallows();
      drawLetters();
      drawHangman();
      animationFrameId = window.requestAnimationFrame(animate);
    };

    animate();

    // Cleanup
    return () => {
      window.cancelAnimationFrame(animationFrameId);
    };
  }, [isAnimating]);

  return (
    <section className="w-full bg-[#f0f9ff] min-h-screen flex items-center justify-center">
      <div className="container mx-auto px-4 py-8">
        <motion.div
          className="max-w-5xl mx-auto"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7 }}
        >
          <div className="text-center mb-8">
            <motion.h1
              className="text-4xl md:text-5xl font-bold text-[#0a192f]"
              initial={{ y: -20, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              Welcome to Hangman!
            </motion.h1>
          </div>

          <div className="bg-white rounded-xl p-4 md:p-6 shadow-xl border-2 border-[#29296E]">
            <div className="relative">
              <canvas
                ref={canvasRef}
                width="800"
                height="400"
                className="mx-auto bg-white rounded-lg"
                style={{ maxWidth: "100%", height: "auto" }}
              />

              <motion.div
                className="absolute bottom-8 left-0 right-0 text-center"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1, duration: 0.7 }}
              >
                <h2 className="text-2xl md:text-3xl font-bold text-[#0a192f] inline-flex items-center justify-center">
                  Guess the word before it's too late!
                  <span
                    className={`ml-1 h-6 w-2 bg-[#0a192f] ${
                      cursorVisible ? "opacity-100" : "opacity-0"
                    }`}
                  ></span>
                </h2>
              </motion.div>
            </div>

            <motion.div
              className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.5, duration: 0.7 }}
            >
              <div className="mt-8 lg:mt-16 flex flex-wrap items-center gap-4">
                {isLoggedIn ? (
                  <Link
                    href="/hangman"
                    className="bg-[#29296E] text-lg font-bold text-white hover:bg-opacity-90 inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2"
                  >
                    Play Now
                  </Link>
                ) : (
                  <>
                    <Link
                      href="/signin"
                      className="border border-[#29296E] text-[#29296E] hover:bg-accent font-bold inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2 text-lg"
                    >
                      <User className="h-5 w-5" /> Log In
                    </Link>
                    <Link
                      href="/hangman"
                      className="bg-[#29296E] text-lg font-bold text-white hover:bg-opacity-90 inline-flex items-center justify-center rounded-3xl w-[12rem] px-4 py-2"
                    >
                      Play as Guest.
                    </Link>
                  </>
                )}
              </div>
            </motion.div>
          </div>

          <div className="mt-4 text-center text-[#0a192f]/70 text-sm">
            <p>© 2025 Lead Studio. All rights reserved.</p>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
