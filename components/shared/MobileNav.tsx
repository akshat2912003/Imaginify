"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { navLinks } from "@/constants";
import { cn } from "@/lib/utils";

const MobileNav = () => {
  const pathname = usePathname();

  return (
    <header className="header">
      <Link href="/" className="flex items-center gap-2 md:py-2">
        <span className="text-xl">✦</span>
        <h1 className="font-bold text-dark-600 text-lg tracking-tight">IMAGINIFY</h1>
      </Link>

      <nav className="flex gap-2">
        <SignedIn>
          <UserButton afterSignOutUrl="/" />
          <Sheet>
            <SheetTrigger asChild>
              <button className="p-2 rounded-lg hover:bg-purple-100 transition-colors">
                <span className="text-2xl">☰</span>
              </button>
            </SheetTrigger>
            <SheetContent className="sheet-content sm:w-64">
              <>
                <Link href="/" className="flex items-center gap-2 mb-4">
                  <span className="text-xl">✦</span>
                  <h1 className="font-bold text-dark-600 text-lg">IMAGINIFY</h1>
                </Link>
                <ul className="header-nav_elements">
                  {navLinks.map((link) => {
                    const isActive = link.route === pathname;
                    return (
                      <li key={link.route} className={cn("p-18-semibold flex whitespace-nowrap text-dark-700", isActive && "gradient-text")}>
                        <Link href={link.route} className="flex gap-4 p-4 w-full">
                          <span className="text-xl">{link.icon}</span>
                          {link.label}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </>
            </SheetContent>
          </Sheet>
        </SignedIn>
        <SignedOut>
          <Link href="/sign-in" className="button bg-purple-gradient text-white text-sm px-4 py-2">Login</Link>
        </SignedOut>
      </nav>
    </header>
  );
};

export default MobileNav;
