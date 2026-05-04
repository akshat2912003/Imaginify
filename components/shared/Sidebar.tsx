"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { UserButton, SignedIn, SignedOut } from "@clerk/nextjs";
import { navLinks } from "@/constants";
import { cn } from "@/lib/utils";

const Sidebar = () => {
  const pathname = usePathname();

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
              {navLinks.slice(0, 6).map((link) => {
                const isActive = link.route === pathname;
                return (
                  <li key={link.route} className={cn("sidebar-nav_element group", isActive && "bg-purple-gradient text-white shadow-inner")}>
                    <Link href={link.route} className="sidebar-link">
                      <span className="text-xl">{link.icon}</span>
                      <span className={cn("p-16-semibold", isActive ? "text-white" : "text-dark-700")}>{link.label}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </SignedIn>

          <SignedOut>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(0, 1).map((link) => (
                <li key={link.route} className={cn("sidebar-nav_element", pathname === link.route && "bg-purple-gradient text-white")}>
                  <Link href={link.route} className="sidebar-link">
                    <span className="text-xl">{link.icon}</span>
                    <span className="p-16-semibold text-dark-700">{link.label}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link href="/sign-in" className="button bg-purple-gradient w-full text-white mt-4">Login</Link>
              </li>
            </ul>
          </SignedOut>

          <SignedIn>
            <ul className="sidebar-nav_elements">
              {navLinks.slice(6).map((link) => {
                const isActive = link.route === pathname;
                return (
                  <li key={link.route} className={cn("sidebar-nav_element group", isActive && "bg-purple-gradient text-white shadow-inner")}>
                    <Link href={link.route} className="sidebar-link">
                      <span className="text-xl">{link.icon}</span>
                      <span className={cn("p-16-semibold", isActive ? "text-white" : "text-dark-700")}>{link.label}</span>
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
