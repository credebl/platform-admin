"use client";

import React, { ReactNode, useState } from "react";

import Header from "./Header";
import Sidebar from "./Sidebar";
import { usePathname } from "next/navigation";

interface PageLayoutProps {
  children: ReactNode;
}
const PageLayout: React.FC<PageLayoutProps> = ({ children }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const toggleSidebar = (): void => {
    setIsSidebarOpen(!isSidebarOpen);
  };
  const excludeLayoutRoutes = ["/en/signIn", "/fr/signIn", "/pt/signIn", "/", "/en/signUp",'/fr/signUp','/pt/signUp','/en/verifyEmail','/fr/verifyEmail','/pt/verifyEmail'];
  const pathname = usePathname();
  return (
    <>
      {excludeLayoutRoutes.includes(pathname) ? (
        <>{children}</>
      ) : (
        <div className="min-h-screen bg-background">
          <Header />
          <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
          <div className="h-full w-full flex-1 pt-24">
            <div className="px-6 lg:ml-60">{children}</div>
          </div>
        </div>
      )}
    </>
  );
};

export default PageLayout;
