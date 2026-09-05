import { Suspense } from "react";
import ContractFormPage from "@/components/contracts/ContractFormPage";
import Spinner from "@/components/common/Spinner";

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner label="Loading contract..." />}>
      <ContractFormPage contractId={id} />
    </Suspense>
  );
}
