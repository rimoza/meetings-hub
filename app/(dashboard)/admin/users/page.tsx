"use client";

import { useAuth } from "@/contexts/auth-context";
import { UserManagementClient } from "@/components/admin/user-management-client";
import { redirect } from "next/navigation";

export default function UsersPage() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  // Only admins can access user management
  if (user?.role !== 'admin') {
    redirect("/");
  }

  return <UserManagementClient />;
}