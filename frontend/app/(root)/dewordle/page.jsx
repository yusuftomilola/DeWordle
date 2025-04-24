import Keyboard from "@/components/Keyboard";
import WordGrid from "@/components/WordGrid.jsx";

export default function page() {
  return (
    <div className= "mt-24  h-screen">
      <WordGrid />
      <Keyboard />
    </div>
  );
}
