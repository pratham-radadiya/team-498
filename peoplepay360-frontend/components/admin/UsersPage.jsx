"use client";

import Link from "next/link";
import { Plus } from "lucide-react";
import useUsers from "@/hooks/admin/useUsers";
import PageHeader from "@/components/common/PageHeader";
import SkeletonTable from "@/components/common/SkeletonTable";
import ErrorState from "@/components/common/ErrorState";
import EmptyState from "@/components/common/EmptyState";
import UserTable from "@/components/admin/UserTable";

export default function UsersPage() {
  const { users, loading, error, refetch } = useUsers();

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="User Management"
        description="Create and manage user accounts linked to employee records."
        actions={
          <Link
            href="/admin/users/new"
            className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-indigo-600 px-3.5 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-500"
          >
            <Plus className="h-4 w-4" />
            New User
          </Link>
        }
      />

      {loading ? (
        <div className="overflow-hidden rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
          <SkeletonTable columns={4} />
        </div>
      ) : error ? (
        <ErrorState message={error.message} onRetry={refetch} />
      ) : users.length === 0 ? (
        <EmptyState title="No user accounts yet" description="Create the first user account for an employee." />
      ) : (
        <UserTable users={users} />
      )}
    </div>
  );
}
