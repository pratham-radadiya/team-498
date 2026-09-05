import { Suspense } from "react";
import AllocationsPage from "@/components/time-off/AllocationsPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading allocations..." />}>
      <AllocationsPage />
    </Suspense>
  );
}
