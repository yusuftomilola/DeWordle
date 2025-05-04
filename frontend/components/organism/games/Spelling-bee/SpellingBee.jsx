'use client';

import React, { use } from 'react';
import Header from './SpellingBeeHeader';
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
      <Header />
      <div className="flex-1 flex flex-col">
        <section className="flex-1 bg-[#818cf8] flex flex-col items-center justify-center text-center px-4 py-16">
          <div className="max-w-[1200px] w-full mx-auto">
            <div className="w-[170px] h-[120px] mx-auto mb-6">
              <Lottie
                animationData={beeAnimation}
                loop={true}
                autoplay={true}
              />
            </div>
            <h2 className="text-7xl font-bold text-white mb-8">
              Spelling bee
            </h2>
            <p className="text-xl text-white/90 max-w-2xl mx-auto mb-12 leading-relaxed">
              Test your spelling skills. Compete, learn and become a spelling
              champion!
            </p>
            <div className="flex justify-center items-center gap-6">
              <Link href="/spelling-bee/honeycomb">
                <button className="modern-button">
                  <span>Play</span>
                </button>
              </Link>
              <button
                className="modern-button"
                onClick={handleSignIn}
              >
                Sign In
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

export default SpellingBee;
