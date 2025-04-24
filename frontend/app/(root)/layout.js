"use client";
import Footer from "@/components/atoms/footer";
import { AppProvider } from "@/context/AppContext";
import LandingPageNavbar from "@/components/organism/landing-page/LandingPageNavbar";

// landing page layout
const Layout = ({ children }) => {
  return (
    <main>
      <LandingPageNavbar />
      {children}
      <Footer />
    </main>
  );
};
export default Layout;
