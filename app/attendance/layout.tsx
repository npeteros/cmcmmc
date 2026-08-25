import Link from "next/link";

import { Button } from "@/components/ui/button";
import { requireAdminSession } from "@/lib/admin-auth";

export default async function AttendanceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  await requireAdminSession();

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
        <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">CM-CMMC attendance</p>
            <Link href="/attendance" className="mt-2 block text-lg font-semibold text-[#1a2e5a]">
              Check-in scanner
            </Link>
          </div>

          <Button asChild variant="outline">
            <Link href="/admin">Admin dashboard</Link>
          </Button>
        </div>
      </header>
      {children}
    </div>
  );
}
