

import LandingPage from "@/components/LandingPage";
import MostPlayed from "@/components/MostPlayed";
import PlayOurGame from "@/components/playourgame";
import WhatsNew from "@/components/WhatsNew";

export default function Page() {
  return (
    <div className="bg-[#ffffff]">
      <LandingPage />
      <PlayOurGame />
      <WhatsNew />
      <MostPlayed />
    </div>
  );
}
