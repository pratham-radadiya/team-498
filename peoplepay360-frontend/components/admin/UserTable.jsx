import Link from "next/link";
import StatusBadge from "@/components/common/StatusBadge";
import { ROLE_LABELS } from "@/lib/constants/roles";

export default function UserTable({ users }) {
  return (
    <div className="overflow-x-auto rounded-lg border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-zinc-900">
      <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
        <thead className="bg-zinc-50 dark:bg-zinc-800">
          <tr>
            <th scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
              User
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Role
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Status
            </th>
            <th scope="col" className="px-4 py-2.5 text-left font-medium text-zinc-600 dark:text-zinc-400">
              Created
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
          {users.map((user) => (
            <tr key={user.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
              <td className="px-4 py-2.5">
                <Link href={`/admin/users/${user.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                  {user.email}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-zinc-600 dark:text-zinc-400">{ROLE_LABELS[user.role] ?? user.role}</td>
              <td className="px-4 py-2.5">
                <StatusBadge status={user.status} />
              </td>
              <td className="px-4 py-2.5 text-zinc-500 dark:text-zinc-400">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : "—"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
