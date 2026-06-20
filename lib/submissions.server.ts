import "server-only";

import { randomUUID } from "crypto";

import {
  mockSubmissions,
  type Submission,
  type SubmissionStatus,
  getAffiliationLabel,
  getSubmissionOrganization,
} from "@/lib/admin-submissions";
import {
  ACCOMMODATION_CAP,
  day1Options,
  day2Options,
  SESSION_CAP,
} from "@/lib/registration-options";
import { getStorageBucketName, createClient } from "@/lib/supabase.server";
import { cookies } from 'next/headers'

type SubmissionRow = {
  id: string;
  submitted_at: string;
  status: Submission["status"];
  affiliation_type: Submission["affiliationType"];
  title: string;
  first_name: string;
  middle_name: string;
  surname: string;
  congregation: string;
  email: string;
  mobile: string;
  complete_address: string;
  shirt_size: string;
  organization_name: string;
  archdiocese: string;
  archdiocese_other: string | null;
  parish_name: string;
  parish_address: string;
  role_in_ministry: string;
  role_in_ministry_other: string;
  province: string;
  school_name: string;
  school_address: string;
  designation: string;
  designation_other: string;
  company_organization: string;
  company_address: string;
  position_designation: string;
  day1_session: string;
  day2_session: string;
  accommodation: Submission["accommodation"];
  payment_mode: Submission["paymentMode"];
  transaction_number: string | null;
  id_upload_name: string;
  payment_proof_name: string;
  id_upload_path: string | null;
  payment_proof_path: string | null;
};

export type RegistrationSubmissionInput = {
  affiliationType: Submission["affiliationType"];
  archdiocese: string;
  archdioceseOther: string;
  parishName: string;
  parishAddress: string;
  organizationName: string;
  roleInMinistry: string;
  roleInMinistryOther: string;
  province: string;
  schoolName: string;
  schoolAddress: string;
  designation: string;
  designationOther: string;
  companyOrganization: string;
  companyAddress: string;
  positionDesignation: string;
  title: string;
  firstName: string;
  middleName: string;
  surname: string;
  congregation: string;
  email: string;
  mobile: string;
  completeAddress: string;
  shirtSize: string;
  day1Session: string;
  day2Session: string;
  accommodation: Submission["accommodation"];
  paymentMode: Submission["paymentMode"];
  transactionNumber: string;
};

function mapRowToSubmission(row: SubmissionRow): Submission {
  return {
    id: row.id,
    submittedAt: row.submitted_at,
    status: row.status,
    affiliationType: row.affiliation_type,
    title: row.title,
    firstName: row.first_name,
    middleName: row.middle_name,
    surname: row.surname,
    congregation: row.congregation,
    email: row.email,
    mobile: row.mobile,
    completeAddress: row.complete_address,
    shirtSize: row.shirt_size,
    organizationName: row.organization_name,
    archdiocese: row.archdiocese,
    archdioceseOther: row.archdiocese_other ?? "",
    parishName: row.parish_name,
    parishAddress: row.parish_address,
    roleInMinistry: row.role_in_ministry,
    roleInMinistryOther: row.role_in_ministry_other,
    province: row.province,
    schoolName: row.school_name,
    schoolAddress: row.school_address,
    designation: row.designation,
    designationOther: row.designation_other,
    companyOrganization: row.company_organization,
    companyAddress: row.company_address,
    positionDesignation: row.position_designation,
    day1Session: row.day1_session,
    day2Session: row.day2_session,
    accommodation: row.accommodation,
    paymentMode: row.payment_mode,
    transactionNumber: row.transaction_number ?? "",
    idUploadName: row.id_upload_name,
    paymentProofName: row.payment_proof_name,
    idUploadPath: row.id_upload_path ?? undefined,
    paymentProofPath: row.payment_proof_path ?? undefined,
  };
}

function buildStoragePath(
  submissionId: string,
  kind: "id-upload" | "payment-proof",
  fileName: string,
) {
  const safeName = fileName.trim().replace(/[^a-zA-Z0-9._-]+/g, "-");
  return `submissions/${submissionId}/${kind}/${randomUUID()}-${safeName}`;
}

export type BreakoutSessionCounts = {
  day1Counts: Record<string, number>;
  day2Counts: Record<string, number>;
  limit: number;
  accommodationCount: number;
  accommodationLimit: number;
};

function buildInitialCounts(options: ReadonlyArray<{ value: string }>) {
  return Object.fromEntries(options.map((option) => [option.value, 0]));
}

function incrementCount(counts: Record<string, number>, key?: string | null) {
  if (!key) {
    return;
  }

  if (counts[key] === undefined) {
    counts[key] = 1;
    return;
  }

  counts[key] += 1;
}

