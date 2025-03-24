import { HeroSlider } from '@/components/HeroSlider';
import PlayOurGame from '@/components/playourgame';
import TrendingGames from '@/components/TrendingGames';

export default function Page() {
	return (
		<div className="bg-[#ffffff]">
			<HeroSlider />
			<PlayOurGame />
			<TrendingGames />
		</div>
	);
}
