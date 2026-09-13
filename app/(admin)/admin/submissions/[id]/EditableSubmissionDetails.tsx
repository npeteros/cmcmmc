"use client";

import { Pencil } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, useTransition, type FormEvent, type ReactNode } from "react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  formatSubmissionDate,
  getAffiliationLabel,
  getSubmissionDisplayName,
  getSubmissionOrganization,
  type Submission,
} from "@/lib/admin-submissions";
import { updateSubmissionDetailsAction } from "@/lib/admin/submissions/actions";
import {
  affiliationOptions,
  day1Options,
  day2Options,
  designationOptions,
  ministryOptions,
  parishOptions,
  shirtSizes,
  titleOptions,
} from "@/lib/registration-options";

const selectClassName =
  "h-10 w-full rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2";

function DetailItem({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-medium text-slate-700">{value || "—"}</p>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className="space-y-1">
      <Label htmlFor={htmlFor}>{label}</Label>
      {children}
    </div>
  );
}

function getAffiliationDetails(submission: Submission) {
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

function EditFields({
  submission,
  onCancel,
  onSaved,
}: {
  submission: Submission;
  onCancel: () => void;
  onSaved: () => void;
}) {
  const [affiliationType, setAffiliationType] = useState(submission.affiliationType);
  const [archdiocese, setArchdiocese] = useState(submission.archdiocese);
  const [roleInMinistry, setRoleInMinistry] = useState(submission.roleInMinistry);
  const [designation, setDesignation] = useState(submission.designation);
  const [isPending, startTransition] = useTransition();

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);

    startTransition(async () => {
      const result = await updateSubmissionDetailsAction({ status: "idle" }, formData);

      if (result.status === "success") {
        toast.success(result.message ?? "Submission details updated.");
        onSaved();
        return;
      }

      toast.error(result.message ?? "Failed to update submission.");
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="id" value={submission.id} />

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#1a2e5a]">Personal information</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Title" htmlFor="title">
            <select
              id="title"
              name="title"
              defaultValue={submission.title}
              className={selectClassName}
              disabled={isPending}
            >
              {titleOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </Field>
          <Field label="First name" htmlFor="firstName">
            <Input id="firstName" name="firstName" defaultValue={submission.firstName} disabled={isPending} required />
          </Field>
          <Field label="Middle name" htmlFor="middleName">
            <Input id="middleName" name="middleName" defaultValue={submission.middleName} disabled={isPending} />
          </Field>
          <Field label="Surname" htmlFor="surname">
            <Input id="surname" name="surname" defaultValue={submission.surname} disabled={isPending} required />
          </Field>
          <Field label="Congregation" htmlFor="congregation">
            <Input id="congregation" name="congregation" defaultValue={submission.congregation} disabled={isPending} />
          </Field>
          <Field label="Email" htmlFor="email">
            <Input id="email" name="email" type="email" defaultValue={submission.email} disabled={isPending} required />
          </Field>
          <Field label="Mobile" htmlFor="mobile">
            <Input id="mobile" name="mobile" defaultValue={submission.mobile} disabled={isPending} required />
          </Field>
          <Field label="Complete address" htmlFor="completeAddress">
            <Input
              id="completeAddress"
              name="completeAddress"
              defaultValue={submission.completeAddress}
              disabled={isPending}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#1a2e5a]">Shirt & logistics</p>
        <div className="grid gap-4 md:grid-cols-2">
          <Field label="Shirt size" htmlFor="shirtSize">
            <select
              id="shirtSize"
              name="shirtSize"
              defaultValue={submission.shirtSize}
              className={selectClassName}
              disabled={isPending}
            >
              {shirtSizes.map((size) => (
                <option key={size} value={size}>
                  {size}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Day 1 session" htmlFor="day1Session">
            <select
              id="day1Session"
              name="day1Session"
              defaultValue={submission.day1Session}
              className={selectClassName}
              disabled={isPending}
            >
              {day1Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Day 2 session" htmlFor="day2Session">
            <select
              id="day2Session"
              name="day2Session"
              defaultValue={submission.day2Session}
              className={selectClassName}
              disabled={isPending}
            >
              {day2Options.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </Field>
          <Field label="Accommodation" htmlFor="accommodation">
            <select
              id="accommodation"
              name="accommodation"
              defaultValue={submission.accommodation}
              className={selectClassName}
              disabled={isPending}
            >
              <option value="avail">Requested</option>
              <option value="self">Not requested</option>
            </select>
          </Field>
          <Field label="Payment mode" htmlFor="paymentMode">
            <select
              id="paymentMode"
              name="paymentMode"
              defaultValue={submission.paymentMode}
              className={selectClassName}
              disabled={isPending}
            >
              <option value="GCash">GCash</option>
              <option value="BDO">BDO</option>
            </select>
          </Field>
          <Field label="Transaction number" htmlFor="transactionNumber">
            <Input
              id="transactionNumber"
              name="transactionNumber"
              defaultValue={submission.transactionNumber}
              disabled={isPending}
            />
          </Field>
        </div>
      </div>

      <div className="space-y-3">
        <p className="text-sm font-semibold text-[#1a2e5a]">Affiliation</p>
        <Field label="Affiliation type" htmlFor="affiliationType">
          <select
            id="affiliationType"
            name="affiliationType"
            value={affiliationType}
            onChange={(e) => setAffiliationType(e.target.value as Submission["affiliationType"])}
            className={selectClassName}
            disabled={isPending}
          >
            {affiliationOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </Field>

        {affiliationType === "parish" && (
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <Field label="Archdiocese" htmlFor="archdiocese">
              <select
                id="archdiocese"
                name="archdiocese"
                value={archdiocese}
                onChange={(e) => setArchdiocese(e.target.value)}
                className={selectClassName}
                disabled={isPending}
              >
                {parishOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            {archdiocese === "Others" && (
              <Field label="Archdiocese (other)" htmlFor="archdioceseOther">
                <Input
                  id="archdioceseOther"
                  name="archdioceseOther"
                  defaultValue={submission.archdioceseOther}
                  disabled={isPending}
                />
              </Field>
            )}
            <Field label="Parish name" htmlFor="parishName">
              <Input id="parishName" name="parishName" defaultValue={submission.parishName} disabled={isPending} />
            </Field>
            <Field label="Parish address" htmlFor="parishAddress">
              <Input
                id="parishAddress"
                name="parishAddress"
                defaultValue={submission.parishAddress}
                disabled={isPending}
              />
            </Field>
            <Field label="Organization name" htmlFor="organizationName">
              <Input
                id="organizationName"
                name="organizationName"
                defaultValue={submission.organizationName}
                disabled={isPending}
              />
            </Field>
            <Field label="Role in ministry" htmlFor="roleInMinistry">
              <select
                id="roleInMinistry"
                name="roleInMinistry"
                value={roleInMinistry}
                onChange={(e) => setRoleInMinistry(e.target.value)}
                className={selectClassName}
                disabled={isPending}
              >
                {ministryOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            {roleInMinistry === "Others" && (
              <Field label="Role in ministry (other)" htmlFor="roleInMinistryOther">
                <Input
                  id="roleInMinistryOther"
                  name="roleInMinistryOther"
                  defaultValue={submission.roleInMinistryOther}
                  disabled={isPending}
                />
              </Field>
            )}
          </div>
        )}

        {affiliationType === "school" && (
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <Field label="Province" htmlFor="province">
              <Input id="province" name="province" defaultValue={submission.province} disabled={isPending} />
            </Field>
            <Field label="School name" htmlFor="schoolName">
              <Input id="schoolName" name="schoolName" defaultValue={submission.schoolName} disabled={isPending} />
            </Field>
            <Field label="School address" htmlFor="schoolAddress">
              <Input
                id="schoolAddress"
                name="schoolAddress"
                defaultValue={submission.schoolAddress}
                disabled={isPending}
              />
            </Field>
            <Field label="Designation" htmlFor="designation">
              <select
                id="designation"
                name="designation"
                value={designation}
                onChange={(e) => setDesignation(e.target.value)}
                className={selectClassName}
                disabled={isPending}
              >
                {designationOptions.map((option) => (
                  <option key={option} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </Field>
            {designation === "Others" && (
              <Field label="Designation (other)" htmlFor="designationOther">
                <Input
                  id="designationOther"
                  name="designationOther"
                  defaultValue={submission.designationOther}
                  disabled={isPending}
                />
              </Field>
            )}
          </div>
        )}

        {affiliationType === "neither" && (
          <div className="grid gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
            <Field label="Company / organization" htmlFor="companyOrganization">
              <Input
                id="companyOrganization"
                name="companyOrganization"
                defaultValue={submission.companyOrganization}
                disabled={isPending}
              />
            </Field>
            <Field label="Company address" htmlFor="companyAddress">
              <Input
                id="companyAddress"
                name="companyAddress"
                defaultValue={submission.companyAddress}
                disabled={isPending}
              />
            </Field>
            <Field label="Position / designation" htmlFor="positionDesignation">
              <Input
                id="positionDesignation"
                name="positionDesignation"
                defaultValue={submission.positionDesignation}
                disabled={isPending}
              />
            </Field>
          </div>
        )}

        {/* Hidden inputs keep the non-active affiliation branches' fields in the payload as empty strings. */}
        {affiliationType !== "parish" && (
          <>
            <input type="hidden" name="archdiocese" value={parishOptions[0]} />
            <input type="hidden" name="archdioceseOther" value="" />
            <input type="hidden" name="parishName" value="" />
            <input type="hidden" name="parishAddress" value="" />
            <input type="hidden" name="organizationName" value="" />
            <input type="hidden" name="roleInMinistry" value={ministryOptions[0]} />
            <input type="hidden" name="roleInMinistryOther" value="" />
          </>
        )}
        {affiliationType !== "school" && (
          <>
            <input type="hidden" name="province" value="" />
            <input type="hidden" name="schoolName" value="" />
            <input type="hidden" name="schoolAddress" value="" />
            <input type="hidden" name="designation" value={designationOptions[0]} />
            <input type="hidden" name="designationOther" value="" />
          </>
        )}
        {affiliationType !== "neither" && (
          <>
            <input type="hidden" name="companyOrganization" value="" />
            <input type="hidden" name="companyAddress" value="" />
            <input type="hidden" name="positionDesignation" value="" />
          </>
        )}
      </div>

      <div className="flex gap-3">
        <Button type="submit" className="flex-1" disabled={isPending}>
          {isPending ? "Saving..." : "Save changes"}
        </Button>
        <Button type="button" variant="outline" className="flex-1" disabled={isPending} onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  );
}

export default function EditableSubmissionDetails({
  submission,
  idUploadUrl,
  paymentProofUrl,
  invoiceUrl,
}: {
  submission: Submission;
  idUploadUrl: string | null;
  paymentProofUrl: string | null;
  invoiceUrl: string | null;
}) {
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);

  const day1SessionLabel =
    day1Options.find((option) => option.value === submission.day1Session)?.label || submission.day1Session;
  const day2SessionLabel =
    day2Options.find((option) => option.value === submission.day2Session)?.label || submission.day2Session;
  const day1SessionSpeaker = day1Options.find((option) => option.value === submission.day1Session)?.speaker;
  const day2SessionSpeaker = day2Options.find((option) => option.value === submission.day2Session)?.speaker;
  const day1SessionInfo = day1SessionSpeaker ? `${day1SessionLabel} (${day1SessionSpeaker})` : day1SessionLabel;
  const day2SessionInfo = day2SessionSpeaker ? `${day2SessionLabel} (${day2SessionSpeaker})` : day2SessionLabel;
  const affiliationDetails = getAffiliationDetails(submission);

  return (
    <div className="space-y-6 rounded-[2rem] border border-slate-200 bg-white p-6 shadow-sm">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">Submission detail</p>
          <h1 className="mt-3 text-3xl font-semibold text-[#1a2e5a]">{getSubmissionDisplayName(submission)}</h1>
          <p className="mt-2 text-sm text-slate-500">
            {getAffiliationLabel(submission.affiliationType)} submission • {formatSubmissionDate(submission.submittedAt)}
          </p>
        </div>
        {!isEditing && (
          <Button
            type="button"
            variant="ghost"
            size="icon-sm"
            aria-label="Edit submission details"
            onClick={() => setIsEditing(true)}
          >
            <Pencil className="size-4" />
          </Button>
        )}
      </div>

      {isEditing ? (
        <EditFields
          submission={submission}
          onCancel={() => setIsEditing(false)}
          onSaved={() => {
            setIsEditing(false);
            router.refresh();
          }}
        />
      ) : (
        <>
          <div className="grid gap-4 md:grid-cols-2">
            <DetailItem label="Email" value={submission.email} />
            <DetailItem label="Mobile" value={submission.mobile} />
            <DetailItem label="Congregation" value={submission.congregation} />
            <DetailItem label="Organization" value={getSubmissionOrganization(submission)} />
            <DetailItem label="Shirt size" value={submission.shirtSize} />
            <DetailItem label="Day 1 session" value={day1SessionInfo} />
            <DetailItem label="Day 2 session" value={day2SessionInfo} />
            <DetailItem
              label="Accommodation"
              value={submission.accommodation === "avail" ? "Requested" : "Not requested"}
            />
            <DetailItem label="Payment mode" value={submission.paymentMode} />
            <DetailItem label="Transaction number" value={submission.transactionNumber} />
          </div>

          <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
            <h2 className="text-lg font-semibold text-[#1a2e5a]">Affiliation details</h2>
            <div className="grid gap-4 md:grid-cols-2">
              {affiliationDetails.map((detail) => (
                <DetailItem key={detail.label} label={detail.label} value={detail.value} />
              ))}
            </div>
          </div>
        </>
      )}

      <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50 p-5">
        <h2 className="text-lg font-semibold text-[#1a2e5a]">Address and notes</h2>
        {!isEditing && <DetailItem label="Complete address" value={submission.completeAddress} />}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Valid ID upload</p>
            <p className="mt-2 text-sm font-medium text-slate-700 truncate">{submission.idUploadName}</p>
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
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Payment proof</p>
            <p className="mt-2 text-sm font-medium text-slate-700 truncate">{submission.paymentProofName}</p>
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
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">Invoice</p>
            <p className="mt-2 text-sm font-medium text-slate-700 truncate">{submission.invoiceName || "—"}</p>
            {invoiceUrl ? (
              <a
                className="mt-2 inline-block text-sm font-semibold text-[#2aadb5] hover:underline"
                href={invoiceUrl}
                target="_blank"
                rel="noreferrer"
              >
                Open file
              </a>
            ) : null}
          </div>
        </div>
        <p className="text-sm text-slate-500">
          These file names are placeholders in the mock dataset. When storage is connected later, this section can
          link directly to the uploaded files.
        </p>
      </div>
    </div>
  );
}
