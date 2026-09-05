import { Suspense } from "react";
import RequestFormPage from "@/components/time-off/RequestFormPage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading..." />}>
      <RequestFormPage />
    </Suspense>
  );
}
