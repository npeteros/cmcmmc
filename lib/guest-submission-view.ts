import {
  getAffiliationLabel,
  getSubmissionDisplayName,
  getSubmissionOrganization,
  type Submission,
} from "@/lib/admin-submissions";

export type GuestRegistrationView = {
  displayName: string;
  affiliationLabel: string;
  organization: string;
  day1Session: string;
  day2Session: string;
  accommodation: Submission["accommodation"];
  shirtSize: string;
  confirmed: boolean;
  dayOneAttendance: string | null;
  dayTwoAttendance: string | null;
  dayOneBreakoutAttendance: string | null;
  dayTwoBreakoutAttendance: string | null;
  kitReceived: boolean;
};

export function toGuestView(submission: Submission): GuestRegistrationView {
  return {
    displayName: getSubmissionDisplayName(submission),
    affiliationLabel: getAffiliationLabel(submission.affiliationType),
    organization: getSubmissionOrganization(submission),
    day1Session: submission.day1Session,
    day2Session: submission.day2Session,
    accommodation: submission.accommodation,
    shirtSize: submission.shirtSize,
    confirmed: submission.status === "Verified",
    dayOneAttendance: submission.dayOneAttendance,
    dayTwoAttendance: submission.dayTwoAttendance,
    dayOneBreakoutAttendance: submission.dayOneBreakoutAttendance,
    dayTwoBreakoutAttendance: submission.dayTwoBreakoutAttendance,
    kitReceived: submission.kitReceived,
  };
}
