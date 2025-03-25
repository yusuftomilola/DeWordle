
import { HeroSlider } from '@/components/HeroSlider';
import MostPlayed from "@/components/MostPlayed";
import PlayOurGame from '@/components/playourgame';
import TrendingGames from '@/components/TrendingGames';
import WhatsNew from "@/components/WhatsNew";

export default function Page() {
	return (
		<div className="bg-[#ffffff]">
			<HeroSlider />
			<PlayOurGame />
			<TrendingGames />
      <WhatsNew />
      <MostPlayed />
		</div>
	);

