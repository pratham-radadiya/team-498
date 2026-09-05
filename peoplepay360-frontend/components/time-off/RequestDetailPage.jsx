"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import useTimeOffRequest from "@/hooks/timeOff/useTimeOffRequest";
import useEmployeeOptionsMap from "@/hooks/employees/useEmployeeOptionsMap";
import useTimeOffTypeOptionsMap from "@/hooks/timeOff/useTimeOffTypeOptionsMap";
import useRole from "@/hooks/auth/useRole";
import { deleteTimeOffRequest } from "@/lib/api/timeOffRequestApi";
import { TIME_OFF_STATUS } from "@/lib/constants/timeOff";
import PageHeader from "@/components/common/PageHeader";
import SkeletonForm from "@/components/common/SkeletonForm";
import ErrorState from "@/components/common/ErrorState";
import StatusBadge from "@/components/common/StatusBadge";
import ConfirmDialog from "@/components/common/ConfirmDialog";
import Button from "@/components/ui/Button";

function formatDate(value) {
  return value ? new Date(value).toLocaleDateString() : "—";
}

export default function RequestDetailPage({ requestId }) {
  const router = useRouter();
  const { request, loading, error, deciding, approve, refuse } = useTimeOffRequest(requestId);
  const employeeNames = useEmployeeOptionsMap();
  const typeNames = useTimeOffTypeOptionsMap();
  const { can } = useRole();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [actionError, setActionError] = useState(null);

  const canDecide = can("timeOffRequests", "approve");
  const isPending = request?.status === TIME_OFF_STATUS.PENDING;

  async function handleDelete() {
    setDeleting(true);
    try {
      await deleteTimeOffRequest(requestId);
      router.push("/time-off/requests");
    } catch (err) {
      setActionError(err.message);
      setDeleting(false);
      setDeleteOpen(false);
    }
  }

  async function handleDecision(action) {
    setActionError(null);
    try {
      await (action === "approve" ? approve() : refuse());
    } catch (err) {
      setActionError(err.message);
    }
  }

  if (loading) return <SkeletonForm fields={6} />;
  if (error) return <ErrorState message={error.message} />;

  return (
    <div className="flex flex-col gap-4">
      <PageHeader
        title="Time Off Request"
        description={request ? `${employeeNames.get(request.employeeId) || request.employeeId} · ${typeNames.get(request.typeId) || request.typeId}` : undefined}
      />
      {actionError && <p className="text-sm text-red-600 dark:text-red-400">{actionError}</p>}

      <div className="flex flex-col gap-4 rounded-lg border border-zinc-200 bg-white p-6 dark:border-zinc-800 dark:bg-zinc-900">
        <div className="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2">
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Status</dt>
            <dd className="mt-1">
              <StatusBadge status={request.status} />
            </dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Allocation Used</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{request.allocationId || "None (no allocation required)"}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Start Date</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{formatDate(request.startDate)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">End Date</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{formatDate(request.endDate)}</dd>
          </div>
          <div>
            <dt className="text-zinc-500 dark:text-zinc-400">Duration</dt>
            <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{request.duration}</dd>
          </div>
          {request.approverId && (
            <div>
              <dt className="text-zinc-500 dark:text-zinc-400">Approver</dt>
              <dd className="mt-1 font-medium text-zinc-900 dark:text-zinc-100">{request.approverId}</dd>
            </div>
          )}
        </div>

        {request.reason && (
          <div className="text-sm">
            <dt className="text-zinc-500 dark:text-zinc-400">Reason</dt>
            <dd className="mt-1 text-zinc-900 dark:text-zinc-100">{request.reason}</dd>
          </div>
        )}

        <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
          <div>
            {can("timeOffRequests", "delete") && (
              <Button variant="danger" size="sm" onClick={() => setDeleteOpen(true)}>
                Delete
              </Button>
            )}
          </div>
          {canDecide && isPending && (
            <div className="flex gap-2">
              <Button variant="secondary" size="sm" loading={deciding} onClick={() => handleDecision("refuse")}>
                Refuse
              </Button>
              <Button size="sm" loading={deciding} onClick={() => handleDecision("approve")}>
                Approve
              </Button>
            </div>
          )}
        </div>
      </div>

      <ConfirmDialog
        open={deleteOpen}
        title="Delete request"
        description="This will permanently delete this time off request."
        confirmLabel="Delete"
        loading={deleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteOpen(false)}
      />
    </div>
  );
}
