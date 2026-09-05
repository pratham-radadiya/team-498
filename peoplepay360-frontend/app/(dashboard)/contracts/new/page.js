import { Suspense } from "react";
import ContractFormPage from "@/components/contracts/ContractFormPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <ContractFormPage />
    </Suspense>
  );
}
