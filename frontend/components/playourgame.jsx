"use client";
import { useEffect, useRef } from "react";
import Image from "next/image";
import Link from "next/link";
import gsap from "gsap";

export default function PlayOurGame() {
  const spellinbeeBlockRef = useRef(null);
  const deworldeBlockRef = useRef(null);

  useEffect(() => {

    const observer = new IntersectionObserver(
      (entries, observer) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.remove("opacity-0", "-translate-x-10");
            entry.target.classList.add("opacity-100", "translate-x-0");
            observer.unobserve(entry.target);
          }
        });
      },
      {
        rootMargin: "0px 0px -20% 0px",
        threshold: 0,
      }
    );

    if (spellinbeeBlockRef.current) observer.observe(spellinbeeBlockRef.current);
    if (deworldeBlockRef.current) observer.observe(deworldeBlockRef.current);

    return () => observer.disconnect();
  }, []);

  const imageRef = useRef(null);
    useEffect(() => { 
      if(imageRef.current){
        gsap.to(imageRef.current,{
          scale: 1.1,
          duration: 1,
          repeat: -1,
          yoyo: true,
          ease: "power1.inOut"
        })
      }
    })

  return (
    <div className="w-full bg-white dark:bg-gray-800 overflow-hidden px-4">
      <div className="max-w-7xl mx-auto">
        <h1 className="text-[#29296E] text-center py-6 font-semibold text-xl">
          Play our games today
        </h1>
        <div className="my-3">
          {/* Spelling Bee Section */}
          <div
            ref={spellinbeeBlockRef}
            className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 transform -translate-x-10 transition-all duration-1000"
          >
            <Image
              src="/spellinbee.png"
              width={650}
              height={465}
              alt="Spelling Bee image"
            />
            <div className="w-full md:w-[650px] h-[465px] text-left p-8 pt-6">
              <h3 className="font-bold mb-3 text-[32px]">Spelling Bee</h3>
              <p className="text-[16px]">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip.
              </p>
              <Image
                ref={imageRef}
                src="/comingsoon.png"
                alt="coming soon"
                width={191}
                height={107}
                className="mt-10"
              />
            
            </div>
          </div>

          {/* Deworlde Section */}
          <div
            ref={deworldeBlockRef}
            // Added a delay so that its animation starts a little after the first block
            className="grid grid-cols-1 md:grid-cols-2 gap-4 opacity-0 transform -translate-x-10 transition-all duration-1000 mt-8 delay-200"
          >
            <div className="w-full md:w-[650px] h-[465px] text-left p-8 pt-6">
              <h3 className="font-bold mb-3 text-[32px]">Deworlde</h3>
              <p className="text-[16px] mb-6">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do
                eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim
                ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut
                aliquip.
              </p>
              <Link href='/dewordle' className="mt-6 text-white bg-[#29296E] hover:bg-blue-800 focus:outline-none focus:ring-4 focus:ring-blue-300 font-medium rounded-full text-sm px-8 py-2.5 dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
              >
                Play Now
              </Link>
            </div>
            <Image
              src="/abc.png"
              width={650}
              height={426}
              alt="Deworlde image"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
