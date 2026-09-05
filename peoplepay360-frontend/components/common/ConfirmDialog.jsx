"use client";

import Modal from "@/components/ui/Modal";
import Button from "@/components/ui/Button";

export default function ConfirmDialog({
  open,
  title = "Are you sure?",
  description,
  confirmLabel = "Confirm",
  loading = false,
  onConfirm,
  onCancel,
}) {
  return (
    <Modal open={open} onClose={onCancel} title={title}>
      {description && <p className="text-sm text-zinc-600 dark:text-zinc-400">{description}</p>}
      <div className="mt-4 flex justify-end gap-2">
        <Button variant="secondary" size="sm" onClick={onCancel} disabled={loading}>
          Cancel
        </Button>
        <Button variant="danger" size="sm" onClick={onConfirm} loading={loading}>
          {confirmLabel}
        </Button>
      </div>
    </Modal>
  );
}
