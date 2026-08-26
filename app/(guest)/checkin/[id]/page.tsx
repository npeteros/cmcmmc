import { notFound, redirect } from "next/navigation";

import { isStaffSessionActive } from "@/lib/auth/session";
import { getSubmissionById } from "@/lib/submissions.server";
import { toGuestView } from "@/lib/guest-submission-view";
import GuestRegistrationView from "./GuestRegistrationView";

type CheckinPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckinPage({ params }: CheckinPageProps) {
  const { id } = await params;

  if (await isStaffSessionActive()) {
    redirect(`/attendance?id=${encodeURIComponent(id)}`);
  }

  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return <GuestRegistrationView submission={toGuestView(submission)} />;
}
