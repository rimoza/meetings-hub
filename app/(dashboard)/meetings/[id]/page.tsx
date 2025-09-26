"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Edit,
  Trash2,
  CheckSquare,
  Clock,
  AlertCircle,
  Calendar,
  MapPin,
  Users,
  FileText,
  User as UserIcon,
  CheckCircle,
  Plus,
  Target,
  Award,
  Zap,
  Flame,
  Sparkles,
  Timer,
  Activity,
  CalendarDays,
  MessageSquare,
  UserCheck,
  Phone,
  Presentation,
  LogOut,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useMeetings } from "@/hooks/use-meetings";
import { useAuth } from "@/contexts/auth-context";
import { ThemeToggle } from "@/components/theme-toggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ProtectedRoute } from "@/components/protected-route";
import type { Meeting } from "@/types/meeting";
import { toast } from "sonner";

export default function MeetingDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const meetingId = params.id as string;

  const { user, logout } = useAuth();
  const { meetings, deleteMeeting, toggleMeetingCompletion, addMeetingNote, updateMeetingNoteType } = useMeetings();

  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [newNoteText, setNewNoteText] = useState("");
  const [noteType, setNoteType] = useState<"regular" | "follow-up">("regular");
  const [isAddingNote, setIsAddingNote] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const foundMeeting = meetings.find((m) => m.id === meetingId);
    if (foundMeeting) {
      setMeeting(foundMeeting);
    }
  }, [meetingId, meetings]);

  const handleDelete = () => {
    setIsDeleteDialogOpen(true);
  };

  const handleConfirmDelete = () => {
    if (meeting) {
      deleteMeeting(meeting.id);
      toast.success("Meeting deleted successfully");
      router.push("/meetings");
    }
    setIsDeleteDialogOpen(false);
  };

  const handleCancelDelete = () => {
    setIsDeleteDialogOpen(false);
  };

  const handleToggleComplete = () => {
    if (meeting) {
      toggleMeetingCompletion(meeting.id);
      toast.success("Meeting status updated");
    }
  };

  const handleLogout = () => {
    logout();
    window.location.href = "/login";
  };

  const handleEdit = () => {
    toast.info("Edit meeting functionality coming soon!");
  };

  const handleAddNote = async () => {
    if (!meeting || !newNoteText.trim()) return;

    setIsAddingNote(true);
    const noteText = newNoteText.trim();

    try {
      await addMeetingNote(
        meeting.id,
        noteText,
        noteType,
        user?.name || user?.email || "Anonymous"
      );
      toast.success("Note added successfully");
      setNewNoteText("");
      setNoteType("regular"); // Reset to default
      // Let the real-time subscription handle the UI update naturally
      // The subscription will automatically add the new note to the meeting
    } catch (error) {
      console.error("Error adding note:", error);
      toast.error("Failed to add note");
    } finally {
      setIsAddingNote(false);
    }
  };

  const handleUpdateNoteType = async (noteId: string, newType: "regular" | "follow-up") => {
    if (!meeting) return;

    try {
      await updateMeetingNoteType(meeting.id, noteId, newType);
      toast.success(`Note type updated to ${newType}`);
      // Let the real-time subscription handle the UI update naturally
      // The subscription will automatically update the meeting data
    } catch (error) {
      console.error("Error updating note type:", error);
      toast.error("Failed to update note type");
    }
  };

  const getStatusIcon = (completed: boolean) => {
    return completed ? <CheckCircle className="h-4 w-4" /> : <Clock className="h-4 w-4" />;
  };

  const getStatusColor = (completed: boolean) => {
    return completed
      ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
      : "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200";
  };

  const getPriorityColor = (priority: Meeting["priority"]) => {
    switch (priority) {
      case "high":
        return "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200";
      case "medium":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      case "low":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  const getTypeIcon = (type: Meeting["type"]) => {
    switch (type) {
      case "meeting":
        return <Users className="h-4 w-4" />;
      case "call":
        return <Phone className="h-4 w-4" />;
      case "interview":
        return <UserCheck className="h-4 w-4" />;
      case "presentation":
        return <Presentation className="h-4 w-4" />;
      default:
        return <Users className="h-4 w-4" />;
    }
  };

  const getTypeColor = (type: Meeting["type"]) => {
    switch (type) {
      case "meeting":
        return "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200";
      case "call":
        return "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200";
      case "interview":
        return "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200";
      case "presentation":
        return "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200";
      default:
        return "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200";
    }
  };

  if (!meeting) {
    return (
      <ProtectedRoute>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-4">Meeting not found</h2>
            <Button onClick={() => router.push("/meetings")}>
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Meetings
            </Button>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20">
        {/* Modern Header with Glass Effect */}
        <header className="sticky top-0 z-50 backdrop-blur-md bg-background/80 border-b border-border/50">
          <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left Section - Navigation */}
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => router.push("/meetings")}
                  className="flex items-center gap-2 hover:bg-muted/50 transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                  <span className="hidden sm:inline font-medium">Back to Meetings</span>
                  <span className="sm:hidden">Back</span>
                </Button>

                {/* Meeting Title with Creative Badge */}
                <div className="flex items-center gap-3">
                  <div className="h-8 w-1 bg-gradient-to-b from-primary to-primary/50 rounded-full"></div>
                  <div>
                    <h1 className="text-xl font-bold text-foreground truncate max-w-md">
                      {meeting.title}
                    </h1>
                    <div className="flex items-center gap-2 mt-1">
                      <Badge
                        variant="secondary"
                        className={`${getStatusColor(meeting.completed)} border-0 text-xs font-medium animate-pulse`}
                      >
                        {getStatusIcon(meeting.completed)}
                        <span className="ml-1 capitalize">
                          {meeting.completed ? "Completed" : "Scheduled"}
                        </span>
                      </Badge>
                      <Badge
                        variant="outline"
                        className={`${getPriorityColor(meeting.priority)} border-0 text-xs`}
                      >
                        {meeting.priority === "high" && <Flame className="h-3 w-3 mr-1" />}
                        {meeting.priority === "medium" && <Zap className="h-3 w-3 mr-1" />}
                        {meeting.priority === "low" && <Target className="h-3 w-3 mr-1" />}
                        {meeting.priority} priority
                      </Badge>
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Section - Actions */}
              <div className="flex items-center gap-2">
                {/* Quick Actions */}
                <div className="hidden sm:flex items-center gap-1">
                  <Button
                    onClick={handleToggleComplete}
                    variant={meeting.completed ? "default" : "outline"}
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    {meeting.completed ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Completed!
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Complete
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="sm"
                    className="hover:scale-105 transition-transform"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Button>
                </div>

                {/* Mobile Actions */}
                <div className="sm:hidden flex items-center gap-1">
                  <Button
                    onClick={handleToggleComplete}
                    variant={meeting.completed ? "default" : "outline"}
                    size="icon"
                    className="h-8 w-8"
                  >
                    {meeting.completed ? (
                      <Award className="h-4 w-4" />
                    ) : (
                      <CheckSquare className="h-4 w-4" />
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    size="icon"
                    className="h-8 w-8"
                  >
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>

                <ThemeToggle />

                {/* User Menu */}
                {user && (
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        variant="ghost"
                        className="relative h-9 w-9 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 hover:from-primary/30 hover:to-primary/10 transition-all"
                      >
                        <UserIcon className="h-4 w-4" />
                        <span className="sr-only">Toggle user menu</span>
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56">
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
                )}
              </div>
            </div>
          </div>
        </header>

        {/* Hero Section with Meeting Overview */}
        <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Progress Overview Hero */}
          <div className="mb-8">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-primary/5 via-background to-secondary/5 border border-border/50">
              <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
              <div className="relative p-8">
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                  {/* Left Side - Meeting Info */}
                  <div className="flex-1 space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                          meeting.completed ? "bg-green-500/20" :
                          meeting.type === "call" ? "bg-green-500/20" :
                          meeting.type === "interview" ? "bg-purple-500/20" :
                          meeting.type === "presentation" ? "bg-orange-500/20" :
                          "bg-blue-500/20"
                        }`}>
                          {getTypeIcon(meeting.type)}
                        </div>
                        {meeting.completed && (
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-green-500 rounded-full flex items-center justify-center">
                            <Sparkles className="w-3 h-3 text-white" />
                          </div>
                        )}
                      </div>
                      <div>
                        <h2 className="text-3xl font-bold text-foreground">{meeting.title}</h2>
                        <p className="text-muted-foreground flex items-center gap-2">
                          <Activity className="h-4 w-4" />
                          Meeting Overview & Details
                        </p>
                      </div>
                    </div>

                    {/* Meeting Status */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="font-medium">Status</span>
                        <span className="text-muted-foreground">
                          {meeting.completed ? "Completed" : "Scheduled"}
                        </span>
                      </div>
                      <div className="w-full bg-muted rounded-full h-3 overflow-hidden">
                        <div
                          className={`h-full transition-all duration-1000 ease-out ${
                            meeting.completed ? "bg-green-500" : "bg-blue-500"
                          }`}
                          style={{
                            width: meeting.completed ? "100%" : "50%"
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Right Side - Quick Stats */}
                  <div className="flex flex-col sm:flex-row lg:flex-col gap-4">
                    <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-4">
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-primary">
                          {meeting.duration}
                        </div>
                        <div className="text-xs text-muted-foreground">Duration (min)</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-orange-500">
                          {meeting.attendees.length}
                        </div>
                        <div className="text-xs text-muted-foreground">Attendees</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-blue-500">
                          {meeting.type === "meeting" ? "👥" : meeting.type === "call" ? "📞" : meeting.type === "interview" ? "👤" : "📊"}
                        </div>
                        <div className="text-xs text-muted-foreground">Type</div>
                      </div>
                      <div className="text-center p-4 rounded-xl bg-card border border-border/50">
                        <div className="text-2xl font-bold text-purple-500">
                          {meeting.priority === "high" ? "🔥" : meeting.priority === "medium" ? "⚡" : "🎯"}
                        </div>
                        <div className="text-xs text-muted-foreground">Priority</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Main Content */}
            <div className="lg:col-span-2 space-y-6">
              {/* Meeting Details Card */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <FileText className="h-5 w-5 text-primary" />
                    Meeting Details
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                  {meeting.description && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <FileText className="h-4 w-4" />
                        Description
                      </h3>
                      <p className="text-muted-foreground leading-relaxed bg-muted/30 p-4 rounded-lg">
                        {meeting.description}
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <CalendarDays className="h-4 w-4 text-primary" />
                        Schedule & Location
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <Timer className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Date & Time:</span>
                          <span className="font-medium">{new Date(meeting.date).toLocaleDateString()} at {meeting.time}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <MapPin className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Location:</span>
                          <span className="font-medium">{meeting.location}</span>
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <Clock className="h-4 w-4 text-muted-foreground" />
                          <span className="text-muted-foreground">Duration:</span>
                          <span className="font-medium">{meeting.duration} minutes</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3">
                      <h4 className="font-medium text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Attendees & Type
                      </h4>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2">
                          <Badge className={`${getTypeColor(meeting.type)} border-0`}>
                            {getTypeIcon(meeting.type)}
                            <span className="ml-1 capitalize">
                              {meeting.type}
                            </span>
                          </Badge>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge className={`${getPriorityColor(meeting.priority)} border-0`}>
                            {meeting.priority === "high" && <Flame className="h-3 w-3" />}
                            {meeting.priority === "medium" && <Zap className="h-3 w-3" />}
                            {meeting.priority === "low" && <Target className="h-3 w-3" />}
                            {meeting.priority} priority
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Attendees List */}
                  {meeting.attendees && meeting.attendees.length > 0 && (
                    <div className="space-y-3">
                      <h3 className="font-semibold text-foreground flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Attendees ({meeting.attendees.length})
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {meeting.attendees.map((attendee, index) => (
                          <Badge key={index} variant="secondary" className="hover:scale-105 transition-transform">
                            <UserIcon className="h-3 w-3 mr-1" />
                            {attendee}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Notes */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <MessageSquare className="h-5 w-5 text-primary" />
                    Meeting Notes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {/* Add new note input */}
                  <div className="space-y-3 mb-4">
                    <div className="flex gap-2">
                      <Input
                        placeholder="Add a new note..."
                        value={newNoteText}
                        onChange={(e) => setNewNoteText(e.target.value)}
                        onKeyPress={(e) => {
                          if (e.key === "Enter") {
                            handleAddNote();
                          }
                        }}
                        disabled={isAddingNote}
                      />
                      <Select
                        value={noteType}
                        onValueChange={(value: "regular" | "follow-up") => setNoteType(value)}
                        disabled={isAddingNote}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="regular">Regular</SelectItem>
                          <SelectItem value="follow-up">Follow-up</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button
                        onClick={handleAddNote}
                        disabled={isAddingNote || !newNoteText.trim()}
                        size="icon"
                      >
                        {isAddingNote ? (
                          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                        ) : (
                          <Plus className="h-4 w-4" />
                        )}
                      </Button>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <span>Note Type:</span>
                      <Badge variant={noteType === "regular" ? "default" : "secondary"} className="text-xs">
                        <span className="mr-1">{noteType === "regular" ? "📝" : "🔄"}</span>
                        {noteType === "regular" ? "Regular Note" : "Follow-up"}
                      </Badge>
                    </div>
                  </div>

                  {/* Notes list */}
                  {meeting.meetingNotes && meeting.meetingNotes.length > 0 ? (
                    <div className="space-y-3">
                      {meeting.meetingNotes.map((note) => (
                        <div
                          key={note.id}
                          className="flex items-start gap-3 p-3 rounded-lg border group hover:shadow-sm transition-shadow"
                        >
                          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                            <MessageSquare className="h-4 w-4 text-primary" />
                          </div>
                          <div className="flex-1 space-y-1">
                            <p className="text-sm text-foreground">{note.content}</p>
                            <div className="flex items-center gap-2 text-xs text-muted-foreground">
                              <span>{new Date(note.timestamp).toLocaleString()}</span>
                              {note.author && <span>• {note.author}</span>}
                              <div className="flex items-center gap-1">
                                <Select
                                  value={note.type}
                                  onValueChange={(value: "regular" | "follow-up") => handleUpdateNoteType(note.id, value)}
                                >
                                  <SelectTrigger className="h-6 px-2 text-xs border-0 bg-transparent hover:bg-muted/50">
                                    <SelectValue />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="regular">
                                      <div className="flex items-center gap-2">
                                        <span>📝</span>
                                        <span>Regular Note</span>
                                      </div>
                                    </SelectItem>
                                    <SelectItem value="follow-up">
                                      <div className="flex items-center gap-2">
                                        <span>🔄</span>
                                        <span>Follow-up</span>
                                      </div>
                                    </SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      No notes yet. Add one above to get started!
                    </p>
                  )}
                </CardContent>
              </Card>

              {/* Meeting Metadata */}
              <Card className="border-border/50 shadow-sm hover:shadow-md transition-shadow">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-xl">
                    <Activity className="h-5 w-5 text-primary" />
                    Meeting Information
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Created:</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(meeting.createdAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Last Updated:</span>
                      <span className="ml-2 text-muted-foreground">
                        {new Date(meeting.updatedAt).toLocaleString()}
                      </span>
                    </div>
                    <div>
                      <span className="font-medium">Meeting ID:</span>
                      <span className="ml-2 text-muted-foreground font-mono text-xs">
                        {meeting.id}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Right Column - Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions Card */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Zap className="h-5 w-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button
                    onClick={handleToggleComplete}
                    variant={meeting.completed ? "default" : "outline"}
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    {meeting.completed ? (
                      <>
                        <Award className="h-4 w-4 mr-2" />
                        Meeting Completed! 🎉
                      </>
                    ) : (
                      <>
                        <CheckSquare className="h-4 w-4 mr-2" />
                        Mark as Complete
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleEdit}
                    variant="outline"
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    <Edit className="h-4 w-4 mr-2" />
                    Edit Meeting
                  </Button>

                  <Button
                    onClick={handleDelete}
                    variant="destructive"
                    className="w-full justify-start hover:scale-[1.02] transition-all"
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Meeting
                  </Button>
                </CardContent>
              </Card>

              {/* Meeting Stats Card */}
              <Card className="border-border/50 shadow-sm">
                <CardHeader className="pb-4">
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Activity className="h-5 w-5 text-primary" />
                    Meeting Stats
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 text-sm">
                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Date
                      </span>
                      <span className="text-muted-foreground">
                        {new Date(meeting.date).toLocaleDateString()}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Timer className="h-4 w-4 text-primary" />
                        Time
                      </span>
                      <span className="text-muted-foreground">
                        {meeting.time}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Clock className="h-4 w-4 text-primary" />
                        Duration
                      </span>
                      <span className="text-muted-foreground">
                        {meeting.duration} min
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <Users className="h-4 w-4 text-primary" />
                        Attendees
                      </span>
                      <span className="text-muted-foreground">
                        {meeting.attendees.length}
                      </span>
                    </div>

                    <div className="flex justify-between items-center p-3 rounded-lg bg-muted/30">
                      <span className="font-medium flex items-center gap-2">
                        <MapPin className="h-4 w-4 text-primary" />
                        Location
                      </span>
                      <span className="text-muted-foreground text-xs">
                        {meeting.location}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="h-5 w-5" />
              Delete Meeting
            </DialogTitle>
            <DialogDescription className="text-left">
              Are you sure you want to delete this meeting? This action cannot be undone and will permanently remove the meeting and all its associated data.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4">
            <div className="rounded-lg bg-muted/50 p-4 border border-destructive/20">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-destructive/10 flex items-center justify-center">
                  <AlertCircle className="h-5 w-5 text-destructive" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{meeting?.title}</p>
                  <p className="text-sm text-muted-foreground">
                    This meeting will be permanently deleted
                  </p>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter className="gap-2">
            <Button
              variant="outline"
              onClick={handleCancelDelete}
              className="hover:bg-muted/80"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              className="hover:bg-destructive/90"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete Meeting
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </ProtectedRoute>
  );
}