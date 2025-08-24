"use client";

import { useEffect, useState } from "react";
import { Plus, Archive as ArchiveIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { PageHeader } from "@/components/ui/page-header";
import { ArchiveCard } from "@/components/archive-card";
import { ArchiveForm } from "@/components/archive-form";
import { ArchiveFilters } from "@/components/archive-filters";
import { useAuth } from "@/contexts/auth-context";
import { useArchivesStore } from "@/stores/archives-store";
import { toast } from "sonner";
import type { Archive } from "@/types/archive";

// Firebase imports
import {
  createArchive,
  updateArchive,
  deleteArchive,
  subscribeArchives,
} from "@/lib/firebase/archives";

export function ArchivesPageClient() {
  const { user } = useAuth();
  const {
    filteredArchives,
    isLoading,
    error,
    filters,
    setArchives,
    setLoading,
    setError,
    setFilters,
    removeArchive,
  } = useArchivesStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingArchive, setEditingArchive] = useState<Archive | null>(null);

  // Get available labels for filtering
  const allLabels = Array.from(
    new Set(filteredArchives.flatMap(archive => archive.labels))
  ).sort();

  // Subscribe to archives data
  useEffect(() => {
    if (!user) {
      setArchives([]);
      return;
    }

    setLoading(true);
    setError(null);

    const unsubscribe = subscribeArchives(
      user.uid,
      (archives) => {
        setArchives(archives);
        setError(null);
      }
    );

    // Return cleanup function
    return () => {
      unsubscribe();
    };
  }, [user, setArchives, setLoading, setError]);

  const handleCreateArchive = async (archiveData: Omit<Archive, "id" | "createdAt" | "updatedAt">) => {
    if (!user) {
      toast.error("Please sign in to create archives");
      return;
    }

    try {
      await createArchive(user.uid, archiveData);
      // Don't add optimistically - let the Firebase subscription handle it
      toast.success("Archive created successfully");
    } catch (error) {
      console.error("Error creating archive:", error);
      toast.error("Failed to create archive");
      throw error;
    }
  };

  const handleUpdateArchive = async (archiveData: Omit<Archive, "id" | "createdAt" | "updatedAt">) => {
    if (!user || !editingArchive) {
      toast.error("Please sign in to update archives");
      return;
    }

    try {
      await updateArchive(editingArchive.id, archiveData);
      // Don't update optimistically - let the Firebase subscription handle it
      toast.success("Archive updated successfully");
      setEditingArchive(null);
    } catch (error) {
      console.error("Error updating archive:", error);
      toast.error("Failed to update archive");
      throw error;
    }
  };

  const handleDeleteArchive = async (archiveId: string) => {
    if (!user) {
      toast.error("Please sign in to delete archives");
      return;
    }

    try {
      await deleteArchive(archiveId);
      removeArchive(archiveId);
      toast.success("Archive deleted successfully");
    } catch (error) {
      console.error("Error deleting archive:", error);
      toast.error("Failed to delete archive");
    }
  };

  const handleEditArchive = (archive: Archive) => {
    setEditingArchive(archive);
    setIsFormOpen(true);
  };

  const handleViewArchive = (archive: Archive) => {
    // For now, just show a toast. In the future, this could navigate to a detail page
    toast.info(`Viewing archive: ${archive.title}`);
  };

  const handleCloseForm = () => {
    setIsFormOpen(false);
    setEditingArchive(null);
  };

  if (!user) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <p className="text-muted-foreground">Please sign in to view archives.</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <p className="text-destructive mb-2">Error loading archives</p>
          <p className="text-sm text-muted-foreground">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Archives"
        description="Manage your archived documents and records"
        // icon={ArchiveIcon}
      >
        <Button onClick={() => setIsFormOpen(true)}>
          <Plus className="h-4 w-4 mr-2" />
          New Archive
        </Button>
      </PageHeader>

      <ArchiveFilters
        filters={filters}
        onFiltersChange={setFilters}
        availableLabels={allLabels}
      />

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }, (_, i) => (
            <div key={i} className="h-48 bg-muted animate-pulse rounded-lg" />
          ))}
        </div>
      ) : filteredArchives.length === 0 ? (
        <div className="flex flex-col items-center justify-center min-h-[400px] text-center">
          <ArchiveIcon className="h-16 w-16 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">
            {filters.search || filters.status !== "all" || filters.labels.length > 0
              ? "No archives found"
              : "No archives yet"
            }
          </h3>
          <p className="text-muted-foreground mb-4 max-w-md">
            {filters.search || filters.status !== "all" || filters.labels.length > 0
              ? "Try adjusting your search or filters to find what you're looking for."
              : "Get started by creating your first archive to organize your documents and records."
            }
          </p>
          {!(filters.search || filters.status !== "all" || filters.labels.length > 0) && (
            <Button onClick={() => setIsFormOpen(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Archive
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredArchives.map((archive, index) => (
            <ArchiveCard
              key={`${archive.id}-${index}-${archive.updatedAt.getTime()}`}
              archive={archive}
              onEdit={handleEditArchive}
              onDelete={handleDeleteArchive}
              onView={handleViewArchive}
            />
          ))}
        </div>
      )}

      <ArchiveForm
        archive={editingArchive}
        isOpen={isFormOpen}
        onClose={handleCloseForm}
        onSubmit={editingArchive ? handleUpdateArchive : handleCreateArchive}
      />
    </div>
  );
}