"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { isAdminSessionActive } from "@/lib/admin-auth";
import {
  SUBMISSION_STATUSES,
  type SubmissionStatus,
  getSubmissionDisplayName,
} from "@/lib/admin-submissions";
import { deleteSubmission, updateSubmissionStatus, uploadInvoice } from "@/lib/submissions.server";
import { sendParticipationConfirmationEmail } from "@/lib/mail-service";

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

  let invoiceFile: File | null = null;
  let invoiceBuffer: Buffer | undefined;

  if (status === "Verified" && process.env.SEND_CONFIRMATION_EMAIL === "true") {
    const raw = formData.get("invoice");

    if (!(raw instanceof File) || raw.size === 0) {
      return {
        status: "error",
        message: "Please upload an invoice PDF before verifying.",
      };
    }

    if (raw.type !== "application/pdf") {
      return {
        status: "error",
        message: "Invoice must be a PDF file.",
      };
    }

    invoiceFile = raw;
  }

  const updatedSubmission = await updateSubmissionStatus(id, status);

  if (!updatedSubmission) {
    return {
      status: "error",
      message: "Submission not found.",
    };
  }

  if (invoiceFile) {
    try {
      const result = await uploadInvoice(id, invoiceFile);
      invoiceBuffer = result.invoiceBuffer;
    } catch {
      return {
        status: "error",
        message: "Failed to upload invoice. Please try again.",
      };
    }

    if (process.env.SEND_CONFIRMATION_EMAIL === "true") {
      const name = getSubmissionDisplayName(updatedSubmission);
      sendParticipationConfirmationEmail({
        name,
        email: updatedSubmission.email,
        invoiceBuffer,
        invoiceFileName: invoiceFile.name,
      }).catch((err) => console.error("Failed to send participation confirmation email:", err));
    }
  }

  revalidatePath("/admin");
  revalidatePath(`/admin/submissions/${id}`);

  return {
    status: "success",
    message: `Status updated to ${status}.`,
  };
}

export type DeleteSubmissionState = {
  status: "idle" | "success" | "error";
  message?: string;
};

export async function deleteSubmissionAction(
  submissionId: string,
): Promise<DeleteSubmissionState> {
  if (!(await isAdminSessionActive())) {
    redirect("/login");
  }

  const id = submissionId.trim();

  if (!id) {
    return { status: "error", message: "Missing submission ID." };
  }

  try {
    await deleteSubmission(id);
  } catch {
    return { status: "error", message: "Failed to delete submission." };
  }

  revalidatePath("/admin");

  return { status: "success" };
}
