"use client";

import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import {
  Sheet,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetClose,
} from "./ui/sheet";

const navLinks = [
  { label: "About the Congress", href: "/#about" },
  { label: "Speakers", href: "/#speakers" },
  { label: "Program", href: "/2nd-CM-CMMC-Program.pdf", external: true },
  { label: "Registration", href: "/registration" },
  { label: "Vote", href: "/vote" },
  { label: "RCAC Website", href: "https://thearchdioceseofcebu.com/", external: true },
];

export default function Navbar() {
  const pathname = usePathname();

  if (pathname.startsWith("/admin") || pathname === "/login") {
    return null;
  }

  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-[15vh]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 max-w-37.5">
          {/* Placeholder logo */}
          <Image src="/logo.png" alt="CM-CMMC Logo" width={200} height={200} />
        </Link>

        {/* Nav links */}
        <ul className="hidden md:flex items-center gap-6">
          {navLinks.map((link) => (
            <li key={link.label}>
              <Link
                href={link.href}
                target={link.external ? "_blank" : undefined}
                className="text-xs font-semibold text-black uppercase tracking-wide hover:text-[#0091C0] transition-colors"
              >
                {link.label}
              </Link>
            </li>
          ))}
        </ul>

        {/* Mobile menu (Sheet) */}
        <Sheet>
          <SheetTrigger asChild>
            <button
              className="md:hidden flex flex-col gap-1.5 p-2"
              aria-label="Open menu"
            >
              <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
              <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
              <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
            </button>
          </SheetTrigger>

          <SheetContent side="right" className="md:hidden w-3/4 sm:max-w-sm" showCloseButton={false}>
            <SheetHeader className="flex items-center justify-between p-4">
              <Link href="/" className="flex items-center gap-3">
                <Image src="/logo.png" alt="CM-CMMC Logo" width={150} height={150} />
              </Link>
            </SheetHeader>

            <nav className="flex flex-col gap-4 p-4">
              {navLinks.map((link) => (
                <SheetClose asChild key={link.label}>
                  <Link
                    href={link.href}
                    target={link.external ? "_blank" : undefined}
                    className="text-sm font-semibold text-black uppercase tracking-wide hover:text-[#0091C0] transition-colors"
                  >
                    {link.label}
                  </Link>
                </SheetClose>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </div>
    </nav>
  );
}