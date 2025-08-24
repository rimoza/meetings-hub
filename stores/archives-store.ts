import { create } from "zustand";
import type { Archive, ArchiveFilters } from "@/types/archive";

interface ArchivesStore {
  // State
  archives: Archive[];
  filteredArchives: Archive[];
  isLoading: boolean;
  error: string | null;
  filters: ArchiveFilters;

  // Actions
  setArchives: (archives: Archive[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: ArchiveFilters) => void;
  addArchive: (archive: Archive) => void;
  updateArchive: (id: string, updates: Partial<Archive>) => void;
  removeArchive: (id: string) => void;

  // Computed getters
  getActiveArchives: () => Archive[];
  getArchivedArchives: () => Archive[];
  getDraftArchives: () => Archive[];
}

const applyFilters = (
  archives: Archive[],
  filters: ArchiveFilters,
): Archive[] => {
  return archives.filter((archive) => {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch =
        archive.title.toLowerCase().includes(searchLower) ||
        archive.id.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Status filter
    if (filters.status !== "all" && archive.status !== filters.status) return false;

    // Labels filter
    if (filters.labels.length > 0) {
      const hasMatchingLabel = filters.labels.some(label => 
        archive.labels.includes(label)
      );
      if (!hasMatchingLabel) return false;
    }

    return true;
  });
};

export const useArchivesStore = create<ArchivesStore>((set, get) => ({
  // Initial state
  archives: [],
  filteredArchives: [],
  isLoading: true,
  error: null,
  filters: {
    search: "",
    status: "all",
    labels: [],
  },

  // Actions
  setArchives: (archives) => {
    const { filters } = get();
    
    // Deduplicate archives by ID to prevent duplicate key errors
    const uniqueArchives = archives.reduce((acc, archive) => {
      const existingIndex = acc.findIndex(a => a.id === archive.id);
      if (existingIndex >= 0) {
        // Replace with newer version (based on updatedAt)
        if (archive.updatedAt >= acc[existingIndex].updatedAt) {
          acc[existingIndex] = archive;
        }
      } else {
        acc.push(archive);
      }
      return acc;
    }, [] as Archive[]);
    
    const filteredArchives = applyFilters(uniqueArchives, filters);
    set({ archives: uniqueArchives, filteredArchives, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    const { archives } = get();
    const filteredArchives = applyFilters(archives, filters);
    set({ filters, filteredArchives });
  },

  addArchive: (archive) => {
    const { archives, filters } = get();
    const newArchives = [...archives, archive];
    const filteredArchives = applyFilters(newArchives, filters);
    set({ archives: newArchives, filteredArchives });
  },

  updateArchive: (id, updates) => {
    const { archives, filters } = get();
    const newArchives = archives.map((archive) =>
      archive.id === id ? { ...archive, ...updates } : archive,
    );
    const filteredArchives = applyFilters(newArchives, filters);
    set({ archives: newArchives, filteredArchives });
  },

  removeArchive: (id) => {
    const { archives, filters } = get();
    const newArchives = archives.filter((archive) => archive.id !== id);
    const filteredArchives = applyFilters(newArchives, filters);
    set({ archives: newArchives, filteredArchives });
  },

  // Computed getters
  getActiveArchives: () => {
    const { archives } = get();
    return archives.filter((archive) => archive.status === "active");
  },

  getArchivedArchives: () => {
    const { archives } = get();
    return archives.filter((archive) => archive.status === "archived");
  },

  getDraftArchives: () => {
    const { archives } = get();
    return archives.filter((archive) => archive.status === "draft");
  },
}));