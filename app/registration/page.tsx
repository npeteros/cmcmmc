import type { Metadata } from "next";
import RegistrationForm from "./RegistrationForm";

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
    <main>
      <RegistrationForm />
    </main>
  );
}
