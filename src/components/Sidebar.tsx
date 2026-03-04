"use client";

import { Globe, HandCoins, LayoutDashboard } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";

import Image from "next/image";
import Link from "next/link";
import React from "react";
import { usePathname } from "next/navigation";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (open: boolean) => void;
}

const Sidebar: React.FC<SidebarProps> = ({ isOpen, setIsOpen }) => {
  const pathname = usePathname();
  const logo = process.env.NEXT_PUBLIC_LOGO;
  
  if (!logo) {
    console.error("Logo not defined");
    return null;
  }

  // Sidebar menu content
  const SidebarContent = () => (
    <div className="fixed flex h-full flex-col bg-sidebar border w-60">
      {/* Header */}
      <div className="flex items-center justify-start px-4 pt-4 pb-12">
        <Image src={logo} alt="logo" width={150} height={40} className="w-[150px] h-[40px]" />
        {/* Close button only for mobile sidebar */}
        <button onClick={() => setIsOpen(false)} className="lg:hidden border rounded-md p-1">
          <Image src="/images/closeBlack.svg" alt="close" width={150} height={40} />
        </button>
      </div>

      {/* Menu */}
      <nav className="px-4 space-y-1 divide-y divide-gray-200">
        <ul className="space-y-2 pb-2">
          <li>
            <Link
              href="/dashboard"
              className={`flex items-center gap-3 p-2 text-base rounded-lg transition hover:bg-faintBlue ${
                pathname.includes("/dashboard")
                  ? "bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <LayoutDashboard strokeWidth={1.5} />
              <span className="text-sm">
                Dashboard
              </span>
            </Link>
          </li>
          <li>
            <Link
              href="/ecosystems"
              className={`flex items-center gap-3 p-2 rounded-lg transition hover:bg-faintBlue ${
                pathname.includes("/ecosystems")
                  ? "bg-primary text-primary-foreground duration-200 ease-linear hover:bg-primary/90 hover:text-primary-foreground active:bg-primary/90 active:text-primary-foreground font-semibold"
                  : "text-sidebar-foreground hover:bg-sidebar-accent"
              }`}
            >
              <Globe strokeWidth={1.5}/>
              <span className="text-sm">
                Ecosystems
              </span>
            </Link>
          </li>

        </ul>
      </nav>
    </div>
  );

  return (
    <>
      <div className="block lg:hidden">
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetTrigger asChild>
          <button aria-label="Open sidebar">
            <Image src="/images/menu.svg" alt="menu" width={24} height={24} />
          </button>
        </SheetTrigger>
        {isOpen && (
          <SheetContent side="left" className="p-0 w-60">
            <SidebarContent />
          </SheetContent>
        )}
      </Sheet>
      </div>
  
      <div className="hidden lg:flex">
        <SidebarContent />
      </div>
    </>
  );
};

export default Sidebar;
