import Navbar from "../../components/Navbar";
import { AppProvider } from "../../context/AppContext";

const Layout = ({ children }) => {
  return (
    <main>
      <AppProvider>
        <Navbar />
        {children}
      </AppProvider>
    </main>
  );
};
export default Layout;
