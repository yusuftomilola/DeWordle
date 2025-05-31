'use client';

import React, { use } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import LetteredBoxedHeader from './latteredboxed-header';

const LettereBoxed = () => {
  const router = useRouter(); // Initialize the router

  const handleSignIn = () => {
    router.push('/signin'); // Navigate to the sign-in page
  };

  return (
    <>
      <section className="flex flex-col items-center justify-center text-center py-32 bg-gradient-to-b bg-[#f4b8b8]">
        <div className="mb-4">
          <Image
            src={'/letter-boxed.png'}
            alt="Spelling Bee"
            className="w-[170px] h-[100px]"
            width={100}
            height={100}
          />
        </div>
        <h2 className="text-5xl font-semibold text-white">Letter Boxed</h2>
        <p className="text-white mt-6 text-[18px] max-w-md">
          Form words using letters found around the edges of the square
        </p>
        <div className="mt-6 flex space-x-4">
          <Link href="/letterboxed/lettered-box-game">
            <button className="px-16 py-3 bg-white text-indigo-900 font-medium rounded-full shadow hover:bg-gray-100">
              Play
            </button>
          </Link>
          <button
            className="px-16 py-1 border border-white text-white font-medium rounded-full hover:bg-white hover:text-indigo-900"
            onClick={handleSignIn}
          >
            Sign In
          </button>
        </div>
      </section>
    </>
  );
};

export default LettereBoxed;
