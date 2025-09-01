export interface Contact {
  id: string;
  title?: "Mr" | "Mrs" | "Ms";
  firstName: string;
  lastName: string;
  email?: string;
  phone: string;
  alternativePhone?: string;
  company?: string;
  jobTitle?: string;
  location: string;
  address?: string;
  city?: string;
  state?: string;
  country?: string;
  postalCode?: string;
  notes?: string;
  tags?: string[];
  category?: ContactCategory;
  important: boolean;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFilters {
  search: string;
  tags: string[];
  category: ContactCategory | "all";
  important: boolean | "all";
  favorite: boolean | "all";
  company?: string;
  location?: string;
}

export type ContactTitle = Contact["title"];

export type ContactCategory = 
  | "friends"
  | "family" 
  | "colleagues"
  | "business"
  | "clients"
  | "vendors"
  | "personal"
  | "other";

export const CONTACT_TITLES: ContactTitle[] = [
  "Mr",
  "Mrs",
  "Ms",
];

export const CONTACT_CATEGORIES: { value: ContactCategory; label: string; icon: string }[] = [
  { value: "friends", label: "Friends", icon: "👥" },
  { value: "family", label: "Family", icon: "👨‍👩‍👧‍👦" },
  { value: "colleagues", label: "Colleagues", icon: "💼" },
  { value: "business", label: "Business", icon: "🏢" },
  { value: "clients", label: "Clients", icon: "🤝" },
  { value: "vendors", label: "Vendors", icon: "🏪" },
  { value: "personal", label: "Personal", icon: "👤" },
  { value: "other", label: "Other", icon: "📁" },
];