import { Suspense } from "react";
import AttendancePage from "@/components/attendance/AttendancePage";
import Spinner from "@/components/common/Spinner";

export default function Page() {
  return (
    <Suspense fallback={<Spinner label="Loading attendance..." />}>
      <AttendancePage />
    </Suspense>
  );
}
