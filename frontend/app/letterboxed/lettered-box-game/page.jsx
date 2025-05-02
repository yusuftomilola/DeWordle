import Home from '@/components/atoms/footer';
import LetterBoxedGame from '@/components/organism/games/letterboxed/create-letteredboxed/create-letteredboxed';
import LetteredBoxedHeader from '@/components/organism/games/letterboxed/latteredboxed-header';
import React from 'react';

const page = () => {
  return (
    <div>
      <LetteredBoxedHeader />
      <LetterBoxedGame />
      <Home />
    </div>
  );
};

export default page;
