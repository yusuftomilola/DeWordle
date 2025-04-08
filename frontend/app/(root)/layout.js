"use client";
import { usePathname } from "next/navigation";
import Navbar from "@/components/Navbar";
import { AppProvider } from "@/context/AppContext";

const Layout = ({ children }) => {
  const pathname = usePathname();
  const hideNavbar = pathname === "/" || pathname === '/spelling-bee' || pathname === '/all-games'
  return (
    <main>
      <AppProvider>
        {!hideNavbar && <Navbar />}
        {children}
      </AppProvider>
    </main>
  );
};
export default Layout;
