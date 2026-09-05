import { Suspense } from "react";
import SalaryRuleFormPage from "@/components/payroll/SalaryRuleFormPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <SalaryRuleFormPage />
    </Suspense>
  );
}
