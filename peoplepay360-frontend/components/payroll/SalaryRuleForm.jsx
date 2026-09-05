"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import FormField from "@/components/forms/FormField";
import OptionsSelect from "@/components/forms/OptionsSelect";
import Input from "@/components/ui/Input";
import Select from "@/components/ui/Select";
import Textarea from "@/components/ui/Textarea";
import Button from "@/components/ui/Button";
import { SALARY_CATEGORY, COMPUTATION_METHOD, PERCENTAGE_BASE } from "@/lib/constants/salary";

export default function SalaryRuleForm({
  rule,
  mode = "create",
  defaultStructureId,
  saving = false,
  onSubmit,
  onDelete,
  canEdit = true,
}) {
  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors, isDirty },
  } = useForm({
    defaultValues: {
      structureId: defaultStructureId ?? "",
      name: "",
      code: "",
      category: SALARY_CATEGORY.ALLOWANCE,
      sequence: 10,
      computationMethod: COMPUTATION_METHOD.FIXED,
      fixedAmount: "",
      percentageBase: PERCENTAGE_BASE.BASIC,
      percentageValue: "",
      formula: "",
    },
  });

  const computationMethod = useWatch({ control, name: "computationMethod" });

  useEffect(() => {
    if (rule) {
      reset({
        structureId: rule.structureId ?? "",
        name: rule.name ?? "",
        code: rule.code ?? "",
        category: rule.category ?? SALARY_CATEGORY.ALLOWANCE,
        sequence: rule.sequence ?? 10,
        computationMethod: rule.computationMethod ?? COMPUTATION_METHOD.FIXED,
        fixedAmount: rule.fixedAmount ?? "",
        percentageBase: rule.percentageBase ?? PERCENTAGE_BASE.BASIC,
        percentageValue: rule.percentageValue ?? "",
        formula: rule.formula ?? "",
      });
    }
  }, [rule, reset]);

  function submit(values) {
    const payload = {
      structureId: values.structureId,
      name: values.name,
      code: values.code,
      category: values.category,
      sequence: Number(values.sequence),
      computationMethod: values.computationMethod,
    };
    if (values.computationMethod === COMPUTATION_METHOD.FIXED) {
      payload.fixedAmount = Number(values.fixedAmount);
    } else if (values.computationMethod === COMPUTATION_METHOD.PERCENTAGE) {
      payload.percentageBase = values.percentageBase;
      payload.percentageValue = Number(values.percentageValue);
    } else if (values.computationMethod === COMPUTATION_METHOD.FORMULA) {
      payload.formula = values.formula;
    }
    onSubmit(payload);
  }

  return (
    <form onSubmit={handleSubmit(submit)} className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <FormField label="Salary Structure" htmlFor="structureId" required error={errors.structureId?.message}>
          <OptionsSelect
            id="structureId"
            optionsUrl="/api/salary-structures/options"
            placeholder="— Select structure —"
            disabled={!canEdit || mode === "edit"}
            invalid={Boolean(errors.structureId)}
            {...register("structureId", { required: "Salary structure is required" })}
          />
        </FormField>

        <FormField label="Rule Name" htmlFor="name" required error={errors.name?.message}>
          <Input
            id="name"
            disabled={!canEdit}
            invalid={Boolean(errors.name)}
            {...register("name", { required: "Rule name is required" })}
          />
        </FormField>

        <FormField label="Code" htmlFor="code" required error={errors.code?.message} hint="Unique per structure — used in formulas, e.g. categories.BASIC">
          <Input
            id="code"
            disabled={!canEdit}
            invalid={Boolean(errors.code)}
            {...register("code", { required: "Code is required" })}
          />
        </FormField>

        <FormField label="Category" htmlFor="category">
          <Select id="category" disabled={!canEdit} {...register("category")}>
            {Object.values(SALARY_CATEGORY).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        <FormField label="Sequence" htmlFor="sequence" required error={errors.sequence?.message} hint="Execution order — lower runs first">
          <Input
            id="sequence"
            type="number"
            disabled={!canEdit}
            invalid={Boolean(errors.sequence)}
            {...register("sequence", { required: "Sequence is required" })}
          />
        </FormField>

        <FormField label="Computation Method" htmlFor="computationMethod">
          <Select id="computationMethod" disabled={!canEdit} {...register("computationMethod")}>
            {Object.values(COMPUTATION_METHOD).map((value) => (
              <option key={value} value={value}>
                {value}
              </option>
            ))}
          </Select>
        </FormField>

        {computationMethod === COMPUTATION_METHOD.FIXED && (
          <FormField label="Fixed Amount" htmlFor="fixedAmount" required error={errors.fixedAmount?.message}>
            <Input
              id="fixedAmount"
              type="number"
              step="0.01"
              disabled={!canEdit}
              invalid={Boolean(errors.fixedAmount)}
              {...register("fixedAmount", { required: "Fixed amount is required" })}
            />
          </FormField>
        )}

        {computationMethod === COMPUTATION_METHOD.PERCENTAGE && (
          <>
            <FormField label="Percentage Base" htmlFor="percentageBase">
              <Select id="percentageBase" disabled={!canEdit} {...register("percentageBase")}>
                {Object.values(PERCENTAGE_BASE).map((value) => (
                  <option key={value} value={value}>
                    {value}
                  </option>
                ))}
              </Select>
            </FormField>

            <FormField
              label="Percentage Value"
              htmlFor="percentageValue"
              required
              error={errors.percentageValue?.message}
              hint="e.g. 50 = 50%"
            >
              <Input
                id="percentageValue"
                type="number"
                step="0.01"
                disabled={!canEdit}
                invalid={Boolean(errors.percentageValue)}
                {...register("percentageValue", { required: "Percentage value is required" })}
              />
            </FormField>
          </>
        )}
      </div>

      {computationMethod === COMPUTATION_METHOD.FORMULA && (
        <FormField
          label="Formula"
          htmlFor="formula"
          required
          error={errors.formula?.message}
          hint="e.g. categories.BASIC + categories.HRA — only {categories, wage, workedDays} are available"
        >
          <Textarea
            id="formula"
            disabled={!canEdit}
            invalid={Boolean(errors.formula)}
            {...register("formula", { required: "Formula is required" })}
          />
        </FormField>
      )}

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
  );
}
