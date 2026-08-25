import { notFound, redirect } from "next/navigation";

import { isAdminSessionActive } from "@/lib/admin-auth";
import { getSubmissionById } from "@/lib/submissions.server";
import { toGuestView } from "@/lib/guest-submission-view";
import GuestRegistrationView from "./GuestRegistrationView";

type CheckinPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CheckinPage({ params }: CheckinPageProps) {
  const { id } = await params;

  if (await isAdminSessionActive()) {
    redirect(`/attendance?id=${encodeURIComponent(id)}`);
  }

  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  return <GuestRegistrationView submission={toGuestView(submission)} />;
}
