import { PrintSettings } from "@/components/print-settings";

export default function PrintSettingsPage() {
  return (
    <div className="container mx-auto px-4 py-6 max-w-4xl">
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Print Settings</h1>
          <p className="text-muted-foreground">
            Configure your print preferences and view printing statistics
          </p>
        </div>
        
        <PrintSettings />
      </div>
    </div>
  );
}