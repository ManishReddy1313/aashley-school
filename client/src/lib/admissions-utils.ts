export const ADMISSION_STATUSES = [
  "new_enquiry",
  "contacted",
  "visit_scheduled",
  "visit_done",
  "documents_pending",
  "admitted",
  "not_interested",
] as const;

export type AdmissionStatus = (typeof ADMISSION_STATUSES)[number];

export const STATUS_LABELS: Record<AdmissionStatus, string> = {
  new_enquiry: "New Enquiry",
  contacted: "Contacted",
  visit_scheduled: "Visit Scheduled",
  visit_done: "Visit Done",
  documents_pending: "Docs Pending",
  admitted: "Admitted",
  not_interested: "Not Interested",
};

export const STATUS_COLORS: Record<AdmissionStatus, string> = {
  new_enquiry: "bg-primary/8 text-primary border-primary/20",
  contacted: "bg-primary/5 text-primary border-primary/20",
  visit_scheduled: "bg-gold/10 text-gold-dark border-gold/30",
  visit_done: "bg-gold/10 text-gold-dark border-gold/30",
  documents_pending: "bg-primary/5 text-primary border-primary/20",
  admitted: "bg-emerald-50 text-emerald-700 border-emerald-200",
  not_interested: "bg-destructive/5 text-destructive border-destructive/20",
};

export const STATUS_NEXT_STEPS: Record<AdmissionStatus, AdmissionStatus[]> = {
  new_enquiry: ["contacted", "not_interested"],
  contacted: ["visit_scheduled", "not_interested"],
  visit_scheduled: ["visit_done", "not_interested"],
  visit_done: ["documents_pending", "not_interested"],
  documents_pending: ["admitted", "not_interested"],
  admitted: [],
  not_interested: ["new_enquiry"],
};

export const SOURCE_LABELS: Record<string, string> = {
  website: "Website",
  walkin: "Walk-in",
  referral: "Referral",
  phone: "Phone Call",
};

export const PIPELINE_STEPS: AdmissionStatus[] = [
  "new_enquiry",
  "contacted",
  "visit_scheduled",
  "visit_done",
  "documents_pending",
  "admitted",
];

export const GRADE_OPTIONS = [
  "Nursery",
  "LKG",
  "UKG",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
] as const;
