import { ReactNode } from "react";
import BottomNav from "./BottomNav";
import Footer from "./Footer";
import Header from "./SimpleHeader";

interface MobileLayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showNav?: boolean;
  headerProps?: {
    showSearch?: boolean;
    title?: string;
    showBack?: boolean;
  };
}

const PageLayout = ({
  children,
  showHeader = true,
  showNav = true,
  headerProps,
}: MobileLayoutProps) => {
  return (
    <div className="min-h-screen bg-background max-w-md mx-auto relative">
      {showHeader && <Header {...headerProps} />}
      <main className={`${showHeader ? "pt-16" : ""}`}>{children}</main>
      <Footer />
      {showNav && <BottomNav />}
    </div>
  );
};

export default PageLayout;
