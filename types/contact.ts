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
  important: boolean;
  favorite: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ContactFilters {
  search: string;
  tags: string[];
  important: boolean | "all";
  favorite: boolean | "all";
  company?: string;
  location?: string;
}

export type ContactTitle = Contact["title"];

export const CONTACT_TITLES: ContactTitle[] = [
  "Mr",
  "Mrs",
  "Ms",
];