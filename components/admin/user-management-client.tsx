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
import { Check, X, UserCog } from "lucide-react";
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
      case 'suspended': return 'secondary';
      default: return 'outline';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <>
      <Card>
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
                    <Badge variant={getStatusBadgeVariant(user.status) as any}>
                      {user.status}
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
                      {user.status === 'approved' && currentUser?.role === 'admin' && user.uid !== currentUser.uid && (
                        <Select
                          value={user.status}
                          onValueChange={(value) => handleStatusChange(user.uid, value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="approved">Approved</SelectItem>
                            <SelectItem value="suspended">Suspend</SelectItem>
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
    </>
  );
}