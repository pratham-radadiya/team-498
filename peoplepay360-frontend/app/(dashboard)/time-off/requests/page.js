import { Suspense } from "react";
import RequestsPage from "@/components/time-off/RequestsPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading requests..." />}>
      <RequestsPage />
    </Suspense>
  );
}
