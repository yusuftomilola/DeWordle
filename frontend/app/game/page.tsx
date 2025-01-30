import Keyboard from "../../components/Keyboard";
import Navbar from "../../components/Navbar.jsx";
import WordGrid from "../../components/WordGrid.jsx";

export default function page() {
  return (
    <div>
      <Navbar />
      <WordGrid />
      <Keyboard />
    </div>
  );
}
