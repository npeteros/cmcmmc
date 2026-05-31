"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionActive } from "@/lib/admin-auth";
import {
  SUBMISSION_STATUSES,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
import { updateSubmissionStatus } from "@/lib/submissions.server";

export type UpdateSubmissionStatusState = {
  status: "idle" | "success" | "error";
  message?: string;
};

function isSubmissionStatus(value: string): value is SubmissionStatus {
  return SUBMISSION_STATUSES.includes(value as SubmissionStatus);
}

export async function updateSubmissionStatusAction(
  _previousState: UpdateSubmissionStatusState,
  formData: FormData,
): Promise<UpdateSubmissionStatusState> {
  if (!(await isAdminSessionActive())) {
    redirect("/login");
  }

  const id = String(formData.get("id") ?? "").trim();
  const status = String(formData.get("status") ?? "").trim();

  if (!id || !isSubmissionStatus(status)) {
    return {
      status: "error",
      message: "Invalid submission status update payload.",
    };
  }

  const updatedSubmission = await updateSubmissionStatus(id, status);

  if (!updatedSubmission) {
    return {
      status: "error",
      message: "Submission not found.",
    };
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${id}`);

  return {
    status: "success",
    message: `Status updated to ${status}.`,
  };
}
