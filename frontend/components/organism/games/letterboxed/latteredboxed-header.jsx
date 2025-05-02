'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import LetteredBoxedHowToPlayModal from './create-letteredboxed/how-to-play';
const LetteredBoxedHeader = () => {
  const [showHowToPlay, setShowHowToPlay] = useState(false);
  const router = useRouter(); // Initialize the router

  const handleSignIn = () => {
    router.push('/signup'); // Navigate to the sign-in page
  };

  return (
    <header className="flex items-center justify-between px-6 py-5 bg-white border-b border-gray-300 shadow-sm">
      <div className="flex items-center space-x-4">
        <Link href="/letterboxed">
          <div className="flex items-center justify-center">
            <Image
              src="/letteredbox-small-icon.png"
              alt="letteredboxed"
              width={50}
              height={50}
            />
            <h1 className="text-lg font-semibold text-indigo-900">
              Lettered Boxed
            </h1>
          </div>
        </Link>
        <button
          className="text-gray-700 hover:text-gray-900"
          onClick={() => setShowHowToPlay(true)}
        >
          How to play
        </button>
      </div>{' '}
      <button
        className="px-12 py-3 text-white bg-indigo-900 text-sm rounded-full hover:bg-indigo-800 hidden lg:md:block"
        onClick={handleSignIn}
      >
        Sign Up
      </button>
      <LetteredBoxedHowToPlayModal
        isOpen={showHowToPlay}
        onClose={() => setShowHowToPlay(false)}
      />
    </header>
  );
};

export default LetteredBoxedHeader;
