'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Lottie from 'lottie-react';
import beeAnimation from '@/public/Bee.json';

const SpellingBee = () => {
  const router = useRouter();

  const handleSignIn = () => {
    router.push('/signin');
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <div className="flex-1 flex flex-col">
        <section className="flex-1 bg-[#818cf8] flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="max-w-[1200px] w-full mx-auto relative">
            <div className="absolute left-1/2 -translate-x-1/2 -top-24 w-[250px] h-[250px]">
              <Lottie
                animationData={beeAnimation}
                loop={true}
                autoplay={true}
                className="w-full h-full"
                rendererSettings={{
                  preserveAspectRatio: 'xMidYMid meet'
                }}
              />
            </div>
            <div className="pt-40 relative">
              <h2 className="text-7xl font-bold text-white mb-8">
                Spelling bee
              </h2>
              <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
                Test your spelling skills.<br />
                Compete, learn and become a spelling champion!
              </p>
              <div className="flex justify-center items-center gap-6">
                <Link href="/spelling-bee/honeycomb">
                  <button className="fancy-button">
                    <span>Play</span>
                  </button>
                </Link>
                <button
                  className="fancy-button"
                  onClick={handleSignIn}
                >
                  <span>Sign In</span>
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SpellingBee;
