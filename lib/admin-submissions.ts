export const SUBMISSION_STATUSES = ["Pending", "Verified", "Needs review"] as const;

export type SubmissionStatus = (typeof SUBMISSION_STATUSES)[number];

export type Submission = {
  id: string;
  submittedAt: string;
  status: SubmissionStatus;
  affiliationType: "parish" | "school" | "neither";
  title: string;
  firstName: string;
  middleName: string;
  surname: string;
  congregation: string;
  email: string;
  mobile: string;
  completeAddress: string;
  shirtSize: string;
  organizationName: string;
  archdiocese: string;
  parishName: string;
  parishAddress: string;
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
  day1Session: string;
  day2Session: string;
  accommodation: "avail" | "self";
  paymentMode: "GCash" | "BDO";
  idUploadName: string;
  paymentProofName: string;
  idUploadPath?: string;
  paymentProofPath?: string;
};

export const mockSubmissions: Submission[] = [
  {
    id: "CMC-001",
    submittedAt: "2026-05-28T09:20:00+08:00",
    status: "Verified",
    affiliationType: "parish",
    title: "Rev. Fr.",
    firstName: "Albert",
    middleName: "Santos",
    surname: "Garong",
    congregation: "SSP",
    email: "albert.garong@example.com",
    mobile: "09171234567",
    completeAddress: "Archdiocese of Cebu, Cebu City",
    shirtSize: "XL",
    organizationName: "Diocesan Media Ministry",
    archdiocese: "Archdiocese of Cebu",
    parishName: "Saint Joseph Parish",
    parishAddress: "Cebu City",
    roleInMinistry: "Spiritual Director",
    roleInMinistryOther: "",
    province: "",
    schoolName: "",
    schoolAddress: "",
    designation: "",
    designationOther: "",
    companyOrganization: "",
    companyAddress: "",
    positionDesignation: "",
    day1Session: "day1-audio",
    day2Session: "day2-production",
    accommodation: "avail",
    paymentMode: "GCash",
    idUploadName: "albert-garong-id.pdf",
    paymentProofName: "gcash-receipt-albert.pdf",
  },
  {
    id: "CMC-002",
    submittedAt: "2026-05-28T11:45:00+08:00",
    status: "Pending",
    affiliationType: "school",
    title: "Ms.",
    firstName: "April",
    middleName: "Frances",
    surname: "Ortigas",
    congregation: "",
    email: "april.ortigas@example.com",
    mobile: "+639171234568",
    completeAddress: "University of San Carlos, Cebu City",
    shirtSize: "M",
    organizationName: "",
    archdiocese: "",
    parishName: "",
    parishAddress: "",
    roleInMinistry: "",
    roleInMinistryOther: "",
    province: "Cebu",
    schoolName: "University of San Carlos",
    schoolAddress: "Talamban Campus, Cebu City",
    designation: "Graphic Artist",
    designationOther: "",
    companyOrganization: "",
    companyAddress: "",
    positionDesignation: "",
    day1Session: "day1-writing",
    day2Session: "day2-graphics",
    accommodation: "self",
    paymentMode: "BDO",
    idUploadName: "april-ortigas-id.png",
    paymentProofName: "bdo-transfer-april.png",
  },
  {
    id: "CMC-003",
    submittedAt: "2026-05-29T14:05:00+08:00",
    status: "Needs review",
    affiliationType: "neither",
    title: "Mr.",
    firstName: "Aubry",
    middleName: "",
    surname: "Lerio",
    congregation: "",
    email: "aubry.lerio@example.com",
    mobile: "09171234569",
    completeAddress: "Mandaue City",
    shirtSize: "L",
    organizationName: "",
    archdiocese: "",
    parishName: "",
    parishAddress: "",
    roleInMinistry: "",
    roleInMinistryOther: "",
    province: "",
    schoolName: "",
    schoolAddress: "",
    designation: "",
    designationOther: "",
    companyOrganization: "Catholic Media Studio",
    companyAddress: "Mandaue City",
    positionDesignation: "Producer",
    day1Session: "day1-video",
    day2Session: "day2-cognitive",
    accommodation: "avail",
    paymentMode: "GCash",
    idUploadName: "aubry-lerio-id.webp",
    paymentProofName: "gcash-proof-aubry.pdf",
  },
];

export function formatSubmissionDate(isoDate: string) {
  return new Intl.DateTimeFormat("en-US", {
    dateStyle: "medium",
    timeStyle: "short",
    timeZone: "Asia/Manila",
  }).format(new Date(isoDate));
}

export function getSubmissionDisplayName(submission: Submission) {
  return [submission.title, submission.firstName, submission.middleName, submission.surname]
    .filter(Boolean)
    .join(" ");
}

export function getSubmissionOrganization(submission: Submission) {
  if (submission.affiliationType === "parish") {
    return submission.organizationName || submission.parishName || "Parish submission";
  }

  if (submission.affiliationType === "school") {
    return submission.schoolName || submission.province || "School submission";
  }

  return submission.companyOrganization || submission.positionDesignation || "Independent submission";
}

export function getAffiliationLabel(affiliationType: Submission["affiliationType"]) {
  switch (affiliationType) {
    case "parish":
      return "Parish";
    case "school":
      return "School";
    default:
      return "Unaffiliated";
  }
}

export function buildSubmissionCsv(submissions: Submission[]) {
  const header = [
    "ID",
    "Submitted At",
    "Status",
    "Name",
    "Affiliation",
    "Organization",
    "Email",
    "Mobile",
    "Day 1 Session",
    "Day 2 Session",
    "Accommodation",
    "Payment Mode",
  ];

  const rows = submissions.map((submission) => [
    submission.id,
    formatSubmissionDate(submission.submittedAt),
    submission.status,
    getSubmissionDisplayName(submission),
    getAffiliationLabel(submission.affiliationType),
    getSubmissionOrganization(submission),
    submission.email,
    submission.mobile,
    submission.day1Session,
    submission.day2Session,
    submission.accommodation,
    submission.paymentMode,
  ]);

  return [header, ...rows]
    .map((row) => row.map((value) => `"${String(value).replace(/"/g, '""')}"`).join(","))
    .join("\n");
}