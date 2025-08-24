import { create } from "zustand";
import type { Report, ReportFilters } from "@/types/report";

interface ReportsStore {
  // State
  reports: Report[];
  filteredReports: Report[];
  isLoading: boolean;
  error: string | null;
  filters: ReportFilters;

  // Actions
  setReports: (reports: Report[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: ReportFilters) => void;
  addReport: (report: Report) => void;
  updateReport: (id: string, updates: Partial<Report>) => void;
  removeReport: (id: string) => void;
}

const applyFilters = (
  reports: Report[],
  filters: ReportFilters,
): Report[] => {
  return reports.filter((report) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        report.title.toLowerCase().includes(searchLower) ||
        report.description.toLowerCase().includes(searchLower) ||
        report.createdBy.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Created by filter
    if (filters.createdBy && filters.createdBy !== "all") {
      if (report.createdBy !== filters.createdBy) return false;
    }

    return true;
  });
};

export const useReportsStore = create<ReportsStore>((set, get) => ({
  // Initial state
  reports: [],
  filteredReports: [],
  isLoading: true,
  error: null,
  filters: {
    search: "",
    createdBy: "all",
  },

  // Actions
  setReports: (reports) => {
    const { filters } = get();
    const filteredReports = applyFilters(reports, filters);
    set({ reports, filteredReports, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    const { reports } = get();
    const filteredReports = applyFilters(reports, filters);
    set({ filters, filteredReports });
  },

  addReport: (report) => {
    const { reports, filters } = get();
    const newReports = [...reports, report];
    const filteredReports = applyFilters(newReports, filters);
    set({ reports: newReports, filteredReports });
  },

  updateReport: (id, updates) => {
    const { reports, filters } = get();
    const newReports = reports.map((report) =>
      report.id === id ? { ...report, ...updates } : report,
    );
    const filteredReports = applyFilters(newReports, filters);
    set({ reports: newReports, filteredReports });
  },

  removeReport: (id) => {
    const { reports, filters } = get();
    const newReports = reports.filter((report) => report.id !== id);
    const filteredReports = applyFilters(newReports, filters);
    set({ reports: newReports, filteredReports });
  },
}));