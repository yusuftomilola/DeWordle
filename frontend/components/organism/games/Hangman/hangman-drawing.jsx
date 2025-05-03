"use client"

import { useEffect, useRef, useState, memo } from "react"
import { motion } from "framer-motion"



// Using memo to prevent unnecessary re-renders
const HangmanDrawing = memo(function HangmanDrawing({
  wrongGuesses,
  gameOver = false,
  won = false,
}) {
  const canvasRef = useRef(null)
  const [animate, setAnimate] = useState(false)
  const requestRef = useRef()
  const previousTimeRef = useRef()
  const animationStartTimeRef = useRef()

  // Animation state
  const [animationState, setAnimationState] = useState({
    headRotation: 0,
    armWave: 0,
    legKick: 0,
  })

  useEffect(() => {
    // Set animation state when game is over
    if (gameOver) {
      setAnimate(true)
      animationStartTimeRef.current = Date.now()
    } else {
      setAnimate(false)
      animationStartTimeRef.current = undefined
    }

    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [gameOver])

  // Animation loop for smoother animations
  const animate3D = (time) => {
    if (previousTimeRef.current === undefined) {
      previousTimeRef.current = time
    }

    const deltaTime = time - (previousTimeRef.current || 0)
    previousTimeRef.current = time

    if (animate && won) {
      // Victory animations
      setAnimationState((prev) => ({
        headRotation: Math.sin(time * 0.003) * 10, // Head bobbing
        armWave: Math.sin(time * 0.005) * 15, // Arm waving
        legKick: Math.sin(time * 0.004) * 10, // Leg kicking
      }))
    } else if (animate && !won) {
      // Defeat animations - subtle movement
      setAnimationState((prev) => ({
        headRotation: Math.sin(time * 0.002) * 5, // Subtle head movement
        armWave: 0,
        legKick: 0,
      }))
    }

    requestRef.current = requestAnimationFrame(animate3D)
  }

  useEffect(() => {
    if (animate) {
      requestRef.current = requestAnimationFrame(animate3D)
    }
    return () => {
      if (requestRef.current) {
        cancelAnimationFrame(requestRef.current)
      }
    }
  }, [animate])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Use device pixel ratio for sharper rendering
    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()

    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr

    ctx.scale(dpr, dpr)

    // Clear canvas
    ctx.clearRect(0, 0, rect.width, rect.height)

    // Set line style
    ctx.lineWidth = 3
    ctx.strokeStyle = "#3b82f6" // blue-500
    ctx.lineCap = "round"

    // Draw gallows
    ctx.beginPath()
    // Base
    ctx.moveTo(20, 180)
    ctx.lineTo(100, 180)
    // Pole
    ctx.moveTo(60, 180)
    ctx.lineTo(60, 20)
    // Top
    ctx.lineTo(150, 20)
    // Rope
    ctx.lineTo(150, 40)
    ctx.stroke()

    // Draw hangman based on wrong guesses
    if (wrongGuesses > 0 || gameOver) {
      // Save context for head rotation
      ctx.save()

      // Apply head rotation if animating
      if (animate) {
        ctx.translate(150, 60)
        ctx.rotate((animationState.headRotation * Math.PI) / 180)
        ctx.translate(-150, -60)
      }

      // Head
      ctx.beginPath()
      ctx.arc(150, 60, 20, 0, Math.PI * 2)
      ctx.stroke()

      // Face expressions
      if (gameOver) {
        // Eyes
        if (won) {
          // Happy eyes
          ctx.beginPath()
          ctx.arc(143, 55, 3, 0, Math.PI * 2)
          ctx.arc(157, 55, 3, 0, Math.PI * 2)
          ctx.fillStyle = "#3b82f6"
          ctx.fill()

          // Smile
          ctx.beginPath()
          ctx.arc(150, 65, 10, 0, Math.PI, false)
          ctx.stroke()
        } else {
          // Sad eyes (X shape)
          ctx.beginPath()
          ctx.moveTo(140, 52)
          ctx.lineTo(146, 58)
          ctx.moveTo(146, 52)
          ctx.lineTo(140, 58)

          ctx.moveTo(154, 52)
          ctx.lineTo(160, 58)
          ctx.moveTo(160, 52)
          ctx.lineTo(154, 58)
          ctx.stroke()

          // Frown
          ctx.beginPath()
          ctx.arc(150, 75, 10, Math.PI, Math.PI * 2, false)
          ctx.stroke()
        }
      }

      // Restore context after head
      ctx.restore()
    }

    if (wrongGuesses > 1 || gameOver) {
      // Body
      ctx.beginPath()
      ctx.moveTo(150, 80)
      ctx.lineTo(150, 130)
      ctx.stroke()
    }

    if (wrongGuesses > 2 || gameOver) {
      // Left arm
      ctx.save()
      if (won && animate) {
        // Animated arm for celebration
        ctx.translate(150, 90)
        ctx.rotate((animationState.armWave * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-30, 20)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(150, 90)
        ctx.lineTo(120, 110)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (wrongGuesses > 3 || gameOver) {
      // Right arm
      ctx.save()
      if (won && animate) {
        // Animated arm for celebration
        ctx.translate(150, 90)
        ctx.rotate((-animationState.armWave * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(30, 20)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(150, 90)
        ctx.lineTo(180, 110)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (wrongGuesses > 4 || gameOver) {
      // Left leg
      ctx.save()
      if (won && animate) {
        // Animated leg for celebration
        ctx.translate(150, 130)
        ctx.rotate((animationState.legKick * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(-20, 30)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(150, 130)
        ctx.lineTo(130, 160)
        ctx.stroke()
      }
      ctx.restore()
    }

    if (wrongGuesses > 5 || gameOver) {
      // Right leg
      ctx.save()
      if (won && animate) {
        // Animated leg for celebration
        ctx.translate(150, 130)
        ctx.rotate((-animationState.legKick * Math.PI) / 180)
        ctx.beginPath()
        ctx.moveTo(0, 0)
        ctx.lineTo(20, 30)
        ctx.stroke()
      } else {
        ctx.beginPath()
        ctx.moveTo(150, 130)
        ctx.lineTo(170, 160)
        ctx.stroke()
      }
      ctx.restore()
    }
  }, [wrongGuesses, gameOver, won, animate, animationState])

  return (
    <div className="mb-6 relative">
      {animate && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="absolute inset-0 flex items-center justify-center"
        >
          {won ? (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-green-500 text-4xl font-bold"
            >
              🎉
            </motion.div>
          ) : (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.2, 1] }}
              transition={{ duration: 0.5 }}
              className="text-red-500 text-4xl font-bold"
            >
              😢
            </motion.div>
          )}
        </motion.div>
      )}
      <motion.canvas
        animate={
          animate && won
            ? {
                y: [0, -10, 0, -10, 0],
                transition: { repeat: Number.POSITIVE_INFINITY, duration: 1 },
              }
            : animate && !won
              ? {
                  rotate: [-2, 2, -2],
                  transition: { repeat: Number.POSITIVE_INFINITY, duration: 0.5 },
                }
              : {}
        }
        ref={canvasRef}
        width={200}
        height={200}
        className="mx-auto"
        style={{ width: "200px", height: "200px" }}
      />
    </div>
  )
})

export default HangmanDrawing
