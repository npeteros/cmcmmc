import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { Button } from "@/components/ui/button";
import {
  formatSubmissionDate,
  getAffiliationLabel,
  getSubmissionDisplayName,
  getSubmissionOrganization,
} from "@/lib/admin-submissions";
import {
  getSubmissionById,
  getSubmissionFileUrl,
} from "@/lib/submissions.server";
import StatusUpdateForm from "./StatusUpdateForm";
import { day1Options, day2Options } from "@/lib/registration-options";

type SubmissionPageProps = {
  params: Promise<{
    id: string;
  }>;
};

export async function generateMetadata({
  params,
}: SubmissionPageProps): Promise<Metadata> {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    return { title: "Submission not found" };
  }

  return {
    title: `${getSubmissionDisplayName(submission)} | Admin`,
    description: `Review submission ${submission.id}`,
  };
}

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
        {label}
      </p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function getStatusTone(status: string) {
  if (status === "Verified") {
    return "border-emerald-200 bg-emerald-50 text-emerald-700";
  }

  if (status === "Needs review") {
    return "border-amber-200 bg-amber-50 text-amber-700";
  }

  return "border-slate-200 bg-slate-100 text-slate-700";
}

function getAffiliationDetails(
  submission: Awaited<ReturnType<typeof getSubmissionById>>,
) {
  if (!submission) {
    return [] as Array<{ label: string; value: string }>;
  }

  if (submission.affiliationType === "parish") {
    const archdioceseLabel =
      submission.archdiocese === "Others" && submission.archdioceseOther
        ? `${submission.archdiocese} (${submission.archdioceseOther})`
        : submission.archdiocese;

    return [
      { label: "Archdiocese", value: archdioceseLabel },
      { label: "Parish name", value: submission.parishName },
      { label: "Parish address", value: submission.parishAddress },
      { label: "Organization name", value: submission.organizationName },
      {
        label: "Role in the ministry",
        value:
          submission.roleInMinistry === "Others" && submission.roleInMinistryOther
            ? `${submission.roleInMinistry} (${submission.roleInMinistryOther})`
            : submission.roleInMinistry,
      },
    ];
  }

  if (submission.affiliationType === "school") {
    return [
      { label: "Province", value: submission.province },
      { label: "School name", value: submission.schoolName },
      { label: "School address", value: submission.schoolAddress },
      {
        label: "Designation",
        value:
          submission.designation === "Others" && submission.designationOther
            ? `${submission.designation} (${submission.designationOther})`
            : submission.designation,
      },
    ];
  }

  return [
    { label: "Company / Organization", value: submission.companyOrganization },
    { label: "Company address", value: submission.companyAddress },
    { label: "Position / Designation", value: submission.positionDesignation },
  ];
}

