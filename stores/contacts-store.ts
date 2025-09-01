import { create } from "zustand";
import type { Contact, ContactFilters } from "@/types/contact";

interface ContactsStore {
  // State
  contacts: Contact[];
  filteredContacts: Contact[];
  isLoading: boolean;
  error: string | null;
  filters: ContactFilters;

  // Actions
  setContacts: (contacts: Contact[]) => void;
  setLoading: (loading: boolean) => void;
  setError: (error: string | null) => void;
  setFilters: (filters: ContactFilters) => void;
  addContact: (contact: Contact) => void;
  updateContact: (id: string, updates: Partial<Contact>) => void;
  removeContact: (id: string) => void;

  // Computed getters
  getFavoriteContacts: () => Contact[];
  getImportantContacts: () => Contact[];
  getContactsByCompany: (company: string) => Contact[];
  getContactsByLocation: (location: string) => Contact[];
}

const applyFilters = (
  contacts: Contact[],
  filters: ContactFilters,
): Contact[] => {
  return contacts.filter((contact) => {
    // Search filter - search in name, email, phone, company, and location
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      const fullName = `${contact.title || ""} ${contact.firstName} ${contact.lastName}`.toLowerCase();
      const matchesSearch =
        fullName.includes(searchLower) ||
        contact.email?.toLowerCase().includes(searchLower) ||
        contact.phone.includes(searchLower) ||
        contact.alternativePhone?.includes(searchLower) ||
        contact.company?.toLowerCase().includes(searchLower) ||
        contact.jobTitle?.toLowerCase().includes(searchLower) ||
        contact.location.toLowerCase().includes(searchLower) ||
        contact.city?.toLowerCase().includes(searchLower) ||
        contact.country?.toLowerCase().includes(searchLower);
      if (!matchesSearch) return false;
    }

    // Tags filter
    if (filters.tags.length > 0) {
      const hasMatchingTag = filters.tags.some(tag =>
        contact.tags?.includes(tag)
      );
      if (!hasMatchingTag) return false;
    }

    // Important filter
    if (filters.important !== "all" && contact.important !== filters.important) {
      return false;
    }

    // Favorite filter
    if (filters.favorite !== "all" && contact.favorite !== filters.favorite) {
      return false;
    }

    // Category filter
    const contactCategory = contact.category || "personal"; // Default to "personal" if not set
    if (filters.category !== "all" && contactCategory !== filters.category) {
      return false;
    }

    // Company filter
    if (filters.company && contact.company !== filters.company) {
      return false;
    }

    // Location filter
    if (filters.location && !contact.location.toLowerCase().includes(filters.location.toLowerCase())) {
      return false;
    }

    return true;
  });
};

export const useContactsStore = create<ContactsStore>((set, get) => ({
  // Initial state
  contacts: [],
  filteredContacts: [],
  isLoading: true,
  error: null,
  filters: {
    search: "",
    tags: [],
    category: "all",
    important: "all",
    favorite: "all",
  },

  // Actions
  setContacts: (contacts) => {
    const { filters } = get();
    
    // Deduplicate contacts by ID to prevent duplicate key errors
    const uniqueContacts = contacts.reduce((acc, contact) => {
      const existingIndex = acc.findIndex(c => c.id === contact.id);
      if (existingIndex >= 0) {
        // Replace with newer version (based on updatedAt)
        if (contact.updatedAt >= acc[existingIndex].updatedAt) {
          acc[existingIndex] = contact;
        }
      } else {
        acc.push(contact);
      }
      return acc;
    }, [] as Contact[]);
    
    const filteredContacts = applyFilters(uniqueContacts, filters);
    set({ contacts: uniqueContacts, filteredContacts, isLoading: false });
  },

  setLoading: (isLoading) => set({ isLoading }),

  setError: (error) => set({ error }),

  setFilters: (filters) => {
    const { contacts } = get();
    const filteredContacts = applyFilters(contacts, filters);
    set({ filters, filteredContacts });
  },

  addContact: (contact) => {
    const { contacts, filters } = get();
    const newContacts = [...contacts, contact];
    const filteredContacts = applyFilters(newContacts, filters);
    set({ contacts: newContacts, filteredContacts });
  },

  updateContact: (id, updates) => {
    const { contacts, filters } = get();
    const newContacts = contacts.map((contact) =>
      contact.id === id ? { ...contact, ...updates } : contact,
    );
    const filteredContacts = applyFilters(newContacts, filters);
    set({ contacts: newContacts, filteredContacts });
  },

  removeContact: (id) => {
    const { contacts, filters } = get();
    const newContacts = contacts.filter((contact) => contact.id !== id);
    const filteredContacts = applyFilters(newContacts, filters);
    set({ contacts: newContacts, filteredContacts });
  },

  // Computed getters
  getFavoriteContacts: () => {
    const { contacts } = get();
    return contacts.filter((contact) => contact.favorite);
  },

  getImportantContacts: () => {
    const { contacts } = get();
    return contacts.filter((contact) => contact.important);
  },

  getContactsByCompany: (company) => {
    const { contacts } = get();
    return contacts.filter((contact) => contact.company === company);
  },

  getContactsByLocation: (location) => {
    const { contacts } = get();
    return contacts.filter((contact) => 
      contact.location.toLowerCase().includes(location.toLowerCase())
    );
  },
}));