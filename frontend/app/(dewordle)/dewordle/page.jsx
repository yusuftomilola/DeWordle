import Keyboard from "@/components/organism/games/Dewordle/Keyboard";
import WordGrid from "@/components/organism/games/Dewordle/WordGrid.jsx";

export default function page() {
  return (
    <div className= "mt-24  h-screen">
      <WordGrid />
      <Keyboard />
    </div>
  );
}
