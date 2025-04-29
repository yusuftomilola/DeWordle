import Home from '@/components/atoms/footer';
import HoneycombGame from '@/components/organism/games/Spelling-bee/honeycomb/honeycomb-game';
import Header from '@/components/organism/games/Spelling-bee/SpellingBeeHeader';

import React from 'react';

const page = () => {
  return (
    <div>
      <Header />
      <HoneycombGame />
      <Home />
    </div>
  );
};

export default page;
