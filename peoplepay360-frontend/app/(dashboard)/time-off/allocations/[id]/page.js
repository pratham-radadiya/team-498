import { Suspense } from "react";
import AllocationFormPage from "@/components/time-off/AllocationFormPage";
import Spinner from "@/components/common/Spinner";

export default async function Page({ params }) {
  const { id } = await params;
  return (
    <Suspense fallback={<Spinner label="Loading allocation..." />}>
      <AllocationFormPage allocationId={id} />
    </Suspense>
  );
}
