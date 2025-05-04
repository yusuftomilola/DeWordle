import Keyboard from "@/components/organism/games/Dewordle/Keyboard";
import WordGrid from "@/components/organism/games/Dewordle/WordGrid.jsx";
import Notification from "@/components/ui/notification";

export default function page() {
  return (
    <div className= "mt-24 h-screen">
      <Notification />
      <WordGrid />
      <Keyboard />
    </div>
  );
}
