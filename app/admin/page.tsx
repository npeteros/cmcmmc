import type { Metadata } from "next";

import AdminDashboard from "./AdminDashboard";
import { listSubmissions } from "@/lib/submissions.server";

export const metadata: Metadata = {
  title: "Admin Dashboard",
  description: "Review and export registration submissions.",
};

export default async function AdminPage() {
  const submissions = await listSubmissions();

  return (
    <main className="min-h-screen bg-[linear-gradient(180deg,#f4f8ff_0%,#eef4ff_45%,#f8fbff_100%)] px-4 py-10 sm:px-6 lg:px-8">
      <div className="mx-auto w-full max-w-7xl">
        <div className="mb-8">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-[#2aadb5]">Protected area</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1a2e5a] md:text-4xl">Submission dashboard</h1>
        </div>

        <AdminDashboard submissions={submissions} />
      </div>
    </main>
  );
}