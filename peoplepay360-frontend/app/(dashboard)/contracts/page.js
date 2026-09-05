import { Suspense } from "react";
import ContractsPage from "@/components/contracts/ContractsPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading contracts..." />}>
      <ContractsPage />
    </Suspense>
  );
}
