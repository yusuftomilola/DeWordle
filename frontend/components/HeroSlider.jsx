"use client"

import * as React from "react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { useSwipeable } from "react-swipeable"

function classNames(...classes) {
  return classes.filter(Boolean).join(" ")
}

const gameSlides = [
  {
    id: 1,
    title: "Lead Studios' Special",
    subtitle: "Dewordle",
    description: "Test your vocabulary skills with our word-guessing game. Six attempts to find the hidden word!",
    buttonText: "Play as guest",
    showButton: true,
    illustration: "abc",
    bgColor: "#9b97c5",
  },
  {
    id: 2,
    title: "Lead Studios' Latest",
    subtitle: "Spelling Bee",
    description: "Create as many words as possible from seven letters. How many points can you score?",
    showButton: false,
    illustration: "bee",
    bgColor: "#4a4887",
  },
]

export function HeroSlider() {
  const [currentSlide, setCurrentSlide] = React.useState(0)
  const [autoplay, setAutoplay] = React.useState(true)

  React.useEffect(() => {
    if (!autoplay) return
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % gameSlides.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [autoplay])

  const nextSlide = () => setCurrentSlide((prev) => (prev + 1) % gameSlides.length)
  const prevSlide = () => setCurrentSlide((prev) => (prev - 1 + gameSlides.length) % gameSlides.length)

  // Enable swipe gestures
  const handlers = useSwipeable({
    onSwipedLeft: nextSlide,
    onSwipedRight: prevSlide,
    preventDefaultTouchmoveEvent: true,
    trackMouse: true,
  })

  return (
    <section className="relative w-full" {...handlers} onMouseEnter={() => setAutoplay(false)} onMouseLeave={() => setAutoplay(true)}>
      <div className="overflow-hidden relative w-full min-h-[600px]">
        {gameSlides.map((slide, index) => (
          <div
            key={slide.id}
            className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
              index === currentSlide ? "opacity-100" : "opacity-0"
            }`}
            style={{ backgroundColor: slide.bgColor }}
          >
            <div className="grid grid-cols-1 md:grid-cols-2 min-h-[600px]">
              <div className="flex flex-col justify-center p-8 md:p-16 lg:p-24">
                <h1 className="text-4xl md:text-5xl lg:text-6xl font-medium text-white mb-4">{slide.title}</h1>
                <h2 className="text-2xl md:text-3xl lg:text-4xl font-medium text-white mb-4">{slide.subtitle}</h2>
                <p className="text-white/90 mb-8 max-w-md">{slide.description}</p>

                {slide.showButton ? (
                  <Button
                    variant="outline"
                    size="lg"
                    className="w-fit bg-white text-[#333] hover:bg-white/90 hover:text-[#333] rounded-full px-8"
                  >
                    {slide.buttonText}
                  </Button>
                ) : (
                  <div className="mt-4">
                    <Image src="/coming-soon.png" alt="Coming Soon" width={200} height={80} className="object-contain" />
                  </div>
                )}
              </div>

              <div className="relative flex items-center justify-center p-8">
                {slide.illustration === "bee" ? (
                  <Image src="/spellingbee.png" alt="Spelling Bee" width={500} height={400} className="object-contain" />
                ) : (
                  <Image src="/abc-nobg.png" alt="Spelling Bee" width={500} height={400} className="object-contain" />
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Dots Navigation */}
      <div className="absolute bottom-8 left-0 right-0 flex justify-center gap-2 z-10">
        {gameSlides.map((_, index) => (
          <button
            key={index}
            onClick={() => setCurrentSlide(index)}
            className={classNames("h-2 w-2 rounded-full transition-all", currentSlide === index ? "bg-white w-8" : "bg-white/50")}
          />
        ))}
      </div>
    </section>
  )
}

