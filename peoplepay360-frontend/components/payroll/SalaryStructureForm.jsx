"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import Link from "next/link";
import { Plus } from "lucide-react";
import FormField from "@/components/forms/FormField";
import Input from "@/components/ui/Input";
import Button from "@/components/ui/Button";
import EmptyState from "@/components/common/EmptyState";

export default function SalaryStructureForm({ structure, mode = "create", saving = false, onSubmit, onDelete, canEdit = true }) {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isDirty },
  } = useForm({ defaultValues: { name: "", active: true } });

  useEffect(() => {
    if (structure) {
      reset({ name: structure.name ?? "", active: structure.active ?? true });
    }
  }, [structure, reset]);

  return (
    <div className="flex flex-col gap-6">
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <FormField label="Structure Name" htmlFor="name" required error={errors.name?.message}>
            <Input
              id="name"
              disabled={!canEdit}
              invalid={Boolean(errors.name)}
              {...register("name", { required: "Structure name is required" })}
            />
          </FormField>

          <label className="flex items-center gap-2 self-end pb-2 text-sm text-zinc-700 dark:text-zinc-300">
            <input
              type="checkbox"
              disabled={!canEdit}
              className="h-4 w-4 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-600 dark:border-zinc-600 dark:bg-zinc-800"
              {...register("active")}
            />
            Active
          </label>
        </div>

        {canEdit && (
          <div className="flex items-center justify-between border-t border-zinc-200 pt-4 dark:border-zinc-800">
            <div>
              {mode === "edit" && onDelete && (
                <Button type="button" variant="danger" size="sm" onClick={onDelete}>
                  Delete
                </Button>
              )}
            </div>
            <Button type="submit" loading={saving} disabled={mode === "edit" && !isDirty}>
              Save
            </Button>
          </div>
        )}
      </form>

      {mode === "edit" && (
        <div className="flex flex-col gap-2 border-t border-zinc-200 pt-6 dark:border-zinc-800">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              Rules ({structure?.rules?.length ?? 0})
            </h3>
            {canEdit && (
              <Link
                href={`/payroll/rules/new?structureId=${structure?.id}`}
                className="flex items-center gap-1.5 rounded-md bg-indigo-600 px-2.5 py-1.5 text-xs font-medium text-white hover:bg-indigo-500"
              >
                <Plus className="h-3.5 w-3.5" />
                Add Rule
              </Link>
            )}
          </div>

          {!structure?.rules?.length ? (
            <EmptyState title="No rules yet" description="Add rules in the order they should execute." />
          ) : (
            <div className="overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
              <table className="min-w-full divide-y divide-zinc-200 text-sm dark:divide-zinc-800">
                <thead className="bg-zinc-50 dark:bg-zinc-800">
                  <tr>
                    <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Seq</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Rule Name</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Code</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Category</th>
                    <th className="px-3 py-2 text-left font-medium text-zinc-600 dark:text-zinc-400">Computation</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
                  {[...structure.rules]
                    .sort((a, b) => a.sequence - b.sequence)
                    .map((rule) => (
                      <tr key={rule.id} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/60">
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{rule.sequence}</td>
                        <td className="px-3 py-2">
                          <Link href={`/payroll/rules/${rule.id}`} className="font-medium text-indigo-600 hover:underline dark:text-indigo-400">
                            {rule.name}
                          </Link>
                        </td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{rule.code}</td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{rule.category}</td>
                        <td className="px-3 py-2 text-zinc-600 dark:text-zinc-400">{rule.computationMethod}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
