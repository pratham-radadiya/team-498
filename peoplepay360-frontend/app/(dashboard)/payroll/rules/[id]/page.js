import { Suspense } from "react";
import SalaryRuleFormPage from "@/components/payroll/SalaryRuleFormPage";
import Spinner from "@/components/common/Spinner";

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner label="Loading salary rule..." />}>
      <SalaryRuleFormPage ruleId={id} />
    </Suspense>
  );
}
