import Keyboard from "../../components/Keyboard";
import Navbar from "../../components/Navbar.jsx";
import WordGrid from "../../components/WordGrid.jsx";
import { AppProvider } from "../../context/AppContext";

export default function page() {
  return (
    <div>
      <AppProvider>
      <Navbar />
      <WordGrid />
      <Keyboard />

      </AppProvider>
    </div>
  );
}
