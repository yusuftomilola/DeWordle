import Home from '@/components/atoms/footer';
import LetteredBoxedHeader from '@/components/organism/games/letterboxed/latteredboxed-header';
import LettereBoxed from '@/components/organism/games/letterboxed/letterboxed';
import React from 'react';

const page = () => {
  return (
    <div>
      <LetteredBoxedHeader />
      <LettereBoxed />
      <Home />
    </div>
  );
};

export default page;
