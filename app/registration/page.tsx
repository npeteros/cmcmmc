import type { Metadata } from "next";
import { siteName } from "../../lib/seo";

export const metadata: Metadata = {
  title: "Registration",
  description:
    "Registration details and updates for the Cebu Metropolitan Catholic Mass Media Congress.",
  alternates: {
    canonical: "/registration",
  },
};

export default function RegistrationPage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-4 py-16">
      <h1 className="text-2xl font-bold text-[#1a2e5a] mb-4">Registration</h1>
      <p className="text-sm text-gray-700 leading-relaxed mb-4">
        Registration information for {siteName} will be announced soon.
        Please check back for fees, deadlines, and step-by-step instructions.
      </p>
      <p className="text-sm text-gray-700 leading-relaxed">
        For updates, follow our official channels or email
        thearchdioceseofcebu@gmail.com.
      </p>
    </main>
  );
}
