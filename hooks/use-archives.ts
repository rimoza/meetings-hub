import { useEffect } from "react";
import { useArchivesStore } from "@/stores/archives-store";
import { useAuth } from "@/contexts/auth-context";
import { subscribeArchives } from "@/lib/firebase/archives";

export function useArchives() {
  const { user } = useAuth();
  const {
    archives,
    filteredArchives,
    isLoading,
    error,
    filters,
    setArchives,
    setLoading,
    setError,
    getActiveArchives,
    getArchivedArchives,
    getDraftArchives,
  } = useArchivesStore();

  useEffect(() => {
    if (!user) {
      setArchives([]);
      setLoading(false);
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

    return unsubscribe;
  }, [user, setArchives, setLoading, setError]);

  const activeArchives = getActiveArchives();
  const archivedArchives = getArchivedArchives();
  const draftArchives = getDraftArchives();

  return {
    archives,
    filteredArchives,
    activeArchives,
    archivedArchives,
    draftArchives,
    isLoading,
    error,
    filters,
    // Stats for dashboard
    stats: {
      total: archives.length,
      active: activeArchives.length,
      archived: archivedArchives.length,
      drafts: draftArchives.length,
    },
  };
}