export async function getBreakoutSessionCounts(): Promise<BreakoutSessionCounts> {
  const day1Counts = buildInitialCounts(day1Options);
  const day2Counts = buildInitialCounts(day2Options);
  let accommodationCount = 0;

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    mockSubmissions.forEach((submission) => {
      incrementCount(day1Counts, submission.day1Session);
      incrementCount(day2Counts, submission.day2Session);
      if (submission.accommodation === "avail") {
        accommodationCount += 1;
      }
    });

    return {
      day1Counts,
      day2Counts,
      limit: SESSION_CAP,
      accommodationCount,
      accommodationLimit: ACCOMMODATION_CAP,
    };
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("day1_session, day2_session, accommodation");

  if (error) {
    throw new Error(error.message);
  }

  (data ?? []).forEach((row) => {
    const record = row as {
      day1_session?: string | null;
      day2_session?: string | null;
      accommodation?: Submission["accommodation"] | null;
    };
    incrementCount(day1Counts, record.day1_session ?? undefined);
    incrementCount(day2Counts, record.day2_session ?? undefined);
    if (record.accommodation === "avail") {
      accommodationCount += 1;
    }
  });

  console.log("Day 1 Counts: ", day1Counts);
  console.log("Day 2 Counts: ", day2Counts);
  console.log("Session Cap: ", SESSION_CAP);

  return {
    day1Counts,
    day2Counts,
    limit: SESSION_CAP,
    accommodationCount,
    accommodationLimit: ACCOMMODATION_CAP,
  };
}

export async function createSubmissionCsv(submissions: Submission[]) {
  const header = [
    "ID",
    "Submitted At",
    "Status",
    "Title",
    "First Name",
    "Middle Name",
    "Surname",
    "Congregation",
    "Email",
    "Mobile",
    "Complete Address",
    "Shirt Size",
    "Affiliation",
    "Organization",
    "Archdiocese",
    "Archdiocese (Other)",
    "Parish name",
    "Parish address",
    "Role in ministry",
    "Role in ministry (Other)",
    "Province",
    "School name",
    "School address",
    "Designation",
    "Designation (Other)",
    "Company / Organization",
    "Company address",
    "Position / Designation",
    "Day 1 Session",
    "Day 2 Session",
    "Accommodation",
    "Payment Mode",
    "Transaction Number",
    "ID upload URL",
    "Payment proof URL",
  ];

  const rows = await Promise.all(
    submissions.map(async (submission) => {
      const idUploadUrl = await getSubmissionFileUrl(submission.idUploadPath);
      const paymentProofUrl = await getSubmissionFileUrl(submission.paymentProofPath);

      return [
        submission.id,
        new Intl.DateTimeFormat("sv-SE", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
          timeZone: "Asia/Manila",
        }).format(new Date(submission.submittedAt)),
        submission.status,
        submission.title,
        submission.firstName,
        submission.middleName,
        submission.surname,
        submission.congregation,
        submission.email,
        submission.mobile,
        submission.completeAddress,
        submission.shirtSize,
        getAffiliationLabel(submission.affiliationType),
        getSubmissionOrganization(submission),
        // Parish-specific
        submission.affiliationType === "parish" ? submission.archdiocese : "",
        submission.affiliationType === "parish" ? submission.archdioceseOther : "",
        submission.affiliationType === "parish" ? submission.parishName : "",
        submission.affiliationType === "parish" ? submission.parishAddress : "",
        submission.affiliationType === "parish" ? submission.roleInMinistry : "",
        submission.affiliationType === "parish" ? submission.roleInMinistryOther : "",
        // School-specific
        submission.affiliationType === "school" ? submission.province : "",
        submission.affiliationType === "school" ? submission.schoolName : "",
        submission.affiliationType === "school" ? submission.schoolAddress : "",
        submission.affiliationType === "school" ? submission.designation : "",
        submission.affiliationType === "school" ? submission.designationOther : "",
        // Neither / Company
        submission.affiliationType === "neither" ? submission.companyOrganization : "",
        submission.affiliationType === "neither" ? submission.companyAddress : "",
        submission.affiliationType === "neither" ? submission.positionDesignation : "",
        submission.day1Session,
        submission.day2Session,
        submission.accommodation,
        submission.paymentMode,
        submission.transactionNumber,
        idUploadUrl || submission.idUploadName || "",
        paymentProofUrl || submission.paymentProofName || "",
      ];
    }),
  );

  return [header, ...rows]
    .map((row) => row.map((value) => `"${String(value ?? "").replace(/"/g, '""')}"`).join(","))
    .join("\n");
}

export async function listSubmissions() {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return mockSubmissions;
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .order("submitted_at", { ascending: false });

  if (error) {
    throw new Error(error.message);
  }

  return (data ?? []).map((row) => mapRowToSubmission(row as SubmissionRow));
}

