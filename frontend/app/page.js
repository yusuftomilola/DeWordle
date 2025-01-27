import DeWordle from "../components/DeWordle.jsx";
import { AppProvider } from "@/context/AppContext.jsx";

export default function Home() {
  return (
    <AppProvider>
      <main className="flex justify-center">
        <DeWordle />
      </main>
    </AppProvider>
  );
}
