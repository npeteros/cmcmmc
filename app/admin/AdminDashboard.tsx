"use client";

import { useMemo, useState } from "react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import DeleteSubmissionButton from "./DeleteSubmissionButton";
import {
  formatSubmissionDate,
  getAffiliationLabel,
  getSubmissionDisplayName,
  getSubmissionOrganization,
  type Submission,
} from "@/lib/admin-submissions";

type FilterValue = "all" | Submission["affiliationType"];
type PaymentFilterValue = "all" | Submission["paymentMode"];
type SortKey = "name" | "affiliation" | "organization" | "payment" | "status" | "submitted";
type SortDir = "asc" | "desc";

function StatCard({ label, value, hint }: { label: string; value: string; hint: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-semibold text-[#1a2e5a]">{value}</p>
      <p className="mt-2 text-sm text-slate-500">{hint}</p>
    </div>
  );
}

function StatusPill({ status }: { status: Submission["status"] }) {
  const tone =
    status === "Verified"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700"
      : status === "Needs review"
        ? "border-amber-200 bg-amber-50 text-amber-700"
        : "border-slate-200 bg-slate-100 text-slate-600";

  return <span className={`inline-flex rounded-full border px-2.5 py-1 text-xs font-semibold ${tone}`}>{status}</span>;
}

function SortableHeader({
  label,
  sortKey,
  active,
  dir,
  onSort,
}: {
  label: string;
  sortKey: SortKey;
  active: SortKey;
  dir: SortDir;
  onSort: (key: SortKey) => void;
}) {
  const isActive = active === sortKey;
  return (
    <th
      className="cursor-pointer select-none px-4 py-3"
      onClick={() => onSort(sortKey)}
    >
      <span className="inline-flex items-center gap-1">
        {label}
        <span className="text-slate-400">
          {isActive ? (dir === "asc" ? "↑" : "↓") : <span className="opacity-30">↕</span>}
        </span>
      </span>
    </th>
  );
}

const STATUS_ORDER: Record<Submission["status"], number> = { Verified: 0, "Needs review": 1, Pending: 2 };

export default function AdminDashboard({ submissions }: { submissions: Submission[] }) {
  const [query, setQuery] = useState("");
  const [affiliation, setAffiliation] = useState<FilterValue>("all");
  const [paymentMode, setPaymentMode] = useState<PaymentFilterValue>("all");
  const [sortKey, setSortKey] = useState<SortKey>("submitted");
  const [sortDir, setSortDir] = useState<SortDir>("desc");

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    } else {
      setSortKey(key);
      setSortDir("asc");
    }
  }

  const filteredSubmissions = useMemo(() => {
    const normalizedQuery = query.trim().toLowerCase();

    const filtered = submissions.filter((submission) => {
      const searchableText = [
        submission.id,
        getSubmissionDisplayName(submission),
        submission.email,
        submission.mobile,
        getSubmissionOrganization(submission),
        submission.day1Session,
        submission.day2Session,
      ]
        .join(" ")
        .toLowerCase();

      const matchesQuery = normalizedQuery.length === 0 || searchableText.includes(normalizedQuery);
      const matchesAffiliation = affiliation === "all" || submission.affiliationType === affiliation;
      const matchesPayment = paymentMode === "all" || submission.paymentMode === paymentMode;

      return matchesQuery && matchesAffiliation && matchesPayment;
    });

    filtered.sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "name":
          cmp = `${a.surname} ${a.firstName}`.localeCompare(`${b.surname} ${b.firstName}`);
          break;
        case "affiliation":
          cmp = a.affiliationType.localeCompare(b.affiliationType);
          break;
        case "organization":
          cmp = getSubmissionOrganization(a).localeCompare(getSubmissionOrganization(b));
          break;
        case "payment":
          cmp = a.paymentMode.localeCompare(b.paymentMode);
          break;
        case "status":
          cmp = STATUS_ORDER[a.status] - STATUS_ORDER[b.status];
          break;
        case "submitted":
          cmp = a.submittedAt.localeCompare(b.submittedAt);
          break;
      }
      return sortDir === "asc" ? cmp : -cmp;
    });

    return filtered;
  }, [affiliation, paymentMode, query, sortDir, sortKey, submissions]);

  const summary = useMemo(() => {
    const total = submissions.length;
    const verified = submissions.filter((submission) => submission.status === "Verified").length;
    const pending = submissions.filter((submission) => submission.status === "Pending").length;
    const accommodationRequests = submissions.filter((submission) => submission.accommodation === "avail").length;

    return { total, verified, pending, accommodationRequests };
  }, [submissions]);

  return (
    <div className="space-y-8">
      <section className="grid gap-4 md:grid-cols-4">
        <StatCard label="Total submissions" value={String(summary.total)} hint="All records currently in the dashboard" />
        <StatCard label="Verified" value={String(summary.verified)} hint="Payments or records already cleared" />
        <StatCard label="Pending" value={String(summary.pending)} hint="Awaiting review or confirmation" />
        <StatCard
          label="Accommodation requests"
          value={String(summary.accommodationRequests)}
          hint="Participants requesting the free accommodation"
        />
      </section>

      <section className="rounded-[2rem] border border-slate-200 bg-white p-5 shadow-sm md:p-6">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-2xl">
            <p className="text-xs font-semibold uppercase tracking-[0.3em] text-[#2aadb5]">Submissions</p>
            <h2 className="mt-2 text-2xl font-semibold text-[#1a2e5a]">Review registration records</h2>
            <p className="mt-2 text-sm text-slate-600">
              Search the current submissions, filter by affiliation or payment mode, and jump into a detail view for a full record.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button asChild variant="outline">
              <Link href="/admin/export">Export CSV</Link>
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-3 lg:grid-cols-[1.4fr_0.8fr_0.8fr]">
          <Input
            placeholder="Search by name, email, organization, or submission ID"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
          />
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={affiliation}
            onChange={(event) => setAffiliation(event.target.value as FilterValue)}
          >
            <option value="all">All affiliations</option>
            <option value="parish">Parish</option>
            <option value="school">School</option>
            <option value="neither">Neither</option>
          </select>
          <select
            className="h-10 rounded-md border border-input bg-background px-3 text-sm ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            value={paymentMode}
            onChange={(event) => setPaymentMode(event.target.value as PaymentFilterValue)}
          >
            <option value="all">All payment modes</option>
            <option value="GCash">GCash</option>
            <option value="BDO">BDO</option>
          </select>
        </div>

        <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-[0.2em] text-slate-500">
                <tr>
                  <SortableHeader label="Submission" sortKey="name" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Affiliation" sortKey="affiliation" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Organization" sortKey="organization" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Payment" sortKey="payment" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Status" sortKey="status" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <SortableHeader label="Submitted" sortKey="submitted" active={sortKey} dir={sortDir} onSort={handleSort} />
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 bg-white">
                {filteredSubmissions.length > 0 ? (
                  filteredSubmissions.map((submission) => (
                    <tr key={submission.id} className="align-top">
                      <td className="px-4 py-4">
                        <div className="font-semibold text-[#1a2e5a]">{getSubmissionDisplayName(submission)}</div>
                        <div className="mt-1 text-xs text-slate-500">{submission.id}</div>
                        <div className="mt-1 text-xs text-slate-500">{submission.email}</div>
                      </td>
                      <td className="px-4 py-4 text-slate-600">{getAffiliationLabel(submission.affiliationType)}</td>
                      <td className="px-4 py-4 text-slate-600">{getSubmissionOrganization(submission)}</td>
                      <td className="px-4 py-4 text-slate-600">{submission.paymentMode}</td>
                      <td className="px-4 py-4"><StatusPill status={submission.status} /></td>
                      <td className="px-4 py-4 text-slate-600">{formatSubmissionDate(submission.submittedAt)}</td>
                      <td className="px-4 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Button asChild variant="ghost" size="sm">
                            <Link href={`/admin/submissions/${encodeURIComponent(submission.id)}`}>View</Link>
                          </Button>
                          <DeleteSubmissionButton submissionId={submission.id} />
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="px-4 py-10 text-center text-sm text-slate-500" colSpan={7}>
                      No submissions match the current filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </section>
    </div>
  );
}