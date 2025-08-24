export interface Archive {
  id: string; // Format: xxx-01, xxx-02 where xxx is three letters
  title: string;
  date: string;
  status: "active" | "archived" | "draft";
  labels: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ArchiveFilters {
  search: string;
  status: "all" | "active" | "archived" | "draft";
  labels: string[];
}

export type ArchiveStatus = "active" | "archived" | "draft";