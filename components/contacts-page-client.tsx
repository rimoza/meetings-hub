"use client";

import { useEffect, useState } from "react";
import { Plus, Users, LogOut, User as UserIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ContactCard } from "@/components/contact-card";
import { ContactForm } from "@/components/contact-form";
import { ContactFilters } from "@/components/contact-filters";
import { ThemeToggle } from "@/components/theme-toggle";
import { SidebarTrigger } from "@/components/ui/sidebar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { useAuth } from "@/contexts/auth-context";
import { useContactsStore } from "@/stores/contacts-store";
import { toast } from "sonner";
import type { Contact } from "@/types/contact";

// Firebase imports
import {
  createContact,
  updateContact,
  deleteContact,
  subscribeContacts,
  toggleContactFavorite,
  toggleContactImportant,
} from "@/lib/firebase/contacts";

export function ContactsPageClient() {
  const { user, logout } = useAuth();
  const {
    filteredContacts,
    isLoading,
    error,
    filters,
    setContacts,
    setLoading,
    setError,
    setFilters,
    removeContact,
  } = useContactsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingContact, setEditingContact] = useState<Contact | null>(null);

  // Get available filter options
  const allTags = Array.from(
    new Set(filteredContacts.flatMap(contact => contact.tags || []))
  ).sort();
  
  const allCompanies = Array.from(
    new Set(filteredContacts.filter(c => c.company).map(contact => contact.company!))
  ).sort();
  
  const allLocations = Array.from(
    new Set(filteredContacts.map(contact => contact.location))
  ).sort();

  // Subscribe to contacts data
  useEffect(() => {
    if (!user) {
      setContacts([]);
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

    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }, [user, setContacts, setLoading, setError]);

  const handleCreateContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("Please sign in to create contacts");
      return;
    }

    try {
      await createContact(user.uid, contactData);
      toast.success("Contact created successfully");
    } catch (error) {
      console.error("Error creating contact:", error);
      toast.error("Failed to create contact");
      throw error;
    }
  };

  const handleUpdateContact = async (contactData: Omit<Contact, "id" | "createdAt" | "updatedAt">) => {
    if (!user || !editingContact) {
      toast.error("Please sign in to update contacts");
      return;
    }

    try {
      await updateContact(editingContact.id, contactData);
      toast.success("Contact updated successfully");
      setEditingContact(null);
    } catch (error) {
      console.error("Error updating contact:", error);
      toast.error("Failed to update contact");
      throw error;
    }
  };

  const handleDeleteContact = async (contactId: string) => {
    if (!user) {
      toast.error("Please sign in to delete contacts");
      return;
    }

    try {
      await deleteContact(contactId);
      removeContact(contactId);
      toast.success("Contact deleted successfully");
    } catch (error) {
      console.error("Error deleting contact:", error);
      toast.error("Failed to delete contact");
    }
  };

  const handleEditContact = (contact: Contact) => {
    setEditingContact(contact);
    setIsFormOpen(true);
  };

  const handleViewContact = (contact: Contact) => {
    // For now, just show a toast. In the future, this could navigate to a detail page
    toast.info(`Viewing contact: ${contact.firstName} ${contact.lastName}`);
  };

  const handleToggleFavorite = async (contactId: string, favorite: boolean) => {
    if (!user) {
      toast.error("Please sign in to update contacts");
      return;
    }

    try {
      await toggleContactFavorite(contactId, favorite);
      toast.success(favorite ? "Added to favorites" : "Removed from favorites");
    } catch (error) {
      console.error("Error updating favorite status:", error);
      toast.error("Failed to update favorite status");
    }
  };

  const handleToggleImportant = async (contactId: string, important: boolean) => {
    if (!user) {
      toast.error("Please sign in to update contacts");
      return;
    }

    try {
      await toggleContactImportant(contactId, important);
      toast.success(important ? "Marked as important" : "Removed from important");
    } catch (error) {
      console.error("Error updating important status:", error);
      toast.error("Failed to update important status");
    }
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingContact(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Error logging out:", error);
      toast.error("Failed to log out");
    }
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view contacts.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading contacts</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 flex flex-col overflow-hidden">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="px-3 py-3 sm:px-4 sm:py-4">
          <div className="flex items-center gap-2">
            <SidebarTrigger className="md:hidden" />
            <div className="flex-1">
              <div className="flex items-start justify-between">
                <div className="flex-1 min-w-0">
                  <h1 className="text-lg sm:text-xl md:text-2xl font-bold text-foreground">
                    Contacts
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Manage your personal and professional contacts
                  </p>
                </div>

                {/* Action Buttons and User Menu */}
                <div className="flex items-center gap-2 ml-2">
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    size="sm"
                    className="hidden sm:inline-flex"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    <span className="hidden lg:inline">New Contact</span>
                    <span className="lg:hidden">New</span>
                  </Button>
                  <Button
                    onClick={() => setIsFormOpen(true)}
                    size="icon"
                    className="sm:hidden h-8 w-8"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  <ThemeToggle />
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full bg-primary/10"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent
                      className="w-56"
                      align="end"
                      forceMount
                    >
                      <DropdownMenuLabel className="font-normal">
                        <div className="flex flex-col space-y-1">
                          <p className="text-sm font-medium leading-none">
                            {user?.name || user?.email}
                          </p>
                          <p className="text-xs leading-none text-muted-foreground">
                            {user?.email}
                          </p>
                        </div>
                      </DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={handleLogout}
                        className="cursor-pointer"
                      >
                        <LogOut className="mr-2 h-4 w-4" />
                        Log out
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {/* Filters */}
        <div className="mb-6">
          <ContactFilters
            filters={filters}
            onFiltersChange={setFilters}
            availableTags={allTags}
            availableCompanies={allCompanies}
            availableLocations={allLocations}
          />
        </div>

        {/* Contacts Display */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {Array.from({ length: 6 }, (_, i) => (
              <div key={i} className="h-80 bg-muted animate-pulse rounded-lg" />
            ))}
          </div>
        ) : filteredContacts.length === 0 ? (
          <div className="flex flex-col items-center justify-center min-h-[400px] text-center py-12">
            <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              {filters.search || filters.important !== "all" || filters.favorite !== "all" || filters.tags.length > 0 || filters.company || filters.location
                ? "No contacts found"
                : "No contacts yet"
              }
            </h3>
            <p className="text-muted-foreground mb-4 max-w-md mx-auto">
              {filters.search || filters.important !== "all" || filters.favorite !== "all" || filters.tags.length > 0 || filters.company || filters.location
                ? "Try adjusting your search or filters to find what you're looking for."
                : "Get started by adding your first contact to organize your professional and personal network."
              }
            </p>
            {!(filters.search || filters.important !== "all" || filters.favorite !== "all" || filters.tags.length > 0 || filters.company || filters.location) && (
              <Button onClick={() => setIsFormOpen(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Add Your First Contact
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredContacts.map((contact, index) => (
              <ContactCard
                key={`${contact.id}-${index}-${contact.updatedAt.getTime()}`}
                contact={contact}
                onEdit={handleEditContact}
                onDelete={handleDeleteContact}
                onView={handleViewContact}
                onToggleFavorite={handleToggleFavorite}
                onToggleImportant={handleToggleImportant}
              />
            ))}
          </div>
        )}
      </main>

      {/* Contact Form Modal */}
      <ContactForm
        contact={editingContact}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingContact ? handleUpdateContact : handleCreateContact}
      />
    </div>
  );
}