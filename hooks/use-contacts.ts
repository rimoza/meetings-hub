import { useEffect } from "react";
import { useContactsStore } from "@/stores/contacts-store";
import { useAuth } from "@/contexts/auth-context";
import { subscribeContacts } from "@/lib/firebase/contacts";

export function useContacts() {
  const { user } = useAuth();
  const {
    contacts,
    filteredContacts,
    isLoading,
    error,
    filters,
    setContacts,
    setLoading,
    setError,
    getFavoriteContacts,
    getImportantContacts,
    getContactsByCompany,
    getContactsByLocation,
  } = useContactsStore();

  useEffect(() => {
    if (!user) {
      setContacts([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeContacts(
      user.uid,
      (contacts) => {
        setContacts(contacts);
        setError(null);
      }
    );

    return unsubscribe;
  }, [user, setContacts, setLoading, setError]);

  const favoriteContacts = getFavoriteContacts();
  const importantContacts = getImportantContacts();

  // Get unique companies and locations for filtering
  const companies = Array.from(
    new Set(contacts.filter(c => c.company).map(c => c.company!))
  ).sort();
  
  const locations = Array.from(
    new Set(contacts.map(c => c.location))
  ).sort();

  const tags = Array.from(
    new Set(contacts.flatMap(c => c.tags || []))
  ).sort();

  return {
    contacts,
    filteredContacts,
    favoriteContacts,
    importantContacts,
    isLoading,
    error,
    filters,
    companies,
    locations,
    tags,
    // Helper functions
    getContactsByCompany,
    getContactsByLocation,
    // Stats for dashboard
    stats: {
      total: contacts.length,
      favorites: favoriteContacts.length,
      important: importantContacts.length,
      companies: companies.length,
      locations: locations.length,
    },
  };
}