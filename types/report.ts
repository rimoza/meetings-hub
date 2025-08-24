export interface Report {
  id: string;
  title: string;
  description: string;
  file?: {
    name: string;
    url: string;
    size: number;
    type: string;
  };
  createdBy: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ReportFilters {
  search: string;
  createdBy: string;
}

export type ReportFormData = Omit<Report, "id" | "createdAt" | "updatedAt">;