export async function getSubmissionById(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return mockSubmissions.find((submission) => submission.id === id) ?? null;
  }

  const { data, error } = await supabase
    .from("submissions")
    .select("*")
    .eq("id", id)
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToSubmission(data as SubmissionRow) : null;
}

export async function getSubmissionFileUrl(storagePath?: string) {
  if (!storagePath) {
    return null;
  }

  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    return storagePath;
  }

  return supabase.storage.from(getStorageBucketName()).getPublicUrl(storagePath)
    .data.publicUrl;
}

export async function createRegistrationSubmission(
  input: RegistrationSubmissionInput,
  files: {
    idUpload: File;
    paymentProof: File;
  },
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    throw new Error("Supabase is not configured.");
  }

  const submissionId = randomUUID();
  const bucketName = getStorageBucketName();
  const idUploadPath = buildStoragePath(
    submissionId,
    "id-upload",
    files.idUpload.name,
  );
  const paymentProofPath = buildStoragePath(
    submissionId,
    "payment-proof",
    files.paymentProof.name,
  );

  const [idUploadResult, paymentProofResult] = await Promise.all([
    supabase.storage.from(bucketName).upload(idUploadPath, files.idUpload, {
      contentType: files.idUpload.type,
      upsert: false,
    }),
    supabase.storage
      .from(bucketName)
      .upload(paymentProofPath, files.paymentProof, {
        contentType: files.paymentProof.type,
        upsert: false,
      }),
  ]);

  if (idUploadResult.error) {
    throw new Error(idUploadResult.error.message);
  }

  if (paymentProofResult.error) {
    throw new Error(paymentProofResult.error.message);
  }

  const row = {
    id: submissionId,
    submitted_at: new Date().toISOString(),
    status: "Pending" as const,
    affiliation_type: input.affiliationType,
    title: input.title,
    first_name: input.firstName,
    middle_name: input.middleName,
    surname: input.surname,
    congregation: input.congregation,
    email: input.email,
    mobile: input.mobile,
    complete_address: input.completeAddress,
    shirt_size: input.shirtSize,
    organization_name: input.organizationName,
    archdiocese: input.archdiocese,
    archdiocese_other: input.archdioceseOther,
    parish_name: input.parishName,
    parish_address: input.parishAddress,
    role_in_ministry: input.roleInMinistry,
    role_in_ministry_other: input.roleInMinistryOther,
    province: input.province,
    school_name: input.schoolName,
    school_address: input.schoolAddress,
    designation: input.designation,
    designation_other: input.designationOther,
    company_organization: input.companyOrganization,
    company_address: input.companyAddress,
    position_designation: input.positionDesignation,
    day1_session: input.day1Session,
    day2_session: input.day2Session,
    accommodation: input.accommodation,
    payment_mode: input.paymentMode,
    transaction_number: input.transactionNumber,
    id_upload_name: files.idUpload.name,
    payment_proof_name: files.paymentProof.name,
    id_upload_path: idUploadPath,
    payment_proof_path: paymentProofPath,
  } satisfies Partial<SubmissionRow>;

  const { data, error } = await supabase
    .from("submissions")
    .insert(row)
    .select("*")
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return mapRowToSubmission(data as SubmissionRow);
}

export async function deleteSubmission(id: string) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const idx = mockSubmissions.findIndex((s) => s.id === id);
    if (idx !== -1) mockSubmissions.splice(idx, 1);
    return;
  }

  const { data } = await supabase
    .from("submissions")
    .select("id_upload_path, payment_proof_path")
    .eq("id", id)
    .maybeSingle();

  if (data) {
    const paths = [
      (data as { id_upload_path?: string | null }).id_upload_path,
      (data as { payment_proof_path?: string | null }).payment_proof_path,
    ].filter(Boolean) as string[];

    if (paths.length > 0) {
      await supabase.storage.from(getStorageBucketName()).remove(paths);
    }
  }

  const { error } = await supabase.from("submissions").delete().eq("id", id);

  if (error) {
    throw new Error(error.message);
  }
}

export async function updateSubmissionStatus(
  id: string,
  status: SubmissionStatus,
) {
  const cookieStore = await cookies();
  const supabase = createClient(cookieStore);

  if (!supabase) {
    const submission = mockSubmissions.find((item) => item.id === id);

    if (!submission) {
      return null;
    }

    submission.status = status;
    return submission;
  }

  const { data, error } = await supabase
    .from("submissions")
    .update({ status })
    .eq("id", id)
    .select("*")
    .maybeSingle();

  if (error) {
    throw new Error(error.message);
  }

  return data ? mapRowToSubmission(data as SubmissionRow) : null;
}
