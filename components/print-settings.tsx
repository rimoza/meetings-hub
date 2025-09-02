"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { PrintService } from "@/lib/services/print-service";
import { useAutoPrint } from "@/hooks/use-auto-print";
import { Settings, Printer, History, BarChart3 } from "lucide-react";
import { toast } from "sonner";

export function PrintSettings() {
  const [settings, setSettings] = useState(PrintService.getPrintSettings());
  const [stats, setStats] = useState(PrintService.getPrintStatistics());
  const [printHistory, setPrintHistory] = useState(PrintService.getPrintHistory().slice(0, 10)); // Last 10 prints
  
  const { updateAutoPrintSettings } = useAutoPrint();

  useEffect(() => {
    // Refresh data when component mounts
    setStats(PrintService.getPrintStatistics());
    setPrintHistory(PrintService.getPrintHistory().slice(0, 10));
  }, []);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleSettingChange = (key: string, value: any) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    PrintService.savePrintSettings(newSettings);
    
    // Update auto-print settings if it's related
    if (['autoPrint', 'autoPrintDelay', 'showAutoPrintConfirmation'].includes(key)) {
      updateAutoPrintSettings({ [key]: value });
    } else {
      toast.success("Print settings updated");
    }
  };

  const clearPrintHistory = () => {
    PrintService.clearPrintLogs();
    setPrintHistory([]);
    setStats(PrintService.getPrintStatistics());
    toast.success("Print history cleared");
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString() + ' ' + 
           new Date(dateString).toLocaleTimeString();
  };

  return (
    <div className="space-y-6">
      {/* Auto-Print Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Settings className="h-5 w-5" />
            Auto-Print Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="auto-print">Enable Auto-Print</Label>
              <p className="text-sm text-muted-foreground">
                Automatically print cards when new appointments are created
              </p>
            </div>
            <Switch
              id="auto-print"
              checked={settings.autoPrint}
              onCheckedChange={(checked) => handleSettingChange('autoPrint', checked)}
            />
          </div>

          {settings.autoPrint && (
            <>
              <Separator />
              
              <div className="space-y-2">
                <Label htmlFor="auto-print-delay">Auto-Print Delay (milliseconds)</Label>
                <Input
                  id="auto-print-delay"
                  type="number"
                  min="0"
                  max="10000"
                  step="500"
                  value={settings.autoPrintDelay}
                  onChange={(e) => handleSettingChange('autoPrintDelay', parseInt(e.target.value))}
                />
                <p className="text-sm text-muted-foreground">
                  Delay before auto-printing starts (default: 2000ms)
                </p>
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <Label htmlFor="show-confirmation">Show Confirmation Dialog</Label>
                  <p className="text-sm text-muted-foreground">
                    Ask for confirmation before auto-printing
                  </p>
                </div>
                <Switch
                  id="show-confirmation"
                  checked={settings.showAutoPrintConfirmation}
                  onCheckedChange={(checked) => handleSettingChange('showAutoPrintConfirmation', checked)}
                />
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* General Print Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            General Print Settings
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label htmlFor="show-preview">Show Print Preview</Label>
              <p className="text-sm text-muted-foreground">
                Show preview before printing
              </p>
            </div>
            <Switch
              id="show-preview"
              checked={settings.showPreview}
              onCheckedChange={(checked) => handleSettingChange('showPreview', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="print-quality">Print Quality</Label>
            <Select
              value={settings.printQuality}
              onValueChange={(value) => handleSettingChange('printQuality', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="normal">Normal</SelectItem>
                <SelectItem value="high">High Quality</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="card-template">Card Template</Label>
            <Select
              value={settings.template}
              onValueChange={(value) => handleSettingChange('template', value)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="default">Default</SelectItem>
                <SelectItem value="professional">Professional</SelectItem>
                <SelectItem value="minimal">Minimal</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Print Statistics */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Print Statistics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
              <div className="text-sm text-muted-foreground">Total Prints</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{stats.today}</div>
              <div className="text-sm text-muted-foreground">Today</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{stats.thisWeek}</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{stats.thisMonth}</div>
              <div className="text-sm text-muted-foreground">This Month</div>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="grid grid-cols-3 gap-4">
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.byType.single}</div>
              <div className="text-xs text-muted-foreground">Single Prints</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.byType.batch}</div>
              <div className="text-xs text-muted-foreground">Batch Prints</div>
            </div>
            <div className="text-center">
              <div className="text-lg font-semibold">{stats.byType.auto}</div>
              <div className="text-xs text-muted-foreground">Auto Prints</div>
            </div>
          </div>

          {stats.failed > 0 && (
            <div className="mt-4 p-3 bg-red-50 rounded-lg">
              <div className="text-sm text-red-800">
                <strong>{stats.failed}</strong> print jobs failed. Check print history for details.
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Print History */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <History className="h-5 w-5" />
            Recent Print History
          </CardTitle>
          <Button variant="outline" size="sm" onClick={clearPrintHistory}>
            Clear History
          </Button>
        </CardHeader>
        <CardContent>
          {printHistory.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No print history available
            </div>
          ) : (
            <div className="space-y-2">
              {printHistory.map((log, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <div className="text-sm font-medium">
                      Appointment: {log.appointmentId}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      {formatDate(log.timestamp)}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.type === 'auto' ? 'bg-blue-100 text-blue-800' :
                      log.type === 'batch' ? 'bg-purple-100 text-purple-800' :
                      log.type === 'single' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.type}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      log.status === 'completed' ? 'bg-green-100 text-green-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {log.status || 'completed'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}