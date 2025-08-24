"use client";

import { useState, useEffect } from "react";
import { Plus, FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ReportFilters } from "@/components/report-filters";
import { ReportCard } from "@/components/report-card";
import { ReportForm } from "@/components/report-form";
import { ReportsLoading } from "@/components/loading/reports-loading";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { useReportsStore } from "@/stores/reports-store";
import { useAuth } from "@/contexts/auth-context";
import { subscribeReports, createReport, updateReport as updateReportFirebase, deleteReport } from "@/lib/firebase/reports";
import type { Report } from "@/types/report";
import { toast } from "sonner";

export function ReportsPageClient() {
  const { user } = useAuth();
  const {
    filteredReports,
    isLoading,
    filters,
    setReports,
    setFilters,
    updateReport,
    removeReport,
  } = useReportsStore();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingReport, setEditingReport] = useState<Report | undefined>();

  useEffect(() => {
    if (!user?.uid) return;

    const unsubscribe = subscribeReports(user.uid, (reports) => {
      setReports(reports);
    });

    return unsubscribe;
  }, [user?.uid, setReports]);

  const handleCreateReport = () => {
    setEditingReport(undefined);
    setIsFormOpen(true);
  };

  const handleEditReport = (report: Report) => {
    setEditingReport(report);
    setIsFormOpen(true);
  };

  const handleDeleteReport = async (id: string) => {
    try {
      await deleteReport(id);
      removeReport(id);
      toast.success("Report deleted successfully");
    } catch (error) {
      console.error("Error deleting report:", error);
      toast.error("Failed to delete report");
    }
  };

  const handleFormSubmit = async (reportData: Omit<Report, "id" | "createdAt" | "updatedAt">) => {
    try {
      if (editingReport) {
        await updateReportFirebase(editingReport.id, reportData);
        updateReport(editingReport.id, reportData);
        toast.success("Report updated successfully");
      } else {
        await createReport(user!.uid, reportData, user?.name || user?.email || "Unknown User");
        toast.success("Report created successfully");
      }
      setIsFormOpen(false);
      setEditingReport(undefined);
    } catch (error) {
      console.error("Error submitting report:", error);
      toast.error(
        editingReport ? "Failed to update report" : "Failed to create report"
      );
    }
  };

  if (isLoading) {
    return <ReportsLoading />;
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
                    Reports
                  </h1>
                  <p className="text-xs sm:text-sm text-muted-foreground hidden sm:block">
                    Manage and organize your reports and documents
                  </p>
                </div>
                <Button onClick={handleCreateReport} className="shrink-0">
                  <Plus className="h-4 w-4 mr-2" />
                  New Report
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto px-3 py-4 sm:px-4 sm:py-6 md:px-6 md:py-8">
        {/* Filters */}
        <div className="mb-6">
          <ReportFilters
            filters={filters}
            onFiltersChange={setFilters}
          />
        </div>

        {/* Reports Display */}
        {filteredReports.length === 0 ? (
          <div className="text-center py-16">
            <FileText className="h-16 w-16 text-muted-foreground mx-auto mb-6" />
            <h3 className="text-xl font-semibold mb-2">No reports found</h3>
            <p className="text-muted-foreground text-center mb-6 max-w-md mx-auto">
              {filters.search || filters.createdBy !== "all"
                ? "Try adjusting your filters to see more reports"
                : "Create your first report to get started with document management"}
            </p>
            {(!filters.search && filters.createdBy === "all") && (
              <Button onClick={handleCreateReport}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Report
              </Button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredReports.map((report) => (
              <ReportCard
                key={report.id}
                report={report}
                onEdit={handleEditReport}
                onDelete={handleDeleteReport}
              />
            ))}
          </div>
        )}
      </main>

      <ReportForm
        report={editingReport}
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingReport(undefined);
        }}
        onSubmit={handleFormSubmit}
      />
    </div>
  );
}