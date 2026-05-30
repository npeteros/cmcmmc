import "server-only";

import { randomUUID } from "crypto";

import {
  buildSubmissionCsv,
  mockSubmissions,
  type Submission,
  type SubmissionStatus,
} from "@/lib/admin-submissions";
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
  id_upload_name: string;
  payment_proof_name: string;
  id_upload_path: string | null;
  payment_proof_path: string | null;
};

export type RegistrationSubmissionInput = {
  affiliationType: Submission["affiliationType"];
  archdiocese: string;
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

export function createSubmissionCsv(submissions: Submission[]) {
  return buildSubmissionCsv(submissions);
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
