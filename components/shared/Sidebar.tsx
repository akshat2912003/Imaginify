"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { navLinks } from "@/constants";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();

  const mainTools = navLinks.slice(0, 10);
  const bottomLinks = navLinks.slice(10);

  return (
    <aside className="sidebar">
      <div className="flex size-full flex-col gap-4">
        {/* Logo */}
        <Link href="/" className="sidebar-logo">
          <span className="text-2xl">✦</span>
          <h1 className="h2-bold text-dark-600 font-bold tracking-tight">IMAGINIFY</h1>
        </Link>

        <nav className="sidebar-nav">
          <SignedIn>
            <ul className="sidebar-nav_elements">
              {mainTools.map((link) => {
                const isActive = link.route === pathname;
                const isGemini = link.route.startsWith("/ai/");
                return (
                  <li
                    key={link.route}
                    className={cn(
                      "sidebar-nav_element group",
                      isActive && "bg-purple-gradient text-white shadow-inner"
                    )}
                  >
                    <Link href={link.route} className="sidebar-link">
                      <span className="text-xl">{link.icon}</span>
                      <span className={cn("p-16-semibold", isActive ? "text-white" : "text-dark-700")}>
                        {link.label}
                      </span>
                      {isGemini && (
                        <span className="ml-auto text-[10px] bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded-full font-bold">
                          AI
                        </span>
                      )}
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SignedIn>

          <SignedOut>
            <ul className="sidebar-nav_elements">
              <li className={cn("sidebar-nav_element", pathname === "/" && "bg-purple-gradient text-white")}>
                <Link href="/" className="sidebar-link">
                  <span className="text-xl">🏠</span>
                  <span className="p-16-semibold text-dark-700">Home</span>
                </Link>
              </li>
              <li className="mt-4">
                <Link href="/sign-in" className="button bg-purple-gradient w-full text-white text-center block px-6 py-3 rounded-full">
                  Login
                </Link>
              </li>
            </ul>
          </SignedOut>

          <SignedIn>
            <ul className="sidebar-nav_elements">
              {bottomLinks.map((link) => {
                const isActive = link.route === pathname;
                return (
                  <li
                    key={link.route}
                    className={cn(
                      "sidebar-nav_element group",
                      isActive && "bg-purple-gradient text-white shadow-inner"
                    )}
                  >
                    <Link href={link.route} className="sidebar-link">
                      <span className="text-xl">{link.icon}</span>
                      <span className={cn("p-16-semibold", isActive ? "text-white" : "text-dark-700")}>
                        {link.label}
                      </span>
                    </Link>
                  </li>
                );
              })}
              <li className="flex-center cursor-pointer gap-2 p-4">
                <UserButton afterSignOutUrl="/" showName />
              </li>
            </ul>
          </SignedIn>
        </nav>
      </div>
    </aside>
  );
};

export default Sidebar;
