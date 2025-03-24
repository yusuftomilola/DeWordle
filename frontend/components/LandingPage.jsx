import React from 'react';

import TrendingGames from './TrendingGames';

const LandingPage = () => {
	return (
		<div className="mt-40">
			<p className="text-xl font-bold text-center">Welcome to LeadStudio</p>
			<TrendingGames />
		</div>
	);
};

export default LandingPage;
