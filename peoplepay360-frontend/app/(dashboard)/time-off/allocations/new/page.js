import { Suspense } from "react";
import AllocationFormPage from "@/components/time-off/AllocationFormPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <AllocationFormPage />
    </Suspense>
  );
}