export default async function SubmissionPage({ params }: SubmissionPageProps) {
  const { id } = await params;
  const submission = await getSubmissionById(id);

  if (!submission) {
    notFound();
  }

  const idUploadUrl = await getSubmissionFileUrl(submission.idUploadPath);
  const paymentProofUrl = await getSubmissionFileUrl(
    submission.paymentProofPath,
  );

  const day1SessionLabel =
    day1Options.find((option) => option.value === submission.day1Session)
      ?.label || submission.day1Session;
  const day2SessionLabel =
    day2Options.find((option) => option.value === submission.day2Session)
      ?.label || submission.day2Session;

  const day1SessionSpeaker = day1Options.find(
    (option) => option.value === submission.day1Session,
  )?.speaker;
  const day2SessionSpeaker = day2Options.find(
    (option) => option.value === submission.day2Session,
  )?.speaker;

  const day1SessionInfo = day1SessionSpeaker
    ? `${day1SessionLabel} (${day1SessionSpeaker})`
    : day1SessionLabel;
  const day2SessionInfo = day2SessionSpeaker
    ? `${day2SessionLabel} (${day2SessionSpeaker})`
    : day2SessionLabel;
  const affiliationDetails = getAffiliationDetails(submission);

  return (
    <main className="mx-auto w-full max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="mb-6 flex flex-wrap items-center gap-3">
        <Button asChild variant="outline">
          <Link href="/admin">Back to dashboard</Link>
        </Button>
        <span className="text-sm text-slate-500">
          Submission ID {submission.id}
        </span>
      </div>

      <section className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
        <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">
              Submission detail
            </p>
            <h1 className="mt-3 text-3xl font-semibold text-[#1a2e5a]">
              {getSubmissionDisplayName(submission)}
            </h1>
            <p className="mt-2 text-sm text-slate-500">
              {getAffiliationLabel(submission.affiliationType)} submission •{" "}
              {formatSubmissionDate(submission.submittedAt)}
            </p>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Email" value={submission.email} />
            <DetailItem label="Mobile" value={submission.mobile} />
            <DetailItem
              label="Organization"
              value={getSubmissionOrganization(submission)}
            />
            <DetailItem label="Shirt size" value={submission.shirtSize} />
            <DetailItem label="Day 1 session" value={day1SessionInfo} />
            <DetailItem label="Day 2 session" value={day2SessionInfo} />
            <DetailItem
              label="Accommodation"
              value={submission.accommodation === "avail" ? "Requested" : "Not requested"}
            />
            <DetailItem label="Payment mode" value={submission.paymentMode} />
            <DetailItem
              label="Transaction number"
              value={submission.transactionNumber}
            />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-[#1a2e5a]">
              Affiliation details
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {affiliationDetails.map((detail) => (
                <DetailItem
                  key={detail.label}
                  label={detail.label}
                  value={detail.value}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-[#1a2e5a]">
              Address and notes
            </h2>
            <DetailItem
              label="Complete address"
              value={submission.completeAddress}
            />
            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Valid ID upload
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700 truncate">
                  {submission.idUploadName}
                </p>
                {idUploadUrl ? (
                  <a
                    className="mt-2 inline-block text-sm font-semibold text-[#2aadb5] hover:underline"
                    href={idUploadUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                ) : null}
              </div>
              <div className="rounded-xl border border-slate-200 bg-white p-4">
                <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">
                  Payment proof
                </p>
                <p className="mt-2 text-sm font-medium text-slate-700 truncate">
                  {submission.paymentProofName}
                </p>
                {paymentProofUrl ? (
                  <a
                    className="mt-2 inline-block text-sm font-semibold text-[#2aadb5] hover:underline"
                    href={paymentProofUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Open file
                  </a>
                ) : null}
              </div>
            </div>
            <p className="text-sm text-slate-500">
              These file names are placeholders in the mock dataset. When
              storage is connected later, this section can link directly to the
              uploaded files.
            </p>
          </div>
        </div>

        <aside className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">
              Status
            </p>
            <div
              className={`mt-3 inline-flex rounded-full border px-3 py-1 text-sm font-semibold ${getStatusTone(submission.status)}`}
            >
              {submission.status}
            </div>
          </div>

          <StatusUpdateForm
            submissionId={submission.id}
            currentStatus={submission.status}
          />

          <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50 p-5 text-sm text-slate-600">
            <p className="font-semibold text-[#1a2e5a]">Review checklist</p>
            <p>Confirm the uploaded ID is readable.</p>
            <p>Confirm the payment proof matches the selected mode.</p>
            <p>Confirm the breakout sessions are still available.</p>
          </div>

          <div className="space-y-3 rounded-2xl border border-dashed border-slate-300 bg-white p-5 text-sm text-slate-600">
            <p className="font-semibold text-[#1a2e5a]">Next actions</p>
            <p>
              Use the dashboard list to continue filtering or searching other
              submissions.
            </p>
            <p>Export the dataset when you need a spreadsheet copy.</p>
          </div>
        </aside>
      </section>
    </main>
  );
}
