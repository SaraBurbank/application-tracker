export type ApplicationStatus = 'Applied' | 'Interviewing' | 'Offer' | 'Rejected';

export interface Application {
  _id?: string; // optional because it doesn't exist yet on create
  company: string;
  role: string;
  status: ApplicationStatus;
  dateApplied?: string;
  link?: string;
  resumeUsed?: string;
  salaryRange?: string;
  notes?: string;
  order?: number;
  createdAt?: string;
  updatedAt?: string;
}