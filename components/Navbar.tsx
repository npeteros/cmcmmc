"use client";

import Link from "next/link";
import Image from "next/image";

const navLinks = [
  { label: "About the Congress", href: "#about" },
  { label: "Speakers", href: "#speakers" },
  { label: "Program", href: "#program" },
  { label: "Registration", href: "/registration" },
  { label: "RCAC Website", href: "https://thearchdioceseofcebu.com/", external: true },
];

export default function Navbar() {
  return (
    <nav className="sticky top-0 z-50 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-full mx-auto px-4 sm:px-6 flex items-center justify-between h-[15vh]">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-3 shrink-0 max-w-[150px]">
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

        {/* Mobile menu button placeholder */}
        <button className="md:hidden flex flex-col gap-1.5 p-2">
          <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
          <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
          <span className="block w-6 h-0.5 bg-[#1a2e5a]" />
        </button>
      </div>
    </nav>
  );
}