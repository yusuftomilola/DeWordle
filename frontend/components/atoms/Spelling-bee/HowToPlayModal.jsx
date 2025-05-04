"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export function HowToPlayModal({ open, onOpenChange }) {
  const [currentStep, setCurrentStep] = useState(0);

  const steps = [
    {
      title: "Find Words",
      description:
        "Create words using the letters in the honeycomb. Words must be at least 4 letters long.",
      animation: (
        <motion.div className="flex flex-col items-center">
          <div className="honeycomb-container scale-75 mb-4">
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">R</div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">U</div>
            </div>
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">M</div>
              <div className="honeycomb-cell bg-yellow-300 text-gray-800 text-2xl font-bold">O</div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">L</div>
            </div>
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">D</div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">A</div>
            </div>
          </div>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xl font-medium mb-2"
          >
            ROOM
          </motion.div>
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
            className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium"
          >
            +4 points
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Use the Center Letter",
      description: "Every word must contain the center letter (highlighted in yellow).",
      animation: (
        <motion.div className="flex flex-col items-center">
          <div className="honeycomb-container scale-75 mb-4">
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">R</div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">U</div>
            </div>
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">M</div>
              <motion.div
                animate={{
                  scale: [1, 1.2, 1],
                  backgroundColor: ["#fde047", "#fbbf24", "#fde047"],
                }}
                transition={{
                  repeat: Number.POSITIVE_INFINITY,
                  duration: 2,
                }}
                className="honeycomb-cell bg-yellow-300 text-gray-800 text-2xl font-bold"
              >
                O
              </motion.div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">L</div>
            </div>
            <div className="honeycomb-row">
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">D</div>
              <div className="honeycomb-cell bg-gray-100 text-gray-800 text-2xl font-bold">A</div>
            </div>
          </div>
          <div className="flex space-x-4 items-center">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="flex items-center"
            >
              <span className="text-xl font-medium">ROOM</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.8 }}
                className="ml-2 text-green-600"
              >
                ✓
              </motion.span>
            </motion.div>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1.2 }}
              className="flex items-center"
            >
              <span className="text-xl font-medium">DRUM</span>
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ delay: 1.5 }}
                className="ml-2 text-red-600"
              >
                ✗
              </motion.span>
            </motion.div>
          </div>
        </motion.div>
      ),
    },
    {
      title: "Scoring",
      description:
        "4-letter words = 1 point. Longer words = 1 point per letter. Pangrams (words that use all 7 letters) get 7 bonus points!",
      animation: (
        <motion.div className="flex flex-col items-center space-y-4">
          <div className="grid grid-cols-2 gap-x-8 gap-y-2">
            {[
              ["ROOM", "1 point"],
              ["MORAL", "5 points"],
              ["AROMA", "5 points"],
              [
                "MODULAR",
                <motion.div key="modular" className="flex items-center">
                  <motion.span
                    initial={{ opacity: 1 }}
                    animate={{ opacity: [1, 0, 1] }}
                    transition={{ delay: 1.5, duration: 1, repeat: 1 }}
                    className="text-yellow-600"
                  >
                    7 points
                  </motion.span>
                  <motion.span
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 2.5 }}
                    className="ml-1 text-yellow-600"
                  >
                    + 7 bonus!
                  </motion.span>
                </motion.div>,
              ],
            ].map(([word, points], index) => (
              <motion.div
                key={word}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3 + index * 0.3 }}
                className="flex justify-between"
              >
                <span className="font-medium">{word}</span>
                <span className="text-yellow-600">{points}</span>
              </motion.div>
            ))}
          </div>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 3 }}
            className="bg-yellow-100 p-3 rounded-lg text-center"
          >
            <span className="font-bold text-yellow-800">Pangram!</span>
            <span className="text-yellow-800 block text-sm">A word that uses all 7 letters</span>
          </motion.div>
        </motion.div>
      ),
    },
    {
      title: "Ranks",
      description: "Earn points to increase your rank. Can you reach Queen Bee?",
      animation: (
        <motion.div className="flex flex-col items-center space-y-6">
          <div className="flex items-center gap-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="text-xl font-semibold"
            >
              Beginner
            </motion.div>
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.5, type: "spring" }}
              className="bg-yellow-300 rounded-full w-8 h-8 flex items-center justify-center font-bold"
            >
              0
            </motion.div>
          </div>

          <div className="w-full max-w-md">
            <div className="flex items-center justify-between mb-1">
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.7 }}
                className="text-sm font-medium"
              >
                Beginner
              </motion.span>
              <motion.span
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 2.5 }}
                className="text-sm font-medium"
              >
                Queen Bee
              </motion.span>
            </div>
            <div className="flex items-center gap-2 w-full justify-between">
              {Array.from({ length: 10 }).map((_, index) => (
                <motion.div
                  key={index}
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.8 + index * 0.2 }}
                  className="w-2 h-2 bg-yellow-400 rounded-full"
                />
              ))}
            </div>
          </div>
        </motion.div>
      ),
    },
  ];

  const current = steps[currentStep];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="text-2xl">{current.title}</DialogTitle>
          <DialogDescription>{current.description}</DialogDescription>
        </DialogHeader>

        <div className="py-6">{current.animation}</div>

        <div className="flex justify-between items-center">
          <Button
            onClick={() => setCurrentStep((prev) => Math.max(prev - 1, 0))}
            disabled={currentStep === 0}
            variant="outline"
          >
            <ChevronLeft className="mr-2 h-4 w-4" />
            Back
          </Button>
          <Button
            onClick={() => setCurrentStep((prev) => Math.min(prev + 1, steps.length - 1))}
            disabled={currentStep === steps.length - 1}
          >
            Next
            <ChevronRight className="ml-2 h-4 w-4" />
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
