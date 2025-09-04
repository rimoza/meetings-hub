"use client";

import { useState, useEffect } from "react";
import {
  collection,
  query,
  onSnapshot,
  doc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import { db } from "@/lib/firebase/config";
import { useAuth } from "@/contexts/auth-context";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Check, X, UserCog, Clock, ShieldCheck, ShieldX, UserX } from "lucide-react";
import { toast } from "sonner";

interface UserData {
  uid: string;
  email: string | null;
  name: string | null;
  status: 'pending' | 'approved' | 'denied' | 'suspended';
  role: 'admin' | 'user';
  createdAt: Date;
  lastLoginAt: Date;
}

export function UserManagementClient() {
  const [users, setUsers] = useState<UserData[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedUser, setSelectedUser] = useState<UserData | null>(null);
  const [denyDialogOpen, setDenyDialogOpen] = useState(false);
  const [denyReason, setDenyReason] = useState("");
  const { user: currentUser } = useAuth();

  useEffect(() => {
    if (!db) {
      toast.error("Database not available");
      setLoading(false);
      return;
    }

    const q = query(collection(db, "users"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const userData = snapshot.docs.map((doc) => ({
        ...doc.data(),
        uid: doc.id,
        createdAt: doc.data().createdAt?.toDate() || new Date(),
        lastLoginAt: doc.data().lastLoginAt?.toDate() || new Date(),
      })) as UserData[];
      
      setUsers(userData.sort((a, b) => {
        // Sort by status (pending first), then by creation date
        if (a.status === 'pending' && b.status !== 'pending') return -1;
        if (a.status !== 'pending' && b.status === 'pending') return 1;
        return b.createdAt?.getTime() - a.createdAt?.getTime();
      }));
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const handleApproveUser = async (userId: string) => {
    if (!db) {
      toast.error("Database not available");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: 'approved',
        approvedBy: currentUser?.uid,
        approvedAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
      
      toast.success("User approved", {
        description: "The user has been granted access to the application.",
      });
    } catch (error) {
      console.error("Error approving user:", error);
      toast.error("Error", {
        description: "Failed to approve user. Please try again.",
      });
    }
  };

  const handleDenyUser = async () => {
    if (!selectedUser || !db) return;
    
    try {
      const userRef = doc(db, "users", selectedUser.uid);
      await updateDoc(userRef, {
        status: 'denied',
        deniedBy: currentUser?.uid,
        deniedAt: serverTimestamp(),
        denialReason: denyReason,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("User denied", {
        description: "The user's access request has been denied.",
      });
      
      setDenyDialogOpen(false);
      setSelectedUser(null);
      setDenyReason("");
    } catch (error) {
      console.error("Error denying user:", error);
      toast.error("Error", {
        description: "Failed to deny user. Please try again.",
      });
    }
  };

  const handleRoleChange = async (userId: string, newRole: string) => {
    if (!db) {
      toast.error("Database not available");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        role: newRole,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Role updated", {
        description: `User role has been changed to ${newRole}.`,
      });
    } catch (error) {
      console.error("Error updating role:", error);
      toast.error("Error", {
        description: "Failed to update user role. Please try again.",
      });
    }
  };

  const handleStatusChange = async (userId: string, newStatus: string) => {
    if (!db) {
      toast.error("Database not available");
      return;
    }

    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        status: newStatus,
        updatedAt: serverTimestamp(),
      });
      
      toast.success("Status updated", {
        description: `User status has been changed to ${newStatus}.`,
      });
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Error", {
        description: "Failed to update user status. Please try again.",
      });
    }
  };

  const getRoleBadgeVariant = (role: string) => {
    switch (role) {
      case 'admin': return 'destructive';
      case 'user': return 'outline';
      default: return 'secondary';
    }
  };

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'approved': return 'default';
      case 'pending': return 'secondary';
      case 'denied': return 'destructive';
      case 'suspended': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <ShieldCheck className="h-3 w-3" />;
      case 'pending': return <Clock className="h-3 w-3" />;
      case 'denied': return <ShieldX className="h-3 w-3" />;
      case 'suspended': return <UserX className="h-3 w-3" />;
      default: return null;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  const statusCounts = {
    pending: users.filter(u => u.status === 'pending').length,
    approved: users.filter(u => u.status === 'approved').length,
    denied: users.filter(u => u.status === 'denied').length,
    suspended: users.filter(u => u.status === 'suspended').length,
  };

  return (
    <div className="flex flex-col items-center w-full">
      {/* Status Summary Cards - Centered */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6 w-full max-w-3xl mx-auto">
        <div className="bg-yellow-50 dark:bg-yellow-900/20 rounded-lg p-4 border border-yellow-200 dark:border-yellow-800 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <Clock className="h-5 w-5 text-yellow-600 dark:text-yellow-400" />
            <span className="text-sm font-medium text-yellow-900 dark:text-yellow-100">Pending</span>
          </div>
          <p className="text-3xl font-bold text-yellow-900 dark:text-yellow-100">{statusCounts.pending}</p>
        </div>
        <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-4 border border-green-200 dark:border-green-800 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <ShieldCheck className="h-5 w-5 text-green-600 dark:text-green-400" />
            <span className="text-sm font-medium text-green-900 dark:text-green-100">Approved</span>
          </div>
          <p className="text-3xl font-bold text-green-900 dark:text-green-100">{statusCounts.approved}</p>
        </div>
        <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <ShieldX className="h-5 w-5 text-red-600 dark:text-red-400" />
            <span className="text-sm font-medium text-red-900 dark:text-red-100">Denied</span>
          </div>
          <p className="text-3xl font-bold text-red-900 dark:text-red-100">{statusCounts.denied}</p>
        </div>
        <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800 flex flex-col items-center justify-center">
          <div className="flex items-center gap-2 mb-2">
            <UserX className="h-5 w-5 text-orange-600 dark:text-orange-400" />
            <span className="text-sm font-medium text-orange-900 dark:text-orange-100">Suspended</span>
          </div>
          <p className="text-3xl font-bold text-orange-900 dark:text-orange-100">{statusCounts.suspended}</p>
        </div>
      </div>

      {/* User Management Table */}
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCog className="h-5 w-5" />
            User Management
          </CardTitle>
          <CardDescription>
            Manage user access, roles, and permissions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Joined</TableHead>
                <TableHead>Last Login</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.uid}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{user.name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground">{user.email}</p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      variant={getStatusBadgeVariant(user.status) as any}
                      className="flex items-center gap-1 w-fit"
                    >
                      {getStatusIcon(user.status)}
                      <span className="capitalize">{user.status}</span>
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {currentUser?.role === 'admin' ? (
                      <Select
                        value={user.role}
                        onValueChange={(value) => handleRoleChange(user.uid, value)}
                        disabled={user.uid === currentUser.uid}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="user">User</SelectItem>
                        </SelectContent>
                      </Select>
                    ) : (
                      // eslint-disable-next-line @typescript-eslint/no-explicit-any
                      <Badge variant={getRoleBadgeVariant(user.role) as any}>
                        {user.role}
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    {user.createdAt?.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    {user.lastLoginAt?.toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      {user.status === 'pending' && (
                        <>
                          <Button
                            size="sm"
                            variant="default"
                            onClick={() => handleApproveUser(user.uid)}
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => {
                              setSelectedUser(user);
                              setDenyDialogOpen(true);
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </>
                      )}
                      {currentUser?.role === 'admin' && user.uid !== currentUser.uid && user.status !== 'pending' && (
                        <Select
                          value={user.status}
                          onValueChange={(value) => handleStatusChange(user.uid, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="suspended">Suspended</SelectItem>
                            <SelectItem value="denied">Denied</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={denyDialogOpen} onOpenChange={setDenyDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Deny User Access</DialogTitle>
            <DialogDescription>
              Are you sure you want to deny access for {selectedUser?.name || selectedUser?.email}?
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <Textarea
              placeholder="Reason for denial (optional)"
              value={denyReason}
              onChange={(e) => setDenyReason(e.target.value)}
            />
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDenyDialogOpen(false)}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDenyUser}>
              Deny Access
